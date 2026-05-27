import prisma from "../../../../lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import authAdmin from "../../../../middlewares/authAdmin";
import { getOrCreateSystemStore } from "../../../../lib/systemStore";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const store = await getOrCreateSystemStore();
    const storeId = store.id;

    let productionFacilities = await prisma.productionFacility.findMany({
      where: { storeId },
      orderBy: { name: "asc" },
    });

    if (productionFacilities.length === 0) {
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
