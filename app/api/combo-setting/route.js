import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

const DEFAULT_SETTING = {
  maxComboItems: 1,
  comboDiscountPercent: 10,
};

export async function GET() {
  try {
    const setting = await prisma.comboSetting.findUnique({
      where: { id: 1 },
      select: {
        maxComboItems: true,
        comboDiscountPercent: true,
      },
    });

    return NextResponse.json(
      { setting: setting || DEFAULT_SETTING },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching combo setting:", error);
    return NextResponse.json(
      { setting: DEFAULT_SETTING, error: error.code || error.message },
      { status: 200 }
    );
  }
}
