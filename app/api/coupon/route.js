import prisma from "../../../lib/prisma";
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { isPlusActiveMember } from "../../../lib/membership";

// Apply a coupon code for the authenticated user
export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const { code } = await request.json();
    const normalizedCode = String(code || "").trim().toUpperCase();
    console.log("[COUPON][POST] start", { userId, code, normalizedCode });

    if (!normalizedCode) {
      console.log("[COUPON][POST] reject: empty code");
      return NextResponse.json({ error: "Hãy nhập mã giảm giá" }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: {
        code: normalizedCode,
      },
    });
    console.log("[COUPON][POST] coupon lookup", {
      found: Boolean(coupon),
      normalizedCode,
      now: new Date().toISOString(),
      coupon: coupon
        ? {
            code: coupon.code,
            expiresAt: coupon.expiresAt,
            forNewUser: coupon.forNewUser,
            forMember: coupon.forMember,
            maxUses: coupon.maxUses,
            usedCount: coupon.usedCount,
          }
        : null,
    });

    if (!coupon) {
      console.log("[COUPON][POST] reject: coupon not found in DB");
      return NextResponse.json({ error: "Không tìm thấy mã giảm giá trong hệ thống" }, { status: 404 });
    }

    if (new Date(coupon.expiresAt) <= new Date()) {
      console.log("[COUPON][POST] reject: expired", {
        expiresAt: coupon.expiresAt,
        now: new Date().toISOString(),
      });
      return NextResponse.json({ error: "Mã giảm giá đã hết hạn" }, { status: 400 });
    }

    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
      console.log("[COUPON][POST] reject: out of stock", {
        maxUses: coupon.maxUses,
        usedCount: coupon.usedCount,
      });
      return NextResponse.json({ error: "Mã giảm giá đã hết lượt sử dụng" }, { status: 400 });
    }

    if (coupon.forNewUser) {
      const userOrders = await prisma.order.findMany({
        where: { userId },
      });
      console.log("[COUPON][POST] forNewUser check", { userId, orderCount: userOrders.length });

      if (userOrders.length > 0) {
        console.log("[COUPON][POST] reject: not new user");
        return NextResponse.json({ error: "Mã giảm giá chỉ áp dụng cho người dùng mới" }, { status: 400 });
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
      console.log("[COUPON][POST] forMember check", {
        membershipPlan: currentUser?.membershipPlan,
        membershipStatus: currentUser?.membershipStatus,
        hasPlusPlan,
      });
      if (!hasPlusPlan) {
        console.log("[COUPON][POST] reject: not plus member");
        return NextResponse.json({ error: "Mã giảm giá chỉ áp dụng cho thành viên Plus" }, { status: 400 });
      }
    }

    console.log("[COUPON][POST] success", { code: coupon.code, userId });
    return NextResponse.json({ coupon }, { status: 200 });
  } catch (error) {
    console.error("Error applying coupon:", error);
    return NextResponse.json({ error: error.code || error.message }, { status: 400 });
  }
}
