import prisma from "../../../../lib/prisma";
import getImageKit from "../../../../configs/imageKit";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import authSeller from "../../../../middlewares/authSeller";

const buildImageUrl = (imagekit, filePath) => imagekit.url({
  path: filePath,
  transformations: [
    { quality: "auto" },
    { format: "webp" },
    { width: "1024" }
  ]
});

const getImageKitFileReference = (url) => {
  const { IMAGEKIT_URL_ENDPOINT } = process.env;

  if (!IMAGEKIT_URL_ENDPOINT || !url?.startsWith(IMAGEKIT_URL_ENDPOINT)) {
    return null;
  }

  const parsedUrl = new URL(url);
  let relativePath = decodeURIComponent(parsedUrl.pathname);

  if (relativePath.startsWith("/")) {
    relativePath = relativePath.slice(1);
  }

  if (relativePath.startsWith("tr:")) {
    relativePath = relativePath.slice(relativePath.indexOf("/") + 1);
  }

  const lastSlashIndex = relativePath.lastIndexOf("/");
  const fileName = lastSlashIndex >= 0 ? relativePath.slice(lastSlashIndex + 1) : relativePath;
  const folderPath = lastSlashIndex >= 0 ? `/${relativePath.slice(0, lastSlashIndex + 1)}` : "/";

  return { fileName, folderPath };
};

const uploadImages = async (images) => {
  const imagekit = getImageKit();

  return Promise.all(images.map(async (image) => {
    const buffer = Buffer.from(await image.arrayBuffer());

    const response = await imagekit.upload({
      file: buffer,
      fileName: image.name,
      folder: "products"
    });

    return buildImageUrl(imagekit, response.filePath);
  }));
};

const deleteImageByUrl = async (url) => {
  const imagekit = getImageKit();
  const fileReference = getImageKitFileReference(url);

  if (!fileReference) {
    return;
  }

  const files = await imagekit.listFiles({
    path: fileReference.folderPath,
    name: fileReference.fileName,
    limit: 1,
  });
  const fileId = files[0]?.fileId;

  if (fileId) {
    await imagekit.deleteFile(fileId);
  }
};

const deleteImagesByUrls = async (urls = []) => {
  await Promise.all(urls.map(async (url) => {
    try {
      await deleteImageByUrl(url);
    } catch (error) {
      console.error("Error deleting image from ImageKit:", error);
    }
  }));
};

// Add a new product to the store
export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get data from the form
    const formData = await request.formData();
    const name = formData.get("name");
    const description = formData.get("description");
    const mrp = Number(formData.get("mrp"));
    const price = Number(formData.get("price"));
    const category = formData.get("category");
    const origin = formData.get("origin");
    const productionFacilityId = formData.get("productionFacilityId");
    const certification = formData.get("certification");
    const ocopStars = Number(formData.get("ocopStars") || 0);
    const images = formData.getAll("images");

    const inStock = Number(formData.get("inStock") || 0);

    if (!name || !description || !mrp || !price || !category || !origin || !productionFacilityId || !certification || images.length === 0) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (Number.isNaN(inStock) || inStock < 0) {
      return NextResponse.json({ error: "Stock quantity must be 0 or greater" }, { status: 400 });
    }

    if (Number.isNaN(ocopStars) || ocopStars < 0 || ocopStars > 5) {
      return NextResponse.json({ error: "OCOP stars must be between 0 and 5" }, { status: 400 });
    }

    const productionFacility = await prisma.productionFacility.findFirst({
      where: { id: productionFacilityId, storeId },
    });

    if (!productionFacility) {
      return NextResponse.json({ error: "Production facility not found" }, { status: 404 });
    }

    // Upload images to ImageKit
    const imageUrl = await uploadImages(images);

    await prisma.product.create({
      data: {
        storeId,
        name,
        description,
        mrp,
        price,
        category,
        origin,
        productionFacilityId,
        certification,
        ocopStars,
        inStock,
        images: imageUrl,
      }
    });

    return NextResponse.json({ message: "Product added successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error adding product:", error);
    return NextResponse.json({ error: error.code || error.message }, { status: 400 });
  }
}

// Get all products of the store
export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      where: { storeId },
      include: { productionFacility: true },
    });

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: error.code || error.message }, { status: 400 });
  }
}

// Update a product that belongs to the current store
export async function PUT(request) {
  try {
    const { userId } = getAuth(request);
    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const productId = formData.get("productId");
    const name = formData.get("name");
    const description = formData.get("description");
    const mrp = formData.get("mrp");
    const price = formData.get("price");
    const category = formData.get("category");
    const origin = formData.get("origin");
    const productionFacilityId = formData.get("productionFacilityId");
    const certification = formData.get("certification");
    const ocopStars = Number(formData.get("ocopStars") || 0);
    const inStock = Number(formData.get("inStock"));
    const retainedImages = JSON.parse(formData.get("retainedImages") || "[]");
    const newImages = formData.getAll("newImages").filter((image) => image?.size > 0);

    if (
      !productId ||
      !name ||
      !description ||
      Number.isNaN(Number(mrp)) ||
      Number.isNaN(Number(price)) ||
      Number.isNaN(inStock) ||
      Number.isNaN(ocopStars) ||
      inStock < 0 ||
      ocopStars < 0 ||
      ocopStars > 5 ||
      !category ||
      !origin ||
      !productionFacilityId ||
      !certification
    ) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const product = await prisma.product.findFirst({
      where: { id: productId, storeId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found or does not belong to your store" }, { status: 404 });
    }

    const productionFacility = await prisma.productionFacility.findFirst({
      where: { id: productionFacilityId, storeId },
    });

    if (!productionFacility) {
      return NextResponse.json({ error: "Production facility not found" }, { status: 404 });
    }

    const uploadedImageUrls = await uploadImages(newImages);
    const nextImages = [...retainedImages, ...uploadedImageUrls];

    if (nextImages.length === 0) {
      await deleteImagesByUrls(uploadedImageUrls);
      return NextResponse.json({ error: "Product must have at least one image" }, { status: 400 });
    }

    if (nextImages.length > 4) {
      await deleteImagesByUrls(uploadedImageUrls);
      return NextResponse.json({ error: "Product can have up to 4 images only" }, { status: 400 });
    }

    await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        description,
        mrp: Number(mrp),
        price: Number(price),
        category,
        origin,
        productionFacilityId,
        certification,
        ocopStars,
        inStock,
        images: nextImages,
      },
    });

    const removedImages = product.images.filter((imageUrl) => !retainedImages.includes(imageUrl));
    await deleteImagesByUrls(removedImages);

    return NextResponse.json({ message: "Product updated successfully", images: nextImages }, { status: 200 });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: error.code || error.message }, { status: 400 });
  }
}

// Delete a product that belongs to the current store
export async function DELETE(request) {
  try {
    const { userId } = getAuth(request);
    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const product = await prisma.product.findFirst({
      where: { id: productId, storeId },
      include: { orderItems: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found or does not belong to your store" }, { status: 404 });
    }

    if (product.orderItems.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete a product that already exists in orders" },
        { status: 400 }
      );
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    await deleteImagesByUrls(product.images);

    return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: error.code || error.message }, { status: 400 });
  }
}
