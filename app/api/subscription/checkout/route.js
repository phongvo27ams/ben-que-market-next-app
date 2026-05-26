import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PERIOD_TO_PRICE_ID = {
  monthly: process.env.STRIPE_PRICE_PLUS_MONTHLY,
  yearly: process.env.STRIPE_PRICE_PLUS_YEARLY,
};
const PERIOD_TO_AMOUNT_VND = {
  monthly: 49000,
  yearly: 499000,
};

export async function POST(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { period } = await request.json();
    const normalizedPeriod = period === "yearly" ? "yearly" : "monthly";
    const priceId = PERIOD_TO_PRICE_ID[normalizedPeriod];
    const amount = PERIOD_TO_AMOUNT_VND[normalizedPeriod];

    const origin = request.headers.get("origin");
    const lineItem = priceId
      ? {
          price: priceId,
          quantity: 1,
        }
      : {
          price_data: {
            currency: "vnd",
            unit_amount: amount,
            recurring: {
              interval: normalizedPeriod === "yearly" ? "year" : "month",
            },
            product_data: {
              name: "Ben Que Market Plus",
              description:
                normalizedPeriod === "yearly"
                  ? "Gói thành viên Plus theo năm"
                  : "Gói thành viên Plus theo tháng",
            },
          },
          quantity: 1,
        };

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [lineItem],
      success_url: `${origin}/pricing?subscription=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?subscription=cancelled`,
      metadata: {
        appId: process.env.NEXT_PUBLIC_APP_ID || "",
        type: "plus_membership",
        userId,
        period: normalizedPeriod,
      },
    });

    return NextResponse.json({ session }, { status: 200 });
  } catch (error) {
    console.error("Error creating subscription checkout session:", error);
    return NextResponse.json({ error: error.code || error.message }, { status: 400 });
  }
}
