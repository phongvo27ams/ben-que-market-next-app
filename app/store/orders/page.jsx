'use client'

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import toast from "react-hot-toast";
import axios from "axios";

import Loading from "../../../components/Loading";

export default function StoreOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [analyticsPeriod, setAnalyticsPeriod] = useState("30d");
  const [analyticsFromDate, setAnalyticsFromDate] = useState("");
  const [analyticsToDate, setAnalyticsToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const { getToken } = useAuth();
  const statusLabelMap = {
    ORDER_PLACED: "Đã đặt hàng",
    PROCESSING: "Đang xử lý",
    SHIPPED: "Đang giao",
    DELIVERED: "Đã giao",
  };

  const getStatusLabel = (status) => statusLabelMap[status] || status;

  const fetchOrders = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/store/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error fetching store orders:", error);
      toast.error(error?.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const token = await getToken();
      await axios.post("/api/store/orders", { orderId, status }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status } : order
        )
      );

      toast.success("Đã cập nhật trạng thái đơn hàng");
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error(error?.response?.data?.error || error.message);
    }
  };

  const openModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [orders.length]);

  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return orders.slice(start, start + PAGE_SIZE);
  }, [orders, currentPage]);

  const filteredAnalyticsOrders = useMemo(() => {
    const now = new Date();
    const today = new Date(now);
    today.setHours(23, 59, 59, 999);

    if (analyticsPeriod === "7d" || analyticsPeriod === "30d") {
      const days = analyticsPeriod === "7d" ? 7 : 30;
      const start = new Date(today);
      start.setDate(start.getDate() - (days - 1));
      start.setHours(0, 0, 0, 0);
      return orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= start && orderDate <= today;
      });
    }

    if (analyticsPeriod === "custom" && analyticsFromDate && analyticsToDate) {
      const from = new Date(analyticsFromDate);
      const to = new Date(analyticsToDate);
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
      if (from > to) return [];
      return orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= from && orderDate <= to;
      });
    }

    return orders;
  }, [orders, analyticsPeriod, analyticsFromDate, analyticsToDate]);

  const customerMetrics = useMemo(() => {
    const orderMap = new Map();
    const now = new Date();
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    const startCurrent = new Date(now.getTime() - THIRTY_DAYS);
    const startPrevious = new Date(startCurrent.getTime() - THIRTY_DAYS);

    filteredAnalyticsOrders.forEach((order) => {
      const uid = order.user?.id;
      if (!uid) return;
      if (!orderMap.has(uid)) {
        orderMap.set(uid, {
          user: order.user,
          totalOrders: 0,
          totalSpend: 0,
          firstOrderAt: new Date(order.createdAt),
        });
      }
      const item = orderMap.get(uid);
      item.totalOrders += 1;
      item.totalSpend += Number(order.total || 0);
      if (new Date(order.createdAt) < item.firstOrderAt) {
        item.firstOrderAt = new Date(order.createdAt);
      }
    });

    const customers = Array.from(orderMap.values());
    const newCustomers = customers.filter((c) => c.totalOrders === 1).length;
    const returningCustomers = customers.filter((c) => c.totalOrders > 1).length;
    const repeatRate = customers.length ? (returningCustomers / customers.length) * 100 : 0;

    const plusCustomers = customers.filter((c) => c.user?.membershipPlan === "plus");
    const plusActive = plusCustomers.filter((c) => c.user?.membershipStatus === "active").length;
    const plusInactive = plusCustomers.filter((c) => c.user?.membershipStatus !== "active").length;

    const plusCurrentWindow = plusCustomers.filter(
      (c) => c.user?.membershipStartedAt && new Date(c.user.membershipStartedAt) >= startCurrent
    ).length;
    const plusPrevWindow = plusCustomers.filter(
      (c) =>
        c.user?.membershipStartedAt &&
        new Date(c.user.membershipStartedAt) >= startPrevious &&
        new Date(c.user.membershipStartedAt) < startCurrent
    ).length;
    const plusGrowthPercent =
      plusPrevWindow === 0 ? (plusCurrentWindow > 0 ? 100 : 0) : ((plusCurrentWindow - plusPrevWindow) / plusPrevWindow) * 100;

    const plusRevenue = plusCustomers.reduce((sum, c) => sum + c.totalSpend, 0);
    const regularCustomers = customers.filter((c) => c.user?.membershipPlan !== "plus");
    const plusMonthlyCustomers = customers.filter(
      (c) => c.user?.membershipPlan === "plus" && (c.user?.membershipPeriod || "").toLowerCase() === "monthly"
    );
    const plusYearlyCustomers = customers.filter(
      (c) => c.user?.membershipPlan === "plus" && (c.user?.membershipPeriod || "").toLowerCase() === "yearly"
    );
    const regularRevenue = regularCustomers.reduce((sum, c) => sum + c.totalSpend, 0);
    const plusLtv = plusCustomers.length ? plusRevenue / plusCustomers.length : 0;
    const regularLtv = regularCustomers.length ? regularRevenue / regularCustomers.length : 0;

    return {
      customerCount: customers.length,
      newCustomers,
      returningCustomers,
      repeatRate,
      plusActive,
      plusInactive,
      plusCurrentWindow,
      plusPrevWindow,
      plusGrowthPercent,
      plusLtv,
      regularLtv,
      regularCustomerCount: regularCustomers.length,
      plusMonthlyCustomerCount: plusMonthlyCustomers.length,
      plusYearlyCustomerCount: plusYearlyCustomers.length,
    };
  }, [filteredAnalyticsOrders]);

  if (loading) return <Loading />;

  return (
    <>
      <h1 className="mb-5 text-2xl text-slate-500">Quản lý <span className="font-medium text-slate-800">Đơn hàng</span></h1>
      {orders.length === 0 ? (
        <p>Chưa có đơn hàng nào</p>
      ) : (
        <>
          <div className="w-full overflow-x-auto rounded-md border border-gray-200 shadow">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-700">
                <tr>
                  {["STT", "Khách hàng", "Tổng tiền", "Thanh toán", "Mã giảm giá", "Trạng thái", "Ngày đặt"].map((heading, i) => (
                    <th key={i} className="px-4 py-3">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedOrders.map((order, index) => (
                  <tr
                    key={order.id}
                    className="cursor-pointer transition-colors duration-150 hover:bg-gray-50"
                    onClick={() => openModal(order)}
                  >
                    <td className="pl-6 text-green-600">{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
                    <td className="px-4 py-3">{order.user?.name}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{order.total?.toLocaleString("vi-VN")} đ</td>
                    <td className="px-4 py-3">{order.paymentMethod}</td>
                    <td className="px-4 py-3">
                      {order.isCouponUsed ? (
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                          {order.coupon?.code}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => { e.stopPropagation(); }}>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="rounded-md border-gray-300 text-sm focus:ring focus:ring-blue-200"
                      >
                        <option value="ORDER_PLACED">Đã đặt hàng</option>
                        <option value="PROCESSING">Đang xử lý</option>
                        <option value="SHIPPED">Đang giao</option>
                        <option value="DELIVERED">Đã giao</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
            <p>
              Hiển thị {(currentPage - 1) * PAGE_SIZE + 1}
              -
              {Math.min(currentPage * PAGE_SIZE, orders.length)} / {orders.length} đơn hàng
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="rounded border border-slate-200 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Trước
              </button>
              <span>
                Trang {currentPage}/{totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="rounded border border-slate-200 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="text-base font-semibold text-slate-800">Khách hàng và thành viên</h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-lg bg-slate-100 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setAnalyticsPeriod("7d")}
                  className={`rounded px-3 py-1 ${analyticsPeriod === "7d" ? "bg-white text-slate-800 shadow" : "text-slate-500"}`}
                >
                  7 ngày
                </button>
                <button
                  type="button"
                  onClick={() => setAnalyticsPeriod("30d")}
                  className={`rounded px-3 py-1 ${analyticsPeriod === "30d" ? "bg-white text-slate-800 shadow" : "text-slate-500"}`}
                >
                  30 ngày
                </button>
                <button
                  type="button"
                  onClick={() => setAnalyticsPeriod("custom")}
                  className={`rounded px-3 py-1 ${analyticsPeriod === "custom" ? "bg-white text-slate-800 shadow" : "text-slate-500"}`}
                >
                  Tùy chọn
                </button>
              </div>
              {analyticsPeriod === "custom" && (
                <div className="ml-2 flex flex-wrap items-center gap-2 text-xs">
                  <input
                    type="date"
                    value={analyticsFromDate}
                    onChange={(e) => setAnalyticsFromDate(e.target.value)}
                    className="rounded-md border border-slate-200 px-2 py-1"
                  />
                  <span className="text-slate-400">-</span>
                  <input
                    type="date"
                    value={analyticsToDate}
                    onChange={(e) => setAnalyticsToDate(e.target.value)}
                    className="rounded-md border border-slate-200 px-2 py-1"
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Khách mới</p>
                <p className="mt-1 text-2xl font-semibold text-slate-800">{customerMetrics.newCustomers}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Khách quay lại</p>
                <p className="mt-1 text-2xl font-semibold text-slate-800">{customerMetrics.returningCustomers}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Tỉ lệ mua lại (repeat rate)</p>
                <p className="mt-1 text-2xl font-semibold text-emerald-700">{customerMetrics.repeatRate.toFixed(1)}%</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Tổng khách đã mua</p>
                <p className="mt-1 text-2xl font-semibold text-slate-800">{customerMetrics.customerCount}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Tổng khách thường</p>
                <p className="mt-1 text-2xl font-semibold text-slate-800">{customerMetrics.regularCustomerCount}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Tổng khách Plus tháng</p>
                <p className="mt-1 text-2xl font-semibold text-slate-800">{customerMetrics.plusMonthlyCustomerCount}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Tổng khách Plus năm</p>
                <p className="mt-1 text-2xl font-semibold text-slate-800">{customerMetrics.plusYearlyCustomerCount}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-sm font-medium text-slate-700">Tăng trưởng Plus member</p>
                <p className="mt-2 text-sm text-slate-600">
                  Mới 30 ngày: <span className="font-semibold text-slate-800">{customerMetrics.plusCurrentWindow}</span> · Kỳ trước: <span className="font-semibold text-slate-800">{customerMetrics.plusPrevWindow}</span>
                </p>
                <p className={`mt-1 text-sm font-semibold ${customerMetrics.plusGrowthPercent >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                  {customerMetrics.plusGrowthPercent >= 0 ? "+" : ""}{customerMetrics.plusGrowthPercent.toFixed(1)}%
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-sm font-medium text-slate-700">Plus active / inactive</p>
                <p className="mt-2 text-sm text-slate-600">
                  Active: <span className="font-semibold text-emerald-700">{customerMetrics.plusActive}</span>
                </p>
                <p className="text-sm text-slate-600">
                  Inactive: <span className="font-semibold text-amber-700">{customerMetrics.plusInactive}</span>
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-sm font-medium text-slate-700">LTV proxy theo nhóm khách</p>
                <p className="mt-2 text-sm text-slate-600">
                  Plus: <span className="font-semibold text-slate-800">{Math.round(customerMetrics.plusLtv).toLocaleString("vi-VN")} đ</span>
                </p>
                <p className="text-sm text-slate-600">
                  Thường: <span className="font-semibold text-slate-800">{Math.round(customerMetrics.regularLtv).toLocaleString("vi-VN")} đ</span>
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {isModalOpen && selectedOrder && (
        <div onClick={closeModal} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 text-sm text-slate-700 backdrop-blur-xs">
          <div onClick={(e) => e.stopPropagation()} className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-center text-xl font-semibold text-slate-900">
              Chi tiết đơn hàng
            </h2>

            <div className="mb-4">
              <h3 className="mb-2 font-semibold">Thông tin khách hàng</h3>
              <p><span className="text-green-700">Tên:</span> {selectedOrder.user?.name}</p>
              <p><span className="text-green-700">Email:</span> {selectedOrder.user?.email}</p>
              <p><span className="text-green-700">Số điện thoại:</span> {selectedOrder.address?.phone}</p>
              <p><span className="text-green-700">Địa chỉ:</span> {`${selectedOrder.address?.street}, ${selectedOrder.address?.city}, ${selectedOrder.address?.state}, ${selectedOrder.address?.zip}, ${selectedOrder.address?.country}`}</p>
            </div>

            <div className="mb-4">
              <h3 className="mb-2 font-semibold">Sản phẩm</h3>
              <div className="space-y-2">
                {selectedOrder.orderItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 rounded border border-slate-100 p-2 shadow">
                    <img
                      src={item.product.images?.[0]?.src || item.product.images?.[0]}
                      alt={item.product?.name}
                      className="h-16 w-16 rounded object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-slate-800">{item.product?.name}</p>
                      <p>Số lượng: {item.quantity}</p>
                      {Number(item.price) < Number(item.product?.price) ? (
                        <div>
                          <p className="font-semibold text-emerald-600">
                            Giá đã mua: {item.price?.toLocaleString("vi-VN")} đ
                          </p>
                          <p className="text-xs text-slate-400">
                            Giá niêm yết: <span className="line-through">{item.product?.price?.toLocaleString("vi-VN")} đ</span>
                          </p>
                          <p className="inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                            Giá ưu đãi
                          </p>
                        </div>
                      ) : (
                        <p>Giá: {item.price?.toLocaleString("vi-VN")} đ</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p><span className="text-green-700">Phương thức thanh toán:</span> {selectedOrder.paymentMethod}</p>
              <p><span className="text-green-700">Đã thanh toán:</span> {selectedOrder.isPaid ? "Có" : "Không"}</p>
              {selectedOrder.isCouponUsed && (
                <p><span className="text-green-700">Mã giảm giá:</span> {selectedOrder.coupon.code} (giảm {selectedOrder.coupon.discount}%)</p>
              )}
              <p><span className="text-green-700">Trạng thái:</span> {getStatusLabel(selectedOrder.status)}</p>
              <p><span className="text-green-700">Ngày đặt:</span> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
            </div>

            <div className="flex justify-end">
              <button onClick={closeModal} className="rounded bg-slate-200 px-4 py-2 hover:bg-slate-300">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
