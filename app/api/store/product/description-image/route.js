import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

import getImageKit from "../../../../../configs/imageKit";
import authAdmin from "../../../../../middlewares/authAdmin";
import { getOrCreateSystemStore } from "../../../../../lib/systemStore";

const buildImageUrl = (imagekit, filePath) => imagekit.url({
  path: filePath,
  transformations: [
    { quality: "auto" },
    { format: "webp" },
    { width: "1600" },
  ],
});

export async function POST(request) {
  const startedAt = Date.now();
  try {
    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const store = await getOrCreateSystemStore();
    const storeId = store.id;

    const formData = await request.formData();
    const image = formData.get("image");
    const imageSize = image && typeof image !== "string" ? image.size : 0;
    const imageName = image && typeof image !== "string" ? image.name : null;

    if (!image || typeof image === "string") {
      console.log("[PRODUCT_IMAGE_UPLOAD] reject: missing image file", { userId, imageType: typeof image });
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }
    console.log("[PRODUCT_IMAGE_UPLOAD] start", { userId, storeId, imageName, imageSize });

    const imagekit = getImageKit();
    const buffer = Buffer.from(await image.arrayBuffer());

    const response = await imagekit.upload({
      file: buffer,
      fileName: image.name,
      folder: `products/descriptions/${storeId}`,
    });

    const url = buildImageUrl(imagekit, response.filePath);
    console.log("[PRODUCT_IMAGE_UPLOAD] success", {
      userId,
      storeId,
      imageName,
      imageSize,
      filePath: response.filePath,
      tookMs: Date.now() - startedAt,
    });

    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    console.error("[PRODUCT_IMAGE_UPLOAD] error", {
      message: error?.message,
      code: error?.code,
      status: error?.status ?? error?.response?.status,
      tookMs: Date.now() - startedAt,
    });
    return NextResponse.json({ error: error.code || error.message }, { status: 400 });
  }
}
