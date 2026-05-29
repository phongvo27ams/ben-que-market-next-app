'use client'

import React from "react";
import toast from "react-hot-toast";

export default function Banner() {
  const [bannerCoupon, setBannerCoupon] = React.useState(null);
  const [bannerText, setBannerText] = React.useState("");
  const [isVisible, setIsVisible] = React.useState(true);

  const fetchBannerCoupon = React.useCallback(async () => {
    try {
      const response = await fetch("/api/coupon/banner", { cache: "no-store" });
      if (!response.ok) {
        setBannerCoupon(null);
        setBannerText("");
        return;
      }
      const data = await response.json();
      setBannerCoupon(data?.coupon || null);
      setBannerText(data?.message || "");
    } catch {
      setBannerCoupon(null);
      setBannerText("");
    }
  }, []);

  React.useEffect(() => {
    fetchBannerCoupon();
  }, [fetchBannerCoupon]);

  const handleClaim = async () => {
    if (!bannerCoupon?.code) return;
    let latestCoupon = bannerCoupon;
    try {
      const response = await fetch("/api/coupon/banner", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        latestCoupon = data?.coupon || null;
      }
    } catch {
      latestCoupon = bannerCoupon;
    }

    if (!latestCoupon || latestCoupon.code !== bannerCoupon.code) {
      toast.error("Ưu đãi này đã hết hiệu lực.");
      setBannerCoupon(null);
      setBannerText("");
      setIsVisible(false);
      return;
    }

    try {
      await navigator.clipboard.writeText(latestCoupon.code);
      toast.success("Mã giảm giá đã được sao chép vào clipboard!");
    } catch {
      toast.success(`Mã ưu đãi: ${latestCoupon.code}`);
    }
  };

  if (!bannerCoupon || !isVisible) return null;

  return (
    <div className="w-full bg-gradient-to-r from-emerald-600 via-green-600 to-lime-500 px-4 py-2 text-white sm:px-6 sm:py-1">
      <div className="mx-auto flex max-w-7xl items-start justify-between gap-3 sm:items-center">
        <div className="min-w-0">
          <p className="text-left text-[15px] font-semibold leading-6 sm:text-center sm:text-base">
            {bannerText || `Ưu đãi giảm ${bannerCoupon.discount}% với mã ${bannerCoupon.code}`}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <button
            onClick={handleClaim}
            type="button"
            className="rounded-full bg-white px-4 py-2 text-xs font-medium text-gray-800 transition hover:bg-slate-100 active:scale-95 sm:px-7 sm:text-sm"
          >
            Nhận ưu đãi
          </button>
        </div>
      </div>
    </div>
  );
}
