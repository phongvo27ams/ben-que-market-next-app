"use client"

import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import Loading from "../../../components/Loading";
import PageTitle from "../../../components/PageTitle";
import OrderItem from "../../../components/OrderItem";

export default function Orders() {
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = await getToken();
        const { data } = await axios.get('/api/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(data.orders);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error(error?.response?.data?.error || error.message);
      }
    }

    if (isLoaded) {
      if (user) {
        fetchOrders();
      } else {
        router.push('/');
      }
    }
  }, [isLoaded, user, getToken, router]);

  if (!isLoaded || loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-[70vh] px-4 sm:px-6 lg:px-10">
      {orders.length > 0 ? (
        <div className="my-20 w-full">
          <PageTitle
            heading="Đơn hàng của tôi"
            text={`Hiển thị ${orders.length} đơn hàng`}
            linkText={'Về trang chủ'}
          />

          <table className="w-full text-slate-500 table-auto border-separate border-spacing-y-12 border-spacing-x-4">
            <thead>
              <tr className="max-sm:text-sm text-slate-600 max-md:hidden">
                <th className="text-left">Sản phẩm</th>
                <th className="text-center">Tổng giá tiền</th>
                <th className="text-left">Địa chỉ</th>
                <th className="text-left">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <OrderItem order={order} key={order.id} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="min-h-[80vh] flex items-center justify-center text-slate-400">
          <h1 className="text-2xl sm:text-4xl font-semibold">
            Bạn chưa có đơn hàng
          </h1>
        </div>
      )}
    </div>
  );
}