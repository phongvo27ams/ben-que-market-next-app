'use client'

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import toast from "react-hot-toast";
import Image from "next/image";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { CircleDollarSignIcon, ShoppingBasketIcon, TagsIcon, TrendingUpIcon } from "lucide-react";

import Loading from "../../components/Loading";
import { formatMoney } from "../../lib/format";

const growthText = (current, previous) => {
  if (!previous && !current) return "0%";
  if (!previous && current > 0) return "+100%";
  const value = ((current - previous) / previous) * 100;
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
};

export default function AdminDashboard() {
  const { getToken } = useAuth();
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "đ";

  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [marginPercent, setMarginPercent] = useState("35");
  const [dashboardData, setDashboardData] = useState({
    products: 0,
    orders: 0,
    kpis: {},
    revenueChart: [],
    topProducts: [],
  });

  const fetchDashboardData = async (selectedPeriod, customFrom = "", customTo = "", selectedMarginPercent = marginPercent) => {
    try {
      const token = await getToken();
      const params = new URLSearchParams({ period: selectedPeriod });
      params.set("marginPercent", String(selectedMarginPercent));
      if (selectedPeriod === "custom" && customFrom && customTo) {
        params.set("from", customFrom);
        params.set("to", customTo);
      }
      const { data } = await axios.get(`/api/admin/dashboard?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDashboardData(data);
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(period);
  }, [period]);

  const applyCustomRange = async () => {
    if (!fromDate || !toDate) {
      toast.error("Vui lòng chọn đầy đủ Từ ngày và Đến ngày.");
      return;
    }
    if (new Date(fromDate) > new Date(toDate)) {
      toast.error("Mốc Từ ngày phải nhỏ hơn hoặc bằng Đến ngày.");
      return;
    }
    setLoading(true);
    setPeriod("custom");
    await fetchDashboardData("custom", fromDate, toDate);
  };

  const applyMargin = async () => {
    const numericMargin = Number(marginPercent);
    if (!Number.isFinite(numericMargin) || numericMargin < 0 || numericMargin > 100) {
      toast.error("Biên lợi nhuận phải nằm trong khoảng 0 đến 100.");
      return;
    }
    setLoading(true);
    await fetchDashboardData(period, fromDate, toDate, numericMargin);
  };

  if (loading) return <Loading />;

  const kpis = dashboardData.kpis || {};
  const periodLabel =
    period === "week" ? "7 ngày" : period === "month" ? "30 ngày" : period === "year" ? "12 tháng" : "Tùy chỉnh";

  const cards = [
    { title: "Tổng sản phẩm", value: dashboardData.products, icon: ShoppingBasketIcon, sub: "Toàn hệ thống" },
    {
      title: `Doanh thu (${periodLabel})`,
      value: formatMoney(Number(kpis.revenueCurrent || 0), currency),
      icon: CircleDollarSignIcon,
      sub: `So với kỳ trước: ${growthText(Number(kpis.revenueCurrent || 0), Number(kpis.revenuePrevious || 0))}`,
    },
    {
      title: `Lợi nhuận ước tính (${periodLabel})`,
      value: formatMoney(Number(kpis.profitCurrent || 0), currency),
      icon: TrendingUpIcon,
      sub: `Biên ước tính: ${kpis.estimatedProfitMarginPercent || 0}%`,
    },
    {
      title: `Đơn hàng (${periodLabel})`,
      value: Number(kpis.orderCountCurrent || 0),
      icon: TagsIcon,
      sub: `Tổng đơn toàn hệ thống: ${dashboardData.orders}`,
    },
  ];

  return (
    <div className="text-slate-600">
      <h1 className="text-2xl">
        Admin <span className="font-medium text-slate-800">Tổng quan</span>
      </h1>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="rounded-lg bg-slate-100 p-1 text-xs">
          <button type="button" onClick={() => setPeriod("week")} className={`rounded px-3 py-1 ${period === "week" ? "bg-white text-slate-800 shadow" : "text-slate-500"}`}>Tuần</button>
          <button type="button" onClick={() => setPeriod("month")} className={`rounded px-3 py-1 ${period === "month" ? "bg-white text-slate-800 shadow" : "text-slate-500"}`}>Tháng</button>
          <button type="button" onClick={() => setPeriod("year")} className={`rounded px-3 py-1 ${period === "year" ? "bg-white text-slate-800 shadow" : "text-slate-500"}`}>Năm</button>
        </div>
        <div className="ml-2 flex flex-wrap items-center gap-2 text-xs">
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="rounded-md border border-slate-200 px-2 py-1" />
          <span className="text-slate-400">-</span>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="rounded-md border border-slate-200 px-2 py-1" />
          <button type="button" onClick={applyCustomRange} className="rounded-md bg-slate-800 px-3 py-1.5 font-medium text-white transition hover:bg-slate-900">
            Áp dụng
          </button>
        </div>
        <div className="ml-2 flex items-center gap-2 text-xs">
          <span className="text-slate-500">Biên lợi nhuận (%)</span>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={marginPercent}
            onChange={(e) => setMarginPercent(e.target.value)}
            className="w-20 rounded-md border border-slate-200 px-2 py-1"
          />
          <button type="button" onClick={applyMargin} className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 transition hover:bg-slate-100">
            Cập nhật
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, idx) => (
          <div key={idx} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500">{card.title}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-800">{card.value}</p>
                <p className="mt-2 text-xs text-slate-400">{card.sub}</p>
              </div>
              <card.icon size={42} className="rounded-full bg-slate-100 p-2.5 text-slate-400" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-medium text-slate-800">Doanh thu & lợi nhuận ước tính ({periodLabel})</h2>
            <div className="text-xs text-slate-500">
              So với kỳ trước: <span className="font-medium text-slate-700">{growthText(Number(kpis.revenueCurrent || 0), Number(kpis.revenuePrevious || 0))}</span>
            </div>
          </div>
          <div className="h-[320px] w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardData.revenueChart || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatMoney(Number(value), currency)} />
                <Legend />
                <Area type="monotone" dataKey="revenue" name="Doanh thu" stroke="#16a34a" fill="#bbf7d0" strokeWidth={2} />
                <Area type="monotone" dataKey="profit" name="Lợi nhuận ước tính" stroke="#0284c7" fill="#bae6fd" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-medium text-slate-800">Top sản phẩm theo doanh thu ({periodLabel})</h2>
          <div className="mt-4 space-y-3">
            {(dashboardData.topProducts || []).map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-2">
                <div className="flex h-12 w-12 items-center justify-center rounded bg-slate-100">
                  {item.image ? <Image src={item.image} alt={item.name} width={40} height={40} className="h-10 w-10 object-contain" /> : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-700">{item.name}</p>
                  <p className="text-xs text-slate-400">Số lượng bán: {item.quantity}</p>
                </div>
                <p className="text-xs font-semibold text-emerald-700">{formatMoney(Number(item.revenue || 0), currency)}</p>
              </div>
            ))}
            {!dashboardData.topProducts?.length && <p className="text-sm text-slate-400">Chưa có dữ liệu doanh thu sản phẩm.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
