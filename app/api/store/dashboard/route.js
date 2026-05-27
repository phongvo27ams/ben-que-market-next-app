import prisma from "../../../../lib/prisma";
import authAdmin from "../../../../middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getOrCreateSystemStore } from "../../../../lib/systemStore";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }
    const store = await getOrCreateSystemStore();
    const storeId = store.id;

    const orders = await prisma.order.findMany({ where: { storeId } });
    const products = await prisma.product.findMany({ where: { storeId } });

    const ratings = await prisma.rating.findMany({
      where: { productId: { in: products.map(product => product.id) } },
      include: { user: true, product: true },
    });

    const dashboardData = {
      ratings,
      totalOrders: orders.length,
      totalEarnings: Math.round(orders.reduce((acc, order) => acc + order.total, 0)),
      totalProducts: products.length,
    }

    return NextResponse.json(dashboardData, { status: 200 });
  } catch (error) {
    console.log("Dashboard GET Error:", error);
    return NextResponse.json({ error: error.code || error.message }, { status: 400 });
  }
}
