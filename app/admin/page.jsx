'use client'

import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import Loading from "../../components/Loading";
import OrdersAreaChart from "../../components/OrdersAreaChart";
import { formatMoney } from "../../lib/format";
import { CircleDollarSignIcon, ShoppingBasketIcon, TagsIcon } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const { getToken } = useAuth();
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "đ";

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    products: 0,
    revenue: 0,
    orders: 0,
    allOrders: [],
  });

  const dashboardCardsData = [
    { title: "Tổng sản phẩm", value: dashboardData.products, icon: ShoppingBasketIcon },
    { title: "Tổng doanh thu", value: formatMoney(Number(dashboardData.revenue), currency), icon: CircleDollarSignIcon },
    { title: "Tổng đơn hàng", value: dashboardData.orders, icon: TagsIcon },
  ];

  const fetchDashboardData = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/admin/dashboard", {
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
    fetchDashboardData();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="text-slate-500">
      <h1 className="text-2xl">Admin <span className="font-medium text-slate-800">Tổng quan</span></h1>

      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {dashboardCardsData.map((card, index) => (
          <div key={index} className="flex w-full items-center justify-between gap-6 rounded-lg border border-slate-200 p-4 px-6">
            <div className="flex flex-col gap-3 text-xs">
              <p>{card.title}</p>
              <b className="text-2xl font-medium text-slate-700">{card.value}</b>
            </div>
            <card.icon size={50} className="h-11 w-11 rounded-full bg-slate-100 p-2.5 text-slate-400" />
          </div>
        ))}
      </div>

      <div className="mt-8">
        <OrdersAreaChart allOrders={dashboardData.allOrders} />
      </div>
    </div>
  );
}
