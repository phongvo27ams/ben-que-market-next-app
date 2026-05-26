import prisma from "../../../lib/prisma";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { MEMBERSHIP_ACTIVE, PLUS_PLAN } from "../../../lib/membership";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const resolveSubscriptionPeriod = (subscription) => {
  const item = subscription?.items?.data?.[0];

  const start =
    subscription?.current_period_start ||
    item?.current_period_start ||
    null;

  const end =
    subscription?.current_period_end ||
    item?.current_period_end ||
    null;

  return { start, end };
};

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

      if (!session.data.length || !session.data[0].metadata) {
        return;
      }

      const { orderIds, userId, appId } = session.data[0].metadata;

      if (!orderIds || !userId || !appId) {
        return;
      }

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

    const handleMembershipCheckout = async (checkoutSessionObject) => {
      const metadata = checkoutSessionObject?.metadata || {};
      const subscriptionId = checkoutSessionObject?.subscription;
      const customerId = checkoutSessionObject?.customer;

      const { appId, userId, type, period } = metadata;

      if (type !== "plus_membership") return;
      if (!userId || !subscriptionId || !customerId) return;

      if ((appId || "") !== (process.env.NEXT_PUBLIC_APP_ID || "")) {
        return;
      }

      const subscription = await stripe.subscriptions.retrieve(subscriptionId.toString());
      const { start, end } = resolveSubscriptionPeriod(subscription);
      const membershipExpiresAt = end ? new Date(end * 1000) : null;
      const membershipStartedAt = start ? new Date(start * 1000) : new Date();

      await prisma.user.update({
        where: { id: userId },
        data: {
          membershipPlan: PLUS_PLAN,
          membershipStatus: MEMBERSHIP_ACTIVE,
          membershipPeriod: period === "yearly" ? "yearly" : "monthly",
          membershipStartedAt,
          membershipExpiresAt,
          stripeCustomerId: customerId.toString(),
          stripeSubscriptionId: subscriptionId.toString(),
        },
      });
    };

    const handleSubscriptionStatusChange = async (subscriptionObject) => {
      const subscriptionId = subscriptionObject?.id;
      if (!subscriptionId) return;

      const user = await prisma.user.findFirst({
        where: { stripeSubscriptionId: subscriptionId.toString() },
      });

      if (!user) return;

      const status = subscriptionObject.status || "";
      const isActive = ["active", "trialing"].includes(status);
      let periodSource = subscriptionObject;
      const { start, end } = resolveSubscriptionPeriod(periodSource);

      // Webhook payload can be compact; fetch full subscription if period is missing.
      if (!start || !end) {
        periodSource = await stripe.subscriptions.retrieve(subscriptionId.toString());
      }

      const period = resolveSubscriptionPeriod(periodSource);
      const membershipStartedAt = period.start ? new Date(period.start * 1000) : null;
      const membershipExpiresAt = period.end ? new Date(period.end * 1000) : null;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          membershipPlan: isActive ? PLUS_PLAN : "free",
          membershipStatus: isActive ? MEMBERSHIP_ACTIVE : "inactive",
          membershipStartedAt,
          membershipExpiresAt,
        },
      });
    };

    switch (event.type) {
      case "checkout.session.completed": {
        await handleMembershipCheckout(event.data.object);
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await handleSubscriptionStatusChange(event.data.object);
        break;
      }

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
