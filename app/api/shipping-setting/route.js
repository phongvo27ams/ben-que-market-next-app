import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

const DEFAULT_SETTING = {
  freeShipMinOrder: 200000,
  plusFreeShipMinOrder: 199000,
};

export async function GET() {
  try {
    const setting = await prisma.shippingSetting.findUnique({
      where: { id: 1 },
      select: {
        freeShipMinOrder: true,
        plusFreeShipMinOrder: true,
      },
    });

    return NextResponse.json({ setting: setting || DEFAULT_SETTING }, { status: 200 });
  } catch (error) {
    console.error("Error fetching shipping setting:", error);
    return NextResponse.json({ setting: DEFAULT_SETTING, error: error.code || error.message }, { status: 200 });
  }
}
