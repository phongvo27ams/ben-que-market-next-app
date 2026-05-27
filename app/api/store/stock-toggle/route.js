import prisma from "../../../../lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import authAdmin from "../../../../middlewares/authAdmin";
import { getOrCreateSystemStore } from "../../../../lib/systemStore";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const { productId, inStock } = await request.json();

    if (!productId || Number.isNaN(Number(inStock)) || Number(inStock) < 0) {
      return NextResponse.json({ error: "Valid product ID and stock quantity are required" }, { status: 400 });
    }

    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const store = await getOrCreateSystemStore();
    const storeId = store.id;

    const product = await prisma.product.findFirst({
      where: { id: productId, storeId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found in system store" }, { status: 404 });
    }

    await prisma.product.update({
      where: { id: productId },
      data: { inStock: Number(inStock) },
    });

    return NextResponse.json({ message: "Product stock updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error updating product stock:", error);
    return NextResponse.json({ error: error.code || error.message }, { status: 400 });
  }
}
