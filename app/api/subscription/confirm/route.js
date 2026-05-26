import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "../../../../lib/prisma";
import { MEMBERSHIP_ACTIVE, PLUS_PLAN } from "../../../../lib/membership";

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

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ ok: false, reason: "not_authenticated" }, { status: 200 });
    }

    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ ok: false, reason: "missing_session_id" }, { status: 200 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const metadata = session.metadata || {};

    if ((metadata.appId || "") !== (process.env.NEXT_PUBLIC_APP_ID || "")) {
      return NextResponse.json({ ok: false, reason: "invalid_app_context" }, { status: 200 });
    }

    if (metadata.type !== "plus_membership") {
      return NextResponse.json({ ok: false, reason: "invalid_subscription_type" }, { status: 200 });
    }

    if (metadata.userId !== userId) {
      return NextResponse.json({ ok: false, reason: "session_user_mismatch" }, { status: 200 });
    }

    if (!session.subscription || !session.customer) {
      return NextResponse.json({ ok: false, reason: "session_missing_subscription_data" }, { status: 200 });
    }

    // Stripe subscription checkout may return "complete" while payment_status is not strictly "paid"
    // (for example due to SCA, trial, or async confirmation timing). We accept completed sessions.
    const isCompleted = session.status === "complete";
    const isPaid = session.payment_status === "paid";
    if (!isCompleted && !isPaid) {
      return NextResponse.json({ ok: false, reason: "session_not_completed_yet" }, { status: 200 });
    }

    const subscription = await stripe.subscriptions.retrieve(session.subscription.toString());
    const activeStatuses = ["active", "trialing", "past_due"];
    if (!activeStatuses.includes(subscription.status)) {
      return NextResponse.json({ ok: false, reason: "subscription_not_active_yet" }, { status: 200 });
    }
    const { start, end } = resolveSubscriptionPeriod(subscription);
    const membershipExpiresAt = end ? new Date(end * 1000) : null;
    const membershipStartedAt = start ? new Date(start * 1000) : new Date();

    await prisma.user.update({
      where: { id: userId },
      data: {
        membershipPlan: PLUS_PLAN,
        membershipStatus: MEMBERSHIP_ACTIVE,
        membershipPeriod: metadata.period === "yearly" ? "yearly" : "monthly",
        membershipStartedAt,
        membershipExpiresAt,
        stripeCustomerId: session.customer.toString(),
        stripeSubscriptionId: session.subscription.toString(),
      },
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Error confirming subscription:", error);
    return NextResponse.json(
      { ok: false, reason: "internal_error", error: error.code || error.message },
      { status: 200 }
    );
  }
}
