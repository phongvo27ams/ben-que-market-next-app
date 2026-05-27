import prisma from "./prisma";

const SYSTEM_STORE_USERNAME = process.env.SYSTEM_STORE_USERNAME || "ben-que-market";

export const getOrCreateSystemStore = async () => {
  // 0) Prefer explicit system store marker.
  let markedSystemStore = await prisma.store.findFirst({
    where: { isSystem: true },
  });
  if (markedSystemStore) return markedSystemStore;

  const adminEmail = process.env.ADMIN_EMAIL?.split(",")[0]?.trim();
  if (!adminEmail) {
    throw new Error("ADMIN_EMAIL is required to bootstrap system store");
  }

  const adminUser = await prisma.user.findFirst({
    where: { email: adminEmail },
  });

  if (!adminUser) {
    throw new Error("Admin user record not found in database");
  }

  // 1) Prefer store already linked to admin user (avoids unique userId conflicts).
  let store = await prisma.store.findUnique({
    where: { userId: adminUser.id },
  });
  if (store) {
    if (!store.isSystem) {
      store = await prisma.store.update({
        where: { id: store.id },
        data: { isSystem: true, sellerDisabled: false, isActive: true, status: "approved" },
      });
    }
    return store;
  }

  // 2) Fallback to configured system store username.
  store = await prisma.store.findUnique({
    where: { username: SYSTEM_STORE_USERNAME },
  });
  if (store) {
    if (!store.isSystem) {
      store = await prisma.store.update({
        where: { id: store.id },
        data: { isSystem: true, sellerDisabled: false, isActive: true, status: "approved" },
      });
    }
    return store;
  }

  // 3) Create once; if concurrent request creates first, re-read by userId.
  try {
    store = await prisma.store.create({
      data: {
        userId: adminUser.id,
        name: "Ben Que Market",
        description: "System-managed B2C store",
        username: SYSTEM_STORE_USERNAME,
        address: "Vietnam",
        status: "approved",
        isActive: true,
        logo: "",
        email: adminEmail,
        contact: "",
        isSystem: true,
        sellerDisabled: false,
      },
    });
    return store;
  } catch (error) {
    if (error?.code === "P2002") {
      const existingStore = await prisma.store.findUnique({
        where: { userId: adminUser.id },
      });
      if (existingStore) return existingStore;
    }
    throw error;
  }
};
