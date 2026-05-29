import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import authAdmin from "../../../../middlewares/authAdmin";

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_ESTIMATED_PROFIT_MARGIN = Number(process.env.ESTIMATED_PROFIT_MARGIN_PERCENT || 35) / 100;

const startOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const sumRevenue = (orders) => orders.reduce((sum, order) => sum + Number(order.total || 0), 0);

const dateLabel = (date) => {
  const d = new Date(date);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}`;
};

const monthLabel = (date) => {
  const d = new Date(date);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${mm}/${d.getFullYear()}`;
};

const parsePeriod = (period) => (["week", "month", "year", "custom"].includes(period) ? period : "month");

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);
    if (!isAdmin) return NextResponse.json({ message: "Unauthorized access" }, { status: 403 });

    const period = parsePeriod(request.nextUrl.searchParams.get("period"));
    const fromParam = request.nextUrl.searchParams.get("from");
    const toParam = request.nextUrl.searchParams.get("to");
    const marginParam = Number(request.nextUrl.searchParams.get("marginPercent"));
    const safeMarginPercent = Number.isFinite(marginParam)
      ? Math.min(100, Math.max(0, marginParam))
      : Number((DEFAULT_ESTIMATED_PROFIT_MARGIN * 100).toFixed(2));
    const estimatedProfitMargin = safeMarginPercent / 100;
    const now = new Date();
    const todayStart = startOfDay(now);
    const tomorrowStart = new Date(todayStart.getTime() + DAY_MS);

    const rangeDays = period === "week" ? 7 : period === "month" ? 30 : period === "year" ? 365 : 30;
    let rangeStart = new Date(todayStart.getTime() - (rangeDays - 1) * DAY_MS);
    let rangeEnd = tomorrowStart;
    let customRangeDays = rangeDays;
    if (period === "custom" && fromParam && toParam) {
      const fromDate = startOfDay(new Date(fromParam));
      const toDate = startOfDay(new Date(toParam));
      if (!Number.isNaN(fromDate.getTime()) && !Number.isNaN(toDate.getTime()) && fromDate <= toDate) {
        rangeStart = fromDate;
        const lastDay = new Date(toDate.getTime() + DAY_MS);
        rangeEnd = lastDay;
        customRangeDays = Math.max(1, Math.round((lastDay - fromDate) / DAY_MS));
      }
    }
    const effectiveRangeDays = period === "custom" ? customRangeDays : rangeDays;
    const prevRangeStart = new Date(rangeStart.getTime() - effectiveRangeDays * DAY_MS);

    const [productsCount, ordersCount, paidOrders, orderItems] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.findMany({
        where: { isPaid: true },
        select: { id: true, createdAt: true, total: true },
      }),
      prisma.orderItem.findMany({
        include: {
          order: { select: { isPaid: true, createdAt: true } },
          product: { select: { id: true, name: true, images: true } },
        },
      }),
    ]);

    const currentPeriodOrders = paidOrders.filter((o) => o.createdAt >= rangeStart && o.createdAt < rangeEnd);
    const prevPeriodOrders = paidOrders.filter((o) => o.createdAt >= prevRangeStart && o.createdAt < rangeStart);

    const revenueCurrent = sumRevenue(currentPeriodOrders);
    const revenuePrevious = sumRevenue(prevPeriodOrders);
    const profitCurrent = revenueCurrent * estimatedProfitMargin;
    const profitPrevious = revenuePrevious * estimatedProfitMargin;

    let revenueChart = [];
    if (period === "year") {
      const map = new Map();
      for (let i = 11; i >= 0; i -= 1) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        map.set(monthLabel(d), 0);
      }
      currentPeriodOrders.forEach((order) => {
        const key = monthLabel(order.createdAt);
        if (!map.has(key)) return;
        map.set(key, (map.get(key) || 0) + Number(order.total || 0));
      });
      revenueChart = Array.from(map.entries()).map(([date, revenue]) => ({
        date,
        revenue: Number(revenue.toFixed(2)),
        profit: Number((revenue * estimatedProfitMargin).toFixed(2)),
      }));
    } else {
      const map = new Map();
      for (let i = 0; i < effectiveRangeDays; i += 1) {
        const d = new Date(rangeStart.getTime() + i * DAY_MS);
        map.set(dateLabel(d), 0);
      }
      currentPeriodOrders.forEach((order) => {
        const key = dateLabel(order.createdAt);
        if (!map.has(key)) return;
        map.set(key, (map.get(key) || 0) + Number(order.total || 0));
      });
      revenueChart = Array.from(map.entries()).map(([date, revenue]) => ({
        date,
        revenue: Number(revenue.toFixed(2)),
        profit: Number((revenue * estimatedProfitMargin).toFixed(2)),
      }));
    }

    const productMap = new Map();
    orderItems
      .filter((item) => item.order?.isPaid && item.order?.createdAt >= rangeStart && item.order?.createdAt < rangeEnd)
      .forEach((item) => {
        const key = item.productId;
        if (!productMap.has(key)) {
          productMap.set(key, {
            id: item.product?.id,
            name: item.product?.name || "Sản phẩm",
            image: item.product?.images?.[0] || "",
            revenue: 0,
            quantity: 0,
          });
        }
        const current = productMap.get(key);
        current.quantity += Number(item.quantity || 0);
        current.revenue += Number(item.price || 0) * Number(item.quantity || 0);
      });

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((item) => ({ ...item, revenue: Number(item.revenue.toFixed(2)) }));

    return NextResponse.json(
      {
        period,
        from: rangeStart.toISOString(),
        to: new Date(rangeEnd.getTime() - 1).toISOString(),
        products: productsCount,
        orders: ordersCount,
        kpis: {
          revenueCurrent: Number(revenueCurrent.toFixed(2)),
          revenuePrevious: Number(revenuePrevious.toFixed(2)),
          profitCurrent: Number(profitCurrent.toFixed(2)),
          profitPrevious: Number(profitPrevious.toFixed(2)),
          orderCountCurrent: currentPeriodOrders.length,
          estimatedProfitMarginPercent: Number(safeMarginPercent.toFixed(2)),
        },
        revenueChart,
        topProducts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json({ error: error.code || error.message }, { status: 400 });
  }
}
