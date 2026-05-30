import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const before = await Promise.all([
    prisma.orderItem.count(),
    prisma.order.count(),
    prisma.rating.count(),
    prisma.address.count(),
  ]);

  console.log("[CLEAR] Before:", {
    orderItems: before[0],
    orders: before[1],
    ratings: before[2],
    addresses: before[3],
  });

  await prisma.$transaction(async (tx) => {
    await tx.orderItem.deleteMany({});
    await tx.order.deleteMany({});
    await tx.rating.deleteMany({});
    await tx.address.deleteMany({});
  });

  const after = await Promise.all([
    prisma.orderItem.count(),
    prisma.order.count(),
    prisma.rating.count(),
    prisma.address.count(),
  ]);

  console.log("[CLEAR] After:", {
    orderItems: after[0],
    orders: after[1],
    ratings: after[2],
    addresses: after[3],
  });
}

main()
  .catch((error) => {
    console.error("[CLEAR] Failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

