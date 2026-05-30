import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DAY_MS = 24 * 60 * 60 * 1000;
const REVIEW_TEXTS = [
  "Sản phẩm đúng mô tả, chất lượng ổn định.",
  "Đóng gói tốt, giao hàng nhanh.",
  "Hương vị ngon, sẽ mua lại.",
  "Giá hợp lý, đáng thử.",
  "Phù hợp làm quà biếu.",
  "Mùi vị đặc trưng, cả nhà đều thích.",
  "Chất lượng đồng đều, không bị ngọt gắt.",
  "Nhận hàng đúng như kỳ vọng, sẽ ủng hộ tiếp.",
  "Sản phẩm tươi mới, ăn rất vừa miệng.",
  "Đáng tiền, phù hợp dùng hằng ngày.",
];

const AVATAR_BACKGROUNDS = [
  "0D8ABC",
  "16A34A",
  "F59E0B",
  "DC2626",
  "7C3AED",
  "0F766E",
  "DB2777",
  "1D4ED8",
  "B45309",
  "334155",
];

const LAST_NAMES = ["Bui", "Do", "Le", "Mai", "Nguyen", "Hoang", "Phan", "Tran", "Vo", "Vuong"];
const FIRST_NAMES_MALE = ["Anh", "Nam", "Phong", "Thanh", "Tuan"];
const FIRST_NAMES_FEMALE = ["Hoa", "Lan", "Linh", "Thu", "Trang"];
const NATURE_STREETS = [
  "Đường Hàng Me",
  "Đường Cây Dầu",
  "Đường Hoa Lan",
  "Đường Vàm Cỏ Tây",
  "Đường Bờ Tre",
  "Đường Sông Hậu",
  "Đường Bờ Cỏ Sả",
  "Đường Rặng Dừa",
  "Đường Hoa Sứ",
  "Đường Bến Nước",
];
const FREE_NEW_CUSTOMER_RATIO = 0.35;
const FREE_ONE_TIME_ONLY_RATIO = 0.4;

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[rand(0, arr.length - 1)];

const randomDateInDay = (dayStart) => {
  const offset = rand(0, DAY_MS - 1);
  return new Date(dayStart.getTime() + offset);
};

async function ensureCustomers(count = 154) {
  const existing = await prisma.user.findMany({
    where: { id: { startsWith: "sim_user_" } },
    select: { id: true },
  });

  const missing = [];
  for (let i = existing.length + 1; i <= count; i += 1) {
    const idx = String(i).padStart(4, "0");
    const firstName = pick([...FIRST_NAMES_MALE, ...FIRST_NAMES_FEMALE]);
    const lastName = pick(LAST_NAMES);
    const fullName = `${firstName} ${lastName}`;
    const emailLocal = `${firstName}${lastName}${rand(1000, 9999)}`.toLowerCase();
    const initial = (firstName?.[0] || "U").toUpperCase();
    const avatarBg = pick(AVATAR_BACKGROUNDS);
    const avatarUrl = `https://ui-avatars.com/api/?background=${avatarBg}&color=fff&size=256&name=${encodeURIComponent(initial)}`;

    const bucket = i % 10;
    const isPlusYearly = bucket === 0;
    const isPlusMonthly = bucket >= 1 && bucket <= 4;
    const membershipPlan = isPlusYearly || isPlusMonthly ? "plus" : "free";
    const membershipPeriod = isPlusYearly ? "yearly" : isPlusMonthly ? "monthly" : null;
    const membershipStatus = membershipPlan === "plus" ? "active" : "inactive";

    missing.push({
      id: `sim_user_${idx}`,
      name: fullName,
      email: `${emailLocal}@gmail.com`,
      image: avatarUrl,
      membershipPlan,
      membershipStatus,
      membershipPeriod,
      membershipStartedAt: membershipPlan === "plus" ? new Date(Date.now() - rand(20, 200) * DAY_MS) : null,
      membershipExpiresAt: membershipPlan === "plus" ? new Date(Date.now() + rand(30, 360) * DAY_MS) : null,
    });
  }

  if (missing.length) {
    await prisma.user.createMany({ data: missing });
  }

  return prisma.user.findMany({
    where: { id: { startsWith: "sim_user_" } },
  });
}

async function ensureAddresses(users) {
  for (const user of users) {
    const exists = await prisma.address.findFirst({
      where: { userId: user.id },
      select: { id: true },
    });
    if (exists) continue;
    await prisma.address.create({
      data: {
        userId: user.id,
        name: user.name,
        email: user.email,
        street: `${rand(1, 300)} ${pick(NATURE_STREETS)}`,
        city: "TP. Hồ Chí Minh",
        state: "TP. Hồ Chí Minh",
        zip: "700000",
        country: "Việt Nam",
        phone: `09${rand(10000000, 99999999)}`,
      },
    });
  }
}

async function main() {
  const products = await prisma.product.findMany({
    where: { inStock: { gt: 0 } },
  });
  if (!products.length) {
    throw new Error("Không có sản phẩm nào có tồn kho > 0 để mô phỏng.");
  }

  const storeId = products[0].storeId;
  const NEW_COUPON_CODE = "NEW-10-H9JM03";
  const PLUS_COUPON_CODE = "PLUS-20-G70LMW";
  const couponExpiry = new Date(Date.now() + 365 * DAY_MS);

  // Ensure the 2 target coupons always exist and have enough quota for simulation reruns.
  await prisma.coupon.upsert({
    where: { code: NEW_COUPON_CODE },
    create: {
      code: NEW_COUPON_CODE,
      description: "Holiday Sale",
      discount: 10,
      maxUses: 100000,
      usedCount: 0,
      forNewUser: true,
      forMember: false,
      isPublic: true,
      expiresAt: couponExpiry,
    },
    update: {
      discount: 10,
      maxUses: 100000,
      expiresAt: couponExpiry,
      forNewUser: true,
      forMember: false,
      isPublic: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: PLUS_COUPON_CODE },
    create: {
      code: PLUS_COUPON_CODE,
      description: "Holiday Sale",
      discount: 20,
      maxUses: 100000,
      usedCount: 0,
      forNewUser: false,
      forMember: true,
      isPublic: true,
      expiresAt: couponExpiry,
    },
    update: {
      discount: 20,
      maxUses: 100000,
      expiresAt: couponExpiry,
      forNewUser: false,
      forMember: true,
      isPublic: true,
    },
  });

  const coupons = await prisma.coupon.findMany({
    where: {
      code: { in: [NEW_COUPON_CODE, PLUS_COUPON_CODE] },
    },
  });
  const couponByCode = new Map(coupons.map((c) => [c.code, c]));
  const users = await ensureCustomers(154);
  await ensureAddresses(users);
  const freeUsers = users.filter((u) => u.membershipPlan !== "plus");
  const plusMonthlyUsers = users.filter((u) => u.membershipPlan === "plus" && (u.membershipPeriod || "").toLowerCase() === "monthly");
  const plusYearlyUsers = users.filter((u) => u.membershipPlan === "plus" && (u.membershipPeriod || "").toLowerCase() === "yearly");
  const freeNewUserSet = new Set(
    freeUsers
      .slice()
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(freeUsers.length * FREE_NEW_CUSTOMER_RATIO))
      .map((u) => u.id)
  );
  const freeOneTimeOnlySet = new Set(
    freeUsers
      .slice()
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(freeUsers.length * FREE_ONE_TIME_ONLY_RATIO))
      .map((u) => u.id)
  );
  const freeUserOrderCount = new Map();

  const addressMap = new Map();
  const addresses = await prisma.address.findMany({
    where: { userId: { in: users.map((u) => u.id) } },
  });
  addresses.forEach((a) => {
    if (!addressMap.has(a.userId)) addressMap.set(a.userId, []);
    addressMap.get(a.userId).push(a);
  });

  let orderCount = 0;
  let ratingCount = 0;

  for (let d = 89; d >= 0; d -= 1) {
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    dayStart.setDate(dayStart.getDate() - d);

    const dailyOrders = rand(8, 22);
    for (let i = 0; i < dailyOrders; i += 1) {
      const weightedRoll = Math.random();
      let userPool = freeUsers;
      if (weightedRoll < 0.45) {
        userPool = plusMonthlyUsers.length ? plusMonthlyUsers : users;
      } else if (weightedRoll < 0.75) {
        userPool = plusYearlyUsers.length ? plusYearlyUsers : users;
      } else {
        userPool = freeUsers.length ? freeUsers : users;
      }
      const user = pick(userPool);
      if (user.membershipPlan !== "plus") {
        const prevCount = freeUserOrderCount.get(user.id) || 0;
        const isOneTimeOnly = freeOneTimeOnlySet.has(user.id);
        const isNewFree = freeNewUserSet.has(user.id);
        const dayIndex = 89 - d;
        const isEarlyWindow = dayIndex < 30;

        if (isOneTimeOnly && prevCount >= 1) {
          continue;
        }
        // New free users appear later to mimic acquisition in recent period.
        if (isNewFree && isEarlyWindow) {
          continue;
        }
      }
      const userAddresses = addressMap.get(user.id) || [];
      if (!userAddresses.length) continue;
      const address = pick(userAddresses);

      let itemCount = rand(1, 2);
      let quantityMin = 1;
      let quantityMax = 2;
      if (user.membershipPlan === "plus" && (user.membershipPeriod || "").toLowerCase() === "monthly") {
        itemCount = rand(2, 3);
        quantityMax = 3;
      }
      if (user.membershipPlan === "plus" && (user.membershipPeriod || "").toLowerCase() === "yearly") {
        itemCount = rand(2, 4);
        quantityMax = 4;
      }

      const chosen = new Set();
      const items = [];
      for (let j = 0; j < itemCount; j += 1) {
        let p = pick(products);
        let guard = 0;
        while (chosen.has(p.id) && guard < 6) {
          p = pick(products);
          guard += 1;
        }
        chosen.add(p.id);
        const quantity = rand(quantityMin, quantityMax);
        let linePrice = Number(p.price);
        if (Math.random() < 0.22) {
          linePrice = Number((p.price * 0.9).toFixed(2));
        }
        items.push({ product: p, quantity, price: linePrice });
      }

      let subtotal = items.reduce((s, x) => s + x.price * x.quantity, 0);
      if (user.membershipPlan === "plus" && (user.membershipPeriod || "").toLowerCase() === "monthly") {
        subtotal *= 1.08;
      }
      if (user.membershipPlan === "plus" && (user.membershipPeriod || "").toLowerCase() === "yearly") {
        subtotal *= 1.18;
      }
      subtotal = Number(subtotal.toFixed(2));

      let usedCoupon = null;
      const couponChance =
        user.membershipPlan === "plus"
          ? (user.membershipPeriod || "").toLowerCase() === "yearly"
            ? 0.78
            : 0.68
          : 0.42;

      if (Math.random() < couponChance) {
        const targetCouponCode = user.membershipPlan === "plus" ? PLUS_COUPON_CODE : NEW_COUPON_CODE;
        const targetCoupon = couponByCode.get(targetCouponCode);
        const isAvailable =
          targetCoupon &&
          new Date(targetCoupon.expiresAt) > dayStart &&
          (targetCoupon.maxUses === 0 || targetCoupon.usedCount < targetCoupon.maxUses);

        if (isAvailable) {
          usedCoupon = targetCoupon;
          subtotal = subtotal - (subtotal * Number(usedCoupon.discount)) / 100;
          subtotal = Number(subtotal.toFixed(2));
          await prisma.coupon.update({
            where: { code: usedCoupon.code },
            data: { usedCount: { increment: 1 } },
          });
          targetCoupon.usedCount = Number(targetCoupon.usedCount || 0) + 1;
        }
      }

      const freeShipThreshold = user.membershipPlan === "plus" ? 199000 : 200000;
      const shippingFee = subtotal >= freeShipThreshold ? 0 : 50000;
      const total = Number((subtotal + shippingFee).toFixed(2));
      const createdAt = randomDateInDay(dayStart);
      const isStripe = Math.random() < 0.6;
      const status = pick(["ORDER_PLACED", "PROCESSING", "SHIPPED", "DELIVERED"]);

      const created = await prisma.order.create({
        data: {
          userId: user.id,
          storeId,
          addressId: address.id,
          total,
          paymentMethod: isStripe ? "STRIPE" : "COD",
          isPaid: isStripe ? true : Math.random() < 0.4,
          status,
          isCouponUsed: Boolean(usedCoupon),
          coupon: usedCoupon || {},
          createdAt,
          updatedAt: createdAt,
        },
      });

      for (const it of items) {
        await prisma.orderItem.create({
          data: {
            orderId: created.id,
            productId: it.product.id,
            quantity: it.quantity,
            price: it.price,
          },
        });
      }

      if (status === "DELIVERED" && Math.random() < 0.45) {
        const reviewItem = pick(items);
        await prisma.rating.create({
          data: {
            userId: user.id,
            productId: reviewItem.product.id,
            orderId: created.id,
            rating: pick([3, 4, 4, 5, 5]),
            review: pick(REVIEW_TEXTS),
            createdAt: new Date(createdAt.getTime() + rand(2, 72) * 60 * 60 * 1000),
          },
        }).catch(() => null);
        ratingCount += 1;
      }

      orderCount += 1;
      if (user.membershipPlan !== "plus") {
        freeUserOrderCount.set(user.id, (freeUserOrderCount.get(user.id) || 0) + 1);
      }
    }
  }

  console.log(`[SIM] Done. Added ${orderCount} orders and ~${ratingCount} ratings in last 90 days.`);
}

main()
  .catch((e) => {
    console.error("[SIM] Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
