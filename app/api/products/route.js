import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

// Get all products available in the marketplace
export async function GET(request) {
  try {
    let products = await prisma.product.findMany({
      where: { inStock: { gt: 0 } },
      include: {
        rating: {
          select: {
            createdAt: true,
            rating: true,
            review: true,
            user: {
              select: {
                name: true,
                image: true,
              }
            }
          }
        },
        store: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Filter out products from inactive stores
    products = products.filter(product => product.store.isActive)
    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: error.code || error.message }, { status: 500 });
  }
}
