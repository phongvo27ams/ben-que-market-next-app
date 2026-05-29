import prisma from "../../../../lib/prisma";
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { isPlusActiveMember } from "../../../../lib/membership";

const isCouponAvailable = (coupon) => {
  if (!coupon) return false;
  if (new Date(coupon.expiresAt) <= new Date()) return false;
  if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) return false;
  return true;
};

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const now = new Date();
    const baseCoupons = await prisma.coupon.findMany({
      where: {
        expiresAt: { gt: now },
      },
      orderBy: { createdAt: "desc" },
    });
    const coupons = baseCoupons.filter(isCouponAvailable);

    if (!coupons.length) {
      return NextResponse.json({ coupon: null, message: "" }, { status: 200 });
    }

    let hasPlusPlan = false;
    let hasAnyOrder = false;

    if (userId) {
      const [currentUser, orderCount] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: { membershipPlan: true, membershipStatus: true },
        }),
        prisma.order.count({ where: { userId } }),
      ]);
      hasPlusPlan = isPlusActiveMember(currentUser);
      hasAnyOrder = orderCount > 0;
    }

    const isNewMember = Boolean(userId) && !hasPlusPlan && !hasAnyOrder;

    const firstPlusCoupon = coupons.find((coupon) => coupon.forMember);
    const firstNewMemberCoupon = coupons.find((coupon) => coupon.forNewUser);
    const firstGeneralCoupon = coupons.find((coupon) => !coupon.forMember && !coupon.forNewUser);

    let selected = null;
    let message = "";

    if (hasPlusPlan && firstPlusCoupon) {
      selected = firstPlusCoupon;
      message = `Ưu đãi dành riêng cho thành viên Plus: giảm ${selected.discount}% với mã ${selected.code}`;
    } else if (isNewMember && firstNewMemberCoupon) {
      selected = firstNewMemberCoupon;
      message = `Ưu đãi thành viên mới: giảm ${selected.discount}% cho đơn đầu tiên với mã ${selected.code}`;
    } else if (firstGeneralCoupon) {
      selected = firstGeneralCoupon;
      message = `Ưu đãi hôm nay: giảm ${selected.discount}% với mã ${selected.code}`;
    }

    if (!selected) {
      return NextResponse.json({ coupon: null, message: "" }, { status: 200 });
    }

    return NextResponse.json({
      coupon: {
        code: selected.code,
        description: selected.description,
        discount: selected.discount,
      },
      message,
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching banner coupon:", error);
    return NextResponse.json({ coupon: null, message: "" }, { status: 200 });
  }
}
