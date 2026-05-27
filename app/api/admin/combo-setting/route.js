import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import authAdmin from "../../../../middlewares/authAdmin";
import prisma from "../../../../lib/prisma";

const DEFAULT_SETTING = {
  id: 1,
  maxComboItems: 1,
  comboDiscountPercent: 10,
};

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);
    if (!isAdmin) return NextResponse.json({ message: "Unauthorized access" }, { status: 403 });

    const setting = await prisma.comboSetting.upsert({
      where: { id: 1 },
      update: {},
      create: DEFAULT_SETTING,
    });

    return NextResponse.json({ setting }, { status: 200 });
  } catch (error) {
    console.error("Error fetching combo setting:", error);
    return NextResponse.json({ error: error.code || error.message }, { status: 400 });
  }
}

export async function PUT(request) {
  try {
    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);
    if (!isAdmin) return NextResponse.json({ message: "Unauthorized access" }, { status: 403 });

    const { maxComboItems, comboDiscountPercent } = await request.json();
    const parsedMaxItems = Number(maxComboItems);
    const parsedDiscount = Number(comboDiscountPercent);

    if (!Number.isInteger(parsedMaxItems) || parsedMaxItems < 1 || parsedMaxItems > 10) {
      return NextResponse.json({ error: "maxComboItems must be an integer between 1 and 10" }, { status: 400 });
    }
    if (Number.isNaN(parsedDiscount) || parsedDiscount <= 0 || parsedDiscount > 90) {
      return NextResponse.json({ error: "comboDiscountPercent must be between 1 and 90" }, { status: 400 });
    }

    const setting = await prisma.comboSetting.upsert({
      where: { id: 1 },
      update: {
        maxComboItems: parsedMaxItems,
        comboDiscountPercent: parsedDiscount,
      },
      create: {
        id: 1,
        maxComboItems: parsedMaxItems,
        comboDiscountPercent: parsedDiscount,
      },
    });

    return NextResponse.json({ message: "Combo setting updated successfully", setting }, { status: 200 });
  } catch (error) {
    console.error("Error updating combo setting:", error);
    return NextResponse.json({ error: error.code || error.message }, { status: 400 });
  }
}
