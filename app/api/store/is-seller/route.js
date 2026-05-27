import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

import authAdmin from "../../../../middlewares/authAdmin";
import { getOrCreateSystemStore } from "../../../../lib/systemStore";

// Backward-compatible endpoint for store dashboard auth in B2C mode.
export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const storeInfo = await getOrCreateSystemStore();

    return NextResponse.json({ isSeller: true, isAdmin: true, storeInfo, mode: "b2c" });
  } catch (error) {
    console.error("Error checking seller status:", error);
    return NextResponse.json({ error: error.code || error.message }, { status: 400 });
  }
}
