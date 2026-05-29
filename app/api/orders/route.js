import prisma from "../../../lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { isPlusActiveMember } from "../../../lib/membership";
import { getOrCreateSystemStore } from "../../../lib/systemStore";

const getAvailableStock = (product) => Number(product?.inStock ?? 0);
const SHIPPING_FEE = 50000;
const STRIPE_CURRENCY = "vnd";
const PLUS_FREE_SHIP_MIN_ORDER = Number(process.env.PLUS_FREE_SHIP_MIN_ORDER || 199000);
const FREE_SHIP_MIN_ORDER = Number(process.env.FREE_SHIP_MIN_ORDER || 200000);
const DEFAULT_COMBO_DISCOUNT_PERCENT = 10;
const DEFAULT_MAX_COMBO_ITEMS = 1;

// Place a new order for the authenticated user
export async function POST(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { addressId, items, couponCode, paymentMethod } = await request.json();

    if (!addressId || !items || items.length === 0 || !Array.isArray(items) || !paymentMethod) {
      return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
    }

    let coupon = null;

    if (couponCode) {
      coupon = await prisma.coupon.findUnique({
        where: { code: couponCode },
      });

      if (!coupon) {
        return NextResponse.json({ error: "Mã giảm giá không hợp lệ hoặc đã hết hạn" }, { status: 404 });
      }
    }

    // Coupon validation for new users
    if (couponCode && coupon.forNewUser) {
      const userOrders = await prisma.order.findMany({
        where: { userId },
      });

      if (userOrders.length > 0) {
        return NextResponse.json({ error: "Mã giảm giá chỉ áp dụng cho người dùng mới" }, { status: 400 });
      }
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        membershipPlan: true,
        membershipStatus: true,
        cart: true,
      },
    });

    const isPlusMember = isPlusActiveMember(currentUser);

    if (couponCode && coupon.forMember) {
      if (!isPlusMember) {
        return NextResponse.json({ error: "Mã giảm giá chỉ áp dụng cho thành viên Plus" }, { status: 400 });
      }
    }

    const systemStore = await getOrCreateSystemStore();
    let orderIds = [];
    let fullAmount = 0;
    let subtotal = 0;
    const normalizedItems = [];

    // 1) Validate stock and compute subtotal (B2C single-system-store)
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.id } });
      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }

      if (item.quantity > getAvailableStock(product)) {
        return NextResponse.json(
          { error: `${product.name} only has ${getAvailableStock(product)} item(s) left in stock` },
          { status: 400 }
        );
      }

      normalizedItems.push({
        id: item.id,
        quantity: item.quantity,
        originalPrice: product.price,
        price: product.price,
      });
    }

    const comboSetting = await prisma.comboSetting.findUnique({
      where: { id: 1 },
      select: {
        maxComboItems: true,
        comboDiscountPercent: true,
      },
    });
    const maxComboItems = comboSetting?.maxComboItems || DEFAULT_MAX_COMBO_ITEMS;
    const comboDiscountPercent = comboSetting?.comboDiscountPercent || DEFAULT_COMBO_DISCOUNT_PERCENT;
    const shippingSetting = await prisma.shippingSetting.findUnique({
      where: { id: 1 },
      select: {
        freeShipMinOrder: true,
        plusFreeShipMinOrder: true,
      },
    });
    const freeShipMinOrder = shippingSetting?.freeShipMinOrder ?? FREE_SHIP_MIN_ORDER;
    const plusFreeShipMinOrder = shippingSetting?.plusFreeShipMinOrder ?? PLUS_FREE_SHIP_MIN_ORDER;

    const rawComboIds = Array.isArray(currentUser?.cart?.comboProductIds)
      ? currentUser.cart.comboProductIds
      : currentUser?.cart?.comboProductId
      ? [currentUser.cart.comboProductId]
      : [];
    const orderItemIdSet = new Set(normalizedItems.map((item) => item.id));
    const eligibleComboIds = isPlusMember
      ? rawComboIds.filter((id) => orderItemIdSet.has(id)).slice(0, maxComboItems)
      : [];

    for (const comboId of eligibleComboIds) {
      const comboItem = normalizedItems.find((item) => item.id === comboId);
      if (!comboItem) continue;
      comboItem.price = parseFloat((comboItem.originalPrice * (1 - comboDiscountPercent / 100)).toFixed(2));
    }

    subtotal = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    await prisma.$transaction(async (tx) => {
      let total = subtotal;
      if (couponCode && coupon) {
        total -= (coupon.discount / 100) * total;
      }

      const qualifiesFreeShip = isPlusMember
        ? total >= plusFreeShipMinOrder
        : total >= freeShipMinOrder;
      if (!qualifiesFreeShip) {
        total += SHIPPING_FEE;
      }

      fullAmount = parseFloat(total.toFixed(2));

      const order = await tx.order.create({
        data: {
          userId,
          storeId: systemStore.id,
          addressId,
          total: fullAmount,
          paymentMethod,
          isCouponUsed: !!coupon,
          coupon: coupon ? coupon : {},
          orderItems: {
            create: normalizedItems.map((it) => ({
              productId: it.id,
              quantity: it.quantity,
              price: it.price,
            })),
          },
        },
      });
      orderIds.push(order.id);

      if (coupon) {
        await tx.coupon.update({
          where: { code: coupon.code },
          data: {
            usedCount: { increment: 1 },
          },
        });
      }

      if (paymentMethod === "COD") {
        for (const item of items) {
          const updatedProduct = await tx.product.updateMany({
            where: {
              id: item.id,
              inStock: { gte: item.quantity },
            },
            data: {
              inStock: { decrement: item.quantity },
            },
          });

          if (updatedProduct.count === 0) {
            throw new Error("Một hoặc nhiều sản phẩm hiện không còn đủ số lượng yêu cầu.");
          }
        }
      }
    });

    if (paymentMethod === "STRIPE") {
      const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
      const origin = await request.headers.get("origin");

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: STRIPE_CURRENCY,
            product_data: {
              name: "Order",
            },
            unit_amount: Math.round(fullAmount),
          },
          quantity: 1,
        }],
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
        mode: "payment",
        success_url: `${origin}/loading?nextUrl=orders`,
        cancel_url: `${origin}/cart`,
        metadata: {
          orderIds: orderIds.join(","),
          userId,
          appId: process.env.NEXT_PUBLIC_APP_ID,
        }
      });
      return NextResponse.json({ session }, { status: 200 });
    }

    // Clear user's cart after placing order
    await prisma.user.update({
      where: { id: userId },
      data: { cart: {} },
    });

    return NextResponse.json({ message: "Order placed successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error placing order:", error);
    return NextResponse.json({ error: error.code || error.message }, { status: 400 });
  }
}

// Get orders for the authenticated user
export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: { product: true }
        },
        address: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: error.code || error.message }, { status: 400 });
  }
}
