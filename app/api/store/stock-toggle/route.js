import prisma from "../../../../lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import authSeller from "../../../../middlewares/authSeller";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const { productId, inStock } = await request.json();

    if (!productId || Number.isNaN(Number(inStock)) || Number(inStock) < 0) {
      return NextResponse.json({ error: "Valid product ID and stock quantity are required" }, { status: 400 });
    }

    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const product = await prisma.product.findFirst({
      where: { id: productId, storeId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found or does not belong to your store" }, { status: 404 });
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
