"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import toast from "react-hot-toast";
import {
  BadgePercentIcon,
  CheckCircle2Icon,
  CrownIcon,
  GiftIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  SparklesIcon,
  TruckIcon,
} from "lucide-react";

const plans = [
  {
    name: "Free",
    accent: "from-slate-100 via-white to-slate-50",
    border: "border-slate-200",
    badge: "Dùng ngay",
    priceMonthly: "0 đ",
    priceYearly: "0 đ",
    description: "Phù hợp để mua sắm hằng ngày, trải nghiệm đặc sản vùng miền.",
    ctaLabel: "Bắt đầu miễn phí",
    ctaHref: "/shop",
    ctaClass: "bg-slate-800 text-white hover:bg-slate-900",
    features: [
      "Mua sắm toàn bộ sản phẩm trong hệ thống",
      "Lưu sản phẩm yêu thích vào Wishlist",
      "Theo dõi đơn hàng và đánh giá sau mua",
      "Nhận ưu đãi công khai theo từng chương trình",
    ],
    limitations: [
      "Có tính phí vận chuyển theo đơn hàng",
      "Không dùng được mã giảm giá chỉ dành cho Plus",
    ],
  },
  {
    name: "Plus",
    accent: "from-emerald-100 via-white to-lime-50",
    border: "border-emerald-200",
    badge: "Đề xuất",
    priceMonthly: "49.000 đ",
    priceYearly: "499.000 đ",
    description: "Dành cho khách hàng mua thường xuyên, muốn tối ưu chi phí mỗi đơn.",
    features: [
      "Miễn phí vận chuyển cho đơn hàng đủ điều kiện",
      "Được áp dụng coupon độc quyền cho thành viên Plus",
      "Nhận ưu đãi theo mùa và chiến dịch sớm hơn",
      "Ưu tiên tiếp cận combo tiết kiệm và quà tặng thành viên",
      "Phù hợp cho khách hàng mua lặp lại mỗi tháng",
    ],
    highlight: "Tiết kiệm rõ nhất nếu bạn mua từ 2 đến 4 đơn mỗi tháng.",
  },
];

const comparisonRows = [
  { label: "Mua sắm toàn bộ sản phẩm", free: "Có", plus: "Có", icon: ShoppingBagIcon },
  { label: "Wishlist và theo dõi đơn hàng", free: "Có", plus: "Có", icon: ShieldCheckIcon },
  { label: "Phí vận chuyển", free: "Tính theo đơn", plus: "Miễn phí", icon: TruckIcon },
  { label: "Coupon dành riêng cho thành viên", free: "Không", plus: "Có", icon: BadgePercentIcon },
  { label: "Ưu đãi theo mùa / quà tặng khách thân thiết", free: "Cơ bản", plus: "Ưu tiên trước", icon: GiftIcon },
  { label: "Mức phù hợp", free: "Mua thỉnh thoảng", plus: "Mua thường xuyên", icon: SparklesIcon },
];

function PricingPageContent() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const searchParams = useSearchParams();
  const [loadingPeriod, setLoadingPeriod] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [membership, setMembership] = useState(null);

  const subscriptionStatus = useMemo(() => searchParams.get("subscription"), [searchParams]);
  const sessionId = useMemo(() => searchParams.get("session_id"), [searchParams]);

  useEffect(() => {
    const fetchMembership = async () => {
      try {
        if (!user) {
          setMembership(null);
          return;
        }
        const token = await getToken();
        const { data } = await axios.get("/api/user/membership", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMembership(data?.membership || null);
      } catch {
        setMembership(null);
      }
    };

    fetchMembership();
  }, [user, getToken, subscriptionStatus, sessionId]);

  useEffect(() => {
    const confirmSubscription = async () => {
      if (subscriptionStatus !== "success" || !sessionId || !user) return;

      try {
        setConfirming(true);
        const token = await getToken();
        const confirmRes = await axios.post(
          "/api/subscription/confirm",
          { sessionId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (confirmRes?.data?.ok === false) {
          console.warn("Plus confirm pending:", confirmRes?.data?.reason);
        }
        const refreshedToken = await getToken();
        const { data } = await axios.get("/api/user/membership", {
          headers: { Authorization: `Bearer ${refreshedToken}` },
        });
        setMembership(data?.membership || null);
      } catch (error) {
        console.error("Error confirming Plus membership:", error);
        toast.error(error?.response?.data?.error || "Không thể xác nhận Plus lúc này, vui lòng tải lại trang.");
      } finally {
        setConfirming(false);
      }
    };

    confirmSubscription();
  }, [subscriptionStatus, sessionId, user, getToken]);

  const isPlusActive = membership?.membershipPlan === "plus" && membership?.membershipStatus === "active";
  const isPlusMonthly = isPlusActive && membership?.membershipPeriod === "monthly";
  const isPlusYearly = isPlusActive && membership?.membershipPeriod === "yearly";

  const formatDate = (dateValue) => {
    if (!dateValue) return "Chưa có dữ liệu";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "Chưa có dữ liệu";
    return date.toLocaleDateString("vi-VN");
  };

  const startPlusCheckout = async (period) => {
    try {
      if (!user) {
        toast.error("Vui lòng đăng nhập trước khi nâng cấp Plus");
        return;
      }

      setLoadingPeriod(period);
      const token = await getToken();
      const { data } = await axios.post(
        "/api/subscription/checkout",
        { period },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data?.session?.url) {
        window.location.href = data.session.url;
      } else {
        toast.error("Không thể tạo phiên thanh toán");
      }
    } catch (error) {
      console.error("Error starting Plus checkout:", error);
      toast.error(error?.response?.data?.error || error.message);
    } finally {
      setLoadingPeriod("");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-14 text-slate-800 sm:px-8 lg:px-10">
      {subscriptionStatus === "success" && (
        <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {confirming
            ? "Thanh toán thành công. Đang kích hoạt Plus cho tài khoản của bạn..."
            : "Thanh toán thành công. Tài khoản của bạn đã được nâng cấp Plus."}
        </div>
      )}
      {subscriptionStatus === "cancelled" && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Bạn đã hủy phiên thanh toán. Có thể thử lại bất cứ lúc nào.
        </div>
      )}

      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top_right,_rgba(34,197,94,0.22),_transparent_34%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] px-6 py-10 sm:px-10 sm:py-14">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-1.5 text-sm font-medium text-green-700">
            <CrownIcon size={16} />
            Gói thành viên Bến Quê Market
          </div>
          <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-5xl">
            Chọn gói phù hợp để mua sắm thông minh hơn
          </h1>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-amber-100 bg-[linear-gradient(135deg,_rgba(255,251,235,1)_0%,_rgba(255,255,255,1)_100%)] px-6 py-5 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Trạng thái thành viên</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">
              {isPlusActive ? `Gói hiện tại: Plus (${membership?.membershipPeriod === "yearly" ? "Năm" : "Tháng"})` : "Gói hiện tại: Free"}
            </p>
          </div>
          <div className="grid gap-2 text-sm text-slate-600 sm:text-right">
            <p>
              <span className="font-medium text-slate-800">Ngày kích hoạt:</span>{" "}
              {formatDate(membership?.membershipStartedAt)}
            </p>
            <p>
              <span className="font-medium text-slate-800">Ngày hết hạn:</span>{" "}
              {formatDate(membership?.membershipExpiresAt)}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={`flex h-full flex-col rounded-[2rem] border ${plan.border} bg-gradient-to-br ${plan.accent} p-6 shadow-sm sm:p-8`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">{plan.badge}</p>
                <h2 className="mt-3 text-3xl font-semibold text-slate-900">{plan.name}</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">{plan.description}</p>
              </div>
              {plan.name === "Plus" && (
                <div className="rounded-2xl bg-white/80 p-3 text-green-600 shadow-sm">
                  <CrownIcon size={26} />
                </div>
              )}
            </div>

            <div className="mt-8 grid gap-4 rounded-[1.5rem] border border-white/80 bg-white/80 p-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Theo tháng</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{plan.priceMonthly}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Theo năm</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{plan.priceYearly}</p>
                {plan.name === "Plus" && <p className="mt-2 text-sm text-green-700">Tiết kiệm gần 2 tháng khi đăng ký theo năm</p>}
              </div>
            </div>

            <ul className="mt-7 flex-1 space-y-3 text-sm leading-6 text-slate-700 sm:text-base">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <CheckCircle2Icon className="mt-0.5 shrink-0 text-green-600" size={18} />
                  <span>{feature}</span>
                </li>
              ))}
              {plan.limitations?.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-slate-500">
                  <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {plan.highlight && (
              <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {plan.highlight}
              </div>
            )}

            {plan.name === "Free" ? (
              <Link
                href={plan.ctaHref}
                className={`mt-7 inline-flex w-full items-center justify-center rounded-2xl px-5 py-3.5 text-sm font-semibold transition sm:text-base ${plan.ctaClass}`}
              >
                {plan.ctaLabel}
              </Link>
            ) : (
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {!isPlusMonthly && !isPlusYearly && (
                  <button
                    type="button"
                    onClick={() => startPlusCheckout("monthly")}
                    disabled={loadingPeriod !== ""}
                    className="rounded-2xl bg-green-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-400"
                  >
                    {loadingPeriod === "monthly" ? "Đang chuyển..." : "Nâng cấp Plus tháng"}
                  </button>
                )}
                {!isPlusYearly && (
                  <button
                    type="button"
                    onClick={() => startPlusCheckout("yearly")}
                    disabled={loadingPeriod !== ""}
                    className="rounded-2xl bg-slate-800 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {loadingPeriod === "yearly" ? "Đang chuyển..." : "Nâng cấp Plus năm"}
                  </button>
                )}
                {isPlusActive && (
                  <p className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">Tài khoản đã có đầy đủ quyền Plus.</p>
                )}
              </div>
            )}
          </article>
        ))}
      </section>

      <section id="so-sanh-goi" className="mt-14 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mt-8 overflow-hidden rounded-[1.75rem] border border-slate-200">
          <div className="grid grid-cols-[1.5fr_0.8fr_0.8fr] bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-700 sm:px-6 sm:text-base">
            <p>Quyền lợi</p>
            <p className="text-center">Free</p>
            <p className="text-center text-green-700">Plus</p>
          </div>
          {comparisonRows.map((row) => {
            const Icon = row.icon;
            return (
              <div
                key={row.label}
                className="grid grid-cols-[1.5fr_0.8fr_0.8fr] items-center gap-3 border-t border-slate-200 px-4 py-4 text-sm text-slate-600 sm:px-6 sm:text-base"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-slate-100 p-2 text-slate-600">
                    <Icon size={18} />
                  </div>
                  <p className="leading-6 text-slate-700">{row.label}</p>
                </div>
                <p className="text-center">{row.free}</p>
                <p className="text-center font-semibold text-green-700">{row.plus}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-6 py-14 text-slate-600">Đang tải trang bảng giá...</div>}>
      <PricingPageContent />
    </Suspense>
  );
}
