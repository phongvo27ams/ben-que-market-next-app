import prisma from "../../../lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const sanitizeWishlist = async (wishlist) => {
  const itemIds = Array.isArray(wishlist) ? [...new Set(wishlist.filter(Boolean))] : [];

  if (itemIds.length === 0) {
    return [];
  }

  const products = await prisma.product.findMany({
    where: { id: { in: itemIds } },
    select: { id: true },
  });

  const validProductIds = new Set(products.map((product) => product.id));
  return itemIds.filter((productId) => validProductIds.has(productId));
};

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const { wishlist } = await request.json();
    const sanitizedWishlist = await sanitizeWishlist(wishlist);

    await prisma.user.update({
      where: { id: userId },
      data: { wishlist: sanitizedWishlist },
    });

    return NextResponse.json(
      { message: "Wishlist updated successfully", wishlist: sanitizedWishlist },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating wishlist:", error);
    return NextResponse.json({ error: error.code || error.message }, { status: 400 });
  }
}

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { wishlist: true },
    });

    const currentWishlist = Array.isArray(user?.wishlist) ? user.wishlist : [];
    const sanitizedWishlist = await sanitizeWishlist(currentWishlist);

    if (JSON.stringify(sanitizedWishlist) !== JSON.stringify(currentWishlist)) {
      await prisma.user.update({
        where: { id: userId },
        data: { wishlist: sanitizedWishlist },
      });
    }

    return NextResponse.json({ wishlist: sanitizedWishlist }, { status: 200 });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json({ error: error.code || error.message }, { status: 400 });
  }
}
