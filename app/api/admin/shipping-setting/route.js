import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import authAdmin from "../../../../middlewares/authAdmin";
import prisma from "../../../../lib/prisma";

const DEFAULT_SETTING = {
  id: 1,
  freeShipMinOrder: 200000,
  plusFreeShipMinOrder: 199000,
};

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);
    if (!isAdmin) return NextResponse.json({ message: "Unauthorized access" }, { status: 403 });

    const setting = await prisma.shippingSetting.upsert({
      where: { id: 1 },
      update: {},
      create: DEFAULT_SETTING,
    });

    return NextResponse.json({ setting }, { status: 200 });
  } catch (error) {
    console.error("Error fetching shipping setting:", error);
    return NextResponse.json({ error: error.code || error.message }, { status: 400 });
  }
}

export async function PUT(request) {
  try {
    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);
    if (!isAdmin) return NextResponse.json({ message: "Unauthorized access" }, { status: 403 });

    const { freeShipMinOrder, plusFreeShipMinOrder } = await request.json();
    const parsedFreeShipMinOrder = Number(freeShipMinOrder);
    const parsedPlusFreeShipMinOrder = Number(plusFreeShipMinOrder);

    if (!Number.isInteger(parsedFreeShipMinOrder) || parsedFreeShipMinOrder < 0) {
      return NextResponse.json({ error: "freeShipMinOrder must be a non-negative integer" }, { status: 400 });
    }
    if (!Number.isInteger(parsedPlusFreeShipMinOrder) || parsedPlusFreeShipMinOrder < 0) {
      return NextResponse.json({ error: "plusFreeShipMinOrder must be a non-negative integer" }, { status: 400 });
    }

    const setting = await prisma.shippingSetting.upsert({
      where: { id: 1 },
      update: {
        freeShipMinOrder: parsedFreeShipMinOrder,
        plusFreeShipMinOrder: parsedPlusFreeShipMinOrder,
      },
      create: {
        id: 1,
        freeShipMinOrder: parsedFreeShipMinOrder,
        plusFreeShipMinOrder: parsedPlusFreeShipMinOrder,
      },
    });

    return NextResponse.json({ message: "Shipping setting updated successfully", setting }, { status: 200 });
  } catch (error) {
    console.error("Error updating shipping setting:", error);
    return NextResponse.json({ error: error.code || error.message }, { status: 400 });
  }
}
