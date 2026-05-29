'use client'

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import toast from "react-hot-toast";
import axios from "axios";

import Loading from "../../../components/Loading";

export default function StoreOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      const { data } = await axios.get('/api/store/orders', {
        headers: {
          Authorization: `Bearer ${token}`
        },
      });

      setOrders(data.orders);
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
      await axios.post('/api/store/orders', { orderId, status }, {
        headers: {
          Authorization: `Bearer ${token}`
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

  if (loading) return <Loading />;

  return (
    <>
      <h1 className="text-2xl text-slate-500 mb-5">Quản lý <span className="text-slate-800 font-medium">Đơn hàng</span></h1>
      {orders.length === 0 ? (
        <p>Chưa có đơn hàng nào</p>
      ) : (
        <div className="w-full overflow-x-auto rounded-md border border-gray-200 shadow">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-50 text-gray-700 text-xs uppercase tracking-wider">
              <tr>
                {["STT", "Khách hàng", "Tổng tiền", "Thanh toán", "Mã giảm giá", "Trạng thái", "Ngày đặt"].map((heading, i) => (
                  <th key={i} className="px-4 py-3">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order, index) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                  onClick={() => openModal(order)}
                >
                  <td className="pl-6 text-green-600">{index + 1}</td>
                  <td className="px-4 py-3">{order.user?.name}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{order.total?.toLocaleString("vi-VN")} đ</td>
                  <td className="px-4 py-3">{order.paymentMethod}</td>
                  <td className="px-4 py-3">
                    {order.isCouponUsed ? (
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
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
                      className="border-gray-300 rounded-md text-sm focus:ring focus:ring-blue-200"
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
      )}

      {isModalOpen && selectedOrder && (
        <div onClick={closeModal} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 text-sm text-slate-700 backdrop-blur-xs">
          <div onClick={(e) => e.stopPropagation()} className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 text-center">
              Chi tiết đơn hàng
            </h2>

            <div className="mb-4">
              <h3 className="font-semibold mb-2">Thông tin khách hàng</h3>
              <p><span className="text-green-700">Tên:</span> {selectedOrder.user?.name}</p>
              <p><span className="text-green-700">Email:</span> {selectedOrder.user?.email}</p>
              <p><span className="text-green-700">Số điện thoại:</span> {selectedOrder.address?.phone}</p>
              <p><span className="text-green-700">Địa chỉ:</span> {`${selectedOrder.address?.street}, ${selectedOrder.address?.city}, ${selectedOrder.address?.state}, ${selectedOrder.address?.zip}, ${selectedOrder.address?.country}`}</p>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold mb-2">Sản phẩm</h3>
              <div className="space-y-2">
                {selectedOrder.orderItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 border border-slate-100 shadow rounded p-2">
                    <img
                      src={item.product.images?.[0].src || item.product.images?.[0]}
                      alt={item.product?.name}
                      className="w-16 h-16 object-cover rounded"
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
              <button onClick={closeModal} className="px-4 py-2 bg-slate-200 rounded hover:bg-slate-300">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
