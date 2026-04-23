'use client'

import { useState } from "react";
import { useSelector } from "react-redux";
import Image from "next/image";
import { CheckCircle2Icon, Clock3Icon, PackageCheckIcon, PackageIcon, TruckIcon } from "lucide-react";

import Rating from "./Rating";
import RatingModal from "./RatingModal";
import { formatMoney } from "../lib/format";

const formatOrderDate = (date) => {
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(value);
};

const STATUS_CONFIG = {
  ORDER_PLACED: {
    label: "Đã đặt hàng",
    className: "bg-slate-100 text-slate-700 ring-slate-200",
    icon: PackageIcon,
  },
  PROCESSING: {
    label: "Đang xử lý",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
    icon: Clock3Icon,
  },
  SHIPPED: {
    label: "Đang giao hàng",
    className: "bg-blue-50 text-blue-700 ring-blue-200",
    icon: TruckIcon,
  },
  DELIVERED: {
    label: "Đã nhận hàng",
    className: "bg-green-50 text-green-700 ring-green-200",
    icon: PackageCheckIcon,
  },
};

const getStatusConfig = (status) => {
  const normalizedStatus = String(status || "").toUpperCase();
  return STATUS_CONFIG[normalizedStatus] || {
    label: normalizedStatus.split("_").join(" ").toLowerCase() || "Chưa cập nhật",
    className: "bg-slate-100 text-slate-700 ring-slate-200",
    icon: CheckCircle2Icon,
  };
};

const OrderStatusBadge = ({ status }) => {
  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${config.className}`}>
      <Icon size={14} />
      {config.label}
    </span>
  );
};

const OrderItem = ({ order }) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';
  const [ratingModal, setRatingModal] = useState(null);
  const orderDate = formatOrderDate(order.createdAt);

  const { ratings } = useSelector(state => state.rating);

  return (
    <>
      <tr className="text-sm align-top">
        <td className="text-left">
          <div className="flex flex-col gap-6">
            {order.orderItems.map((item, index) => {
              const existingRating = ratings.find(rating => order.id === rating.orderId && item.product.id === rating.productId);

              return (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex aspect-square w-20 items-center justify-center rounded-xl bg-slate-100">
                    <Image
                      className="h-14 w-auto"
                      src={item.product.images[0]}
                      alt={item.product.name}
                      width={50}
                      height={50}
                    />
                  </div>

                  <div className="flex flex-col justify-center text-sm">
                    <p className="text-base font-medium text-slate-700">{item.product.name}</p>
                    <p className="text-slate-500">{formatMoney(item.price, currency)} | Số lượng: {item.quantity}</p>
                    <p className="mb-1 text-xs text-slate-400">Ngày đặt: {orderDate}</p>
                    <div>
                      {existingRating ? (
                        <button
                          type="button"
                          onClick={() => setRatingModal({
                            orderId: order.id,
                            productId: item.product.id,
                            readonly: true,
                            rating: existingRating.rating,
                            review: existingRating.review,
                          })}
                          className="inline-flex items-center gap-2 text-green-600 transition hover:bg-green-50"
                        >
                          <Rating value={existingRating.rating} />
                          <span>Xem đánh giá</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setRatingModal({ orderId: order.id, productId: item.product.id })}
                          className={`text-green-600 transition hover:bg-green-50 ${order.status !== "DELIVERED" && 'hidden'}`}
                        >
                          Đánh giá sản phẩm
                        </button>
                      )}
                    </div>
                    {ratingModal && <RatingModal ratingModal={ratingModal} setRatingModal={setRatingModal} />}
                  </div>
                </div>
              );
            })}
          </div>
        </td>

        <td className="text-center font-medium text-slate-700 max-md:hidden">{formatMoney(order.total, currency)}</td>

        <td className="text-left text-slate-500 max-md:hidden">
          <p>{order.address.name}, {order.address.street},</p>
          <p>{order.address.city}, {order.address.state}, {order.address.zip}, {order.address.country},</p>
          <p>{order.address.phone}</p>
        </td>

        <td className="text-left max-md:hidden">
          <OrderStatusBadge status={order.status} />
        </td>
      </tr>

      <tr className="md:hidden">
        <td colSpan={5}>
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
            <p>{order.address.name}, {order.address.street}</p>
            <p>{order.address.city}, {order.address.state}, {order.address.zip}, {order.address.country}</p>
            <p>{order.address.phone}</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs text-slate-400">Ngày đặt: {orderDate}</p>
              <OrderStatusBadge status={order.status} />
            </div>
          </div>
        </td>
      </tr>

      <tr>
        <td colSpan={4}>
          <div className="mx-auto w-6/7 border-b border-slate-300" />
        </td>
      </tr>
    </>
  );
}

export default OrderItem;
