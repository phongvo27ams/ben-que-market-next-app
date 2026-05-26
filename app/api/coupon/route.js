import prisma from "../../../lib/prisma";
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { isPlusActiveMember } from "../../../lib/membership";

// Apply a coupon code for the authenticated user
export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const { code } = await request.json();

    const coupon = await prisma.coupon.findUnique({
      where: {
        code: code.toUpperCase(),
        expiresAt: { gt: new Date() }
      },
    });

    if (!coupon) {
      return NextResponse.json({ error: "Invalid or expired coupon code" }, { status: 404 });
    }

    if (coupon.forNewUser) {
      const userOrders = await prisma.order.findMany({
        where: { userId },
      });

      if (userOrders.length > 0) {
        return NextResponse.json({ error: "Coupon valid only for new users" }, { status: 400 });
      }
    }

    if (coupon.forMember) {
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          membershipPlan: true,
          membershipStatus: true,
        },
      });
      const hasPlusPlan = isPlusActiveMember(currentUser);
      if (!hasPlusPlan) {
        return NextResponse.json({ error: "Coupon valid only for Plus members" }, { status: 400 });
      }
    }

    return NextResponse.json({ coupon }, { status: 200 });
  } catch (error) {
    console.error("Error applying coupon:", error);
    return NextResponse.json({ error: error.code || error.message }, { status: 400 });
  }
}
