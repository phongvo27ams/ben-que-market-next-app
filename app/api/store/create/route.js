import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Tính năng đăng ký Seller đã ngừng hoạt động. Hệ thống hiện vận hành theo mô hình B2C (Admin quản trị)." },
      { status: 410 }
    );
  } catch (error) {
    console.error("Error creating store:", error);
    return NextResponse.json({ error: error.code || error.message }, { status: 400 });
  }
}

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ status: "disabled", mode: "b2c" });
  } catch (error) {
    console.error("Error fetching store:", error);
    return NextResponse.json({ error: error.code || error.message }, { status: 400 });
  }
}
