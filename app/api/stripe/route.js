import prisma from "../../../lib/prisma";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Handle Stripe webhooks
export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");
    const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);

    const handlePaymentIndent = async (paymentIndentId, isPaid) => {
      const session = await stripe.checkout.sessions.list({
        payment_intent: paymentIndentId,
      });

      const { orderIds, userId, appId } = session.data[0].metadata;

      if (appId !== process.env.NEXT_PUBLIC_APP_ID) {
        return NextResponse.json({ received: true, message: "Invalid app ID" }, { status: 400 });
      }

      const orderIdsArray = orderIds.split(",");

      if (isPaid) {
        // Mark orders as paid
        await Promise.all(orderIdsArray.map(async (orderId) => {
          const order = await prisma.order.update({
            where: { id: orderId },
            data: { isPaid: true, },
            include: { orderItems: true },
          });

          await Promise.all(order.orderItems.map(async (item) => {
            const updatedProduct = await prisma.product.updateMany({
              where: {
                id: item.productId,
                inStock: { gte: item.quantity },
              },
              data: {
                inStock: { decrement: item.quantity },
              },
            });

            if (updatedProduct.count === 0) {
              throw new Error("Insufficient stock while finalizing Stripe payment");
            }
          }));
        }));

        // Clear user's cart
        await prisma.user.update({
          where: { id: userId },
          data: { cart: {} },
        });
      } else {
        // Delete unpaid orders
        await Promise.all(orderIdsArray.map(async (orderId) => {
          await prisma.order.delete({
            where: { id: orderId },
          });
        }));
      }
    }

    switch (event.type) {
      case "payment_intent.succeeded": {
        await handlePaymentIndent(event.data.object.id, true);
        break;
      }

      case "payment_intent.canceled": {
        await handlePaymentIndent(event.data.object.id, false);
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
        break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Error handling Stripe webhook:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export const config = {
  api: {
    bodyParser: false,
  }
}
