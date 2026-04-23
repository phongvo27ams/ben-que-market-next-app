import prisma from "../../../../lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import authSeller from "../../../../middlewares/authSeller";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let productionFacilities = await prisma.productionFacility.findMany({
      where: { storeId },
      orderBy: { name: "asc" },
    });

    if (productionFacilities.length === 0) {
      const store = await prisma.store.findUnique({
        where: { id: storeId },
      });

      if (store) {
        await prisma.productionFacility.create({
          data: {
            name: store.name || "Cơ sở sản xuất mặc định",
            address: store.address || "Chưa cập nhật",
            description: store.description || "Cơ sở sản xuất mặc định của cửa hàng",
            storeId,
          },
        });

        productionFacilities = await prisma.productionFacility.findMany({
          where: { storeId },
          orderBy: { name: "asc" },
        });
      }
    }

    return NextResponse.json({ productionFacilities }, { status: 200 });
  } catch (error) {
    console.error("Error fetching production facilities:", error);
    return NextResponse.json({ error: error.code || error.message }, { status: 400 });
  }
}
