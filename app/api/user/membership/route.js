import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { isPlusActiveMember } from "../../../../lib/membership";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ isPlus: false, membership: null }, { status: 200 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        membershipPlan: true,
        membershipStatus: true,
        membershipPeriod: true,
        membershipStartedAt: true,
        membershipExpiresAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ isPlus: false, membership: null }, { status: 200 });
    }

    return NextResponse.json(
      {
        isPlus: isPlusActiveMember(user),
        membership: user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching membership:", error);
    return NextResponse.json(
      {
        isPlus: false,
        membership: null,
        reason: "membership_fetch_failed",
        error: error.code || error.message,
      },
      { status: 200 }
    );
  }
}
