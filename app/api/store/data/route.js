import prisma from "../../../../lib/prisma";
import { NextResponse } from "next/server";
import { getOrCreateSystemStore } from "../../../../lib/systemStore";

// Get system store info and products (B2C single-store mode)
export async function GET(request) {
  try {
    const systemStore = await getOrCreateSystemStore();

    const store = await prisma.store.findUnique({
      where: { id: systemStore.id, isActive: true },
      include: { Product: { include: { rating: true } } },
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 400 });
    }

    return NextResponse.json({ store });
  } catch (error) {
    console.error("Error fetching store data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
