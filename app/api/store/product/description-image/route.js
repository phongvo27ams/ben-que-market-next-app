import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

import getImageKit from "../../../../../configs/imageKit";
import authSeller from "../../../../../middlewares/authSeller";

const buildImageUrl = (imagekit, filePath) => imagekit.url({
  path: filePath,
  transformations: [
    { quality: "auto" },
    { format: "webp" },
    { width: "1600" },
  ],
});

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const image = formData.get("image");

    if (!image || typeof image === "string") {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }

    const imagekit = getImageKit();
    const buffer = Buffer.from(await image.arrayBuffer());

    const response = await imagekit.upload({
      file: buffer,
      fileName: image.name,
      folder: `products/descriptions/${storeId}`,
    });

    const url = buildImageUrl(imagekit, response.filePath);

    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    console.error("Error uploading description image:", error);
    return NextResponse.json({ error: error.code || error.message }, { status: 400 });
  }
}
