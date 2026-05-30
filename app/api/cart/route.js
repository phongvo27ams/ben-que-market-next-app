import prisma from "../../../lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const normalizeCartPayload = (cart) => {
  if (cart && typeof cart === "object" && !Array.isArray(cart) && cart.items) {
    const comboProductIds = Array.isArray(cart.comboProductIds)
      ? cart.comboProductIds
      : cart.comboProductId
      ? [cart.comboProductId]
      : [];
    return {
      items: cart.items || {},
      comboProductIds,
      comboLinks: cart.comboLinks || {},
    };
  }

  return {
    items: cart || {},
    comboProductIds: [],
    comboLinks: {},
  };
};

// Update user's cart
export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const { cart } = await request.json();
    const { items, comboProductIds, comboLinks } = normalizeCartPayload(cart);

    const productIds = Object.keys(items || {});
    const products = productIds.length > 0
      ? await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, inStock: true },
        })
      : [];

    const productMap = new Map(products.map((product) => [product.id, product.inStock]));
    const sanitizedCart = {};

    for (const [productId, quantity] of Object.entries(items || {})) {
      const availableStock = productMap.get(productId);
      if (typeof availableStock !== "number" || availableStock <= 0) continue;
      sanitizedCart[productId] = Math.min(Number(quantity) || 0, availableStock);
      if (sanitizedCart[productId] <= 0) {
        delete sanitizedCart[productId];
      }
    }

    const validComboProductIds = comboProductIds.filter((id) => Boolean(sanitizedCart[id]));
    const validComboLinks = {};
    for (const comboId of validComboProductIds) {
      const baseId = comboLinks?.[comboId];
      if (baseId && sanitizedCart[baseId]) validComboLinks[comboId] = baseId;
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        cart: {
          items: sanitizedCart,
          comboProductIds: validComboProductIds,
          comboLinks: validComboLinks,
          comboProductId: validComboProductIds[0] || null,
        },
      },
    });

    return NextResponse.json({
      message: "Cart updated successfully",
      cart: sanitizedCart,
      comboProductIds: validComboProductIds,
      comboLinks: validComboLinks,
      comboProductId: validComboProductIds[0] || null,
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating user cart:", error);
    return NextResponse.json({ error: error.code || error.message }, { status: 400 });
  }
}

// Get user's cart
export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    const { items, comboProductIds, comboLinks } = normalizeCartPayload(user?.cart || {});
    const productIds = Object.keys(items);
    const products = productIds.length > 0
      ? await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, inStock: true },
        })
      : [];
    const productMap = new Map(products.map((product) => [product.id, product.inStock]));
    const sanitizedCart = {};

    for (const [productId, quantity] of Object.entries(items)) {
      const availableStock = productMap.get(productId);
      if (typeof availableStock !== "number" || availableStock <= 0) continue;
      sanitizedCart[productId] = Math.min(Number(quantity) || 0, availableStock);
      if (sanitizedCart[productId] <= 0) {
        delete sanitizedCart[productId];
      }
    }

    const validComboProductIds = comboProductIds.filter((id) => Boolean(sanitizedCart[id]));
    const validComboLinks = {};
    for (const comboId of validComboProductIds) {
      const baseId = comboLinks?.[comboId];
      if (baseId && sanitizedCart[baseId]) validComboLinks[comboId] = baseId;
    }
    const nextCartData = {
      items: sanitizedCart,
      comboProductIds: validComboProductIds,
      comboLinks: validComboLinks,
      comboProductId: validComboProductIds[0] || null,
    };

    if (JSON.stringify(nextCartData) !== JSON.stringify(user?.cart || {})) {
      await prisma.user.update({
        where: { id: userId },
        data: { cart: nextCartData },
      });
    }

    return NextResponse.json({
      cart: sanitizedCart,
      comboProductIds: nextCartData.comboProductIds,
      comboLinks: nextCartData.comboLinks,
      comboProductId: nextCartData.comboProductId,
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user cart:", error);
    return NextResponse.json({ error: error.code || error.message }, { status: 400 });
  }
}
