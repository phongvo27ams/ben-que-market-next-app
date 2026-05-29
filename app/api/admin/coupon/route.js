import { getAuth } from "@clerk/nextjs/server";
import authAdmin from "../../../../middlewares/authAdmin";
import prisma from "../../../../lib/prisma";
import { NextResponse } from "next/server";
import { inngest } from "../../../../inngest/client";

// Create a new coupon
export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json(
        { message: "Unauthorized access" },
        { status: 403 }
      );
    }

    const { coupon } = await request.json();
    coupon.code = coupon.code.toUpperCase();
    coupon.maxUses = Number(coupon.maxUses || 0);
    coupon.usedCount = 0;
    // Treat selected expiration date as end-of-day (23:59:59.999) to avoid expiring mid-day.
    if (coupon.expiresAt) {
      const raw = String(coupon.expiresAt);
      if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        coupon.expiresAt = new Date(`${raw}T23:59:59.999`);
      } else {
        const date = new Date(raw);
        if (!Number.isNaN(date.getTime())) {
          date.setHours(23, 59, 59, 999);
          coupon.expiresAt = date;
        }
      }
    }

    const now = new Date();
    const hasLimitedStock = Number(coupon.maxUses || 0) > 0;
    const isNewTarget = Boolean(coupon.forNewUser);
    const isPlusTarget = Boolean(coupon.forMember);

    if (isNewTarget || isPlusTarget) {
      const existingTargetCoupon = await prisma.coupon.findFirst({
        where: {
          forNewUser: isNewTarget,
          forMember: isPlusTarget,
          expiresAt: { gt: now },
        },
        orderBy: { createdAt: "desc" },
      });

      if (existingTargetCoupon) {
        const existingHasStock = existingTargetCoupon.maxUses === 0
          || existingTargetCoupon.usedCount < existingTargetCoupon.maxUses;

        if (existingHasStock) {
          const targetLabel = isPlusTarget ? "PLUS" : "NEW";
          return NextResponse.json(
            {
              error: `Đã tồn tại mã ${targetLabel} còn hiệu lực và còn lượt sử dụng. Vui lòng chỉnh sửa mã hiện tại thay vì tạo mới.`,
            },
            { status: 400 }
          );
        }
      }
    }

    await prisma.coupon.create({
      data: coupon,
    }).then(async (coupon) => {
      await inngest.send({
        name: "app/coupon.expired",
        data: {
          code: coupon.code,
          expires_at: coupon.expiresAt,
        },
      });
    });

    return NextResponse.json({ message: "Coupon created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error creating coupon:", error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}

// Delete a coupon: DELETE /api/coupon?id=couponId
export async function DELETE(request) {
  try {
    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json(
        { message: "Unauthorized access" },
        { status: 403 }
      );
    }

    const { searchParams } = request.nextUrl;
    const code = searchParams.get("code");

    await prisma.coupon.delete({
      where: { code },
    });
    return NextResponse.json({ message: "Coupon deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json(
        { message: "Unauthorized access" },
        { status: 403 }
      );
    }

    const coupons = await prisma.coupon.findMany();
    return NextResponse.json({ coupons }, { status: 200 });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}

export async function PUT(request) {
  try {
    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json(
        { message: "Unauthorized access" },
        { status: 403 }
      );
    }

    const { code, coupon } = await request.json();
    const normalizedCode = String(code || "").toUpperCase();

    if (!normalizedCode) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const updatePayload = {
      description: coupon.description,
      discount: Number(coupon.discount),
      maxUses: Number(coupon.maxUses || 0),
      forNewUser: Boolean(coupon.forNewUser),
      forMember: Boolean(coupon.forMember),
      isPublic: Boolean(coupon.isPublic),
      expiresAt: coupon.expiresAt,
    };

    if (updatePayload.expiresAt) {
      const raw = String(updatePayload.expiresAt);
      if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        updatePayload.expiresAt = new Date(`${raw}T23:59:59.999`);
      } else {
        const date = new Date(raw);
        if (!Number.isNaN(date.getTime())) {
          date.setHours(23, 59, 59, 999);
          updatePayload.expiresAt = date;
        }
      }
    }

    if (updatePayload.maxUses > 0) {
      const current = await prisma.coupon.findUnique({
        where: { code: normalizedCode },
        select: { usedCount: true },
      });
      if (current && updatePayload.maxUses < current.usedCount) {
        return NextResponse.json({ error: "maxUses cannot be less than usedCount" }, { status: 400 });
      }
    }

    await prisma.coupon.update({
      where: { code: normalizedCode },
      data: updatePayload,
    });

    return NextResponse.json({ message: "Coupon updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error updating coupon:", error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}
