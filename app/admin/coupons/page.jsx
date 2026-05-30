'use client'

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { DeleteIcon, PencilIcon, SaveIcon, XIcon } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";

export default function AdminCoupons() {
  const { getToken } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [ordersAnalytics, setOrdersAnalytics] = useState([]);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    description: "",
    discount: "",
    maxUses: "",
    forNewUser: false,
    forMember: false,
    isPublic: false,
    expiresAt: new Date(),
  });
  const [comboSetting, setComboSetting] = useState({
    maxComboItems: 1,
    comboDiscountPercent: 10,
  });
  const [shippingSetting, setShippingSetting] = useState({
    freeShipMinOrder: 200000,
    plusFreeShipMinOrder: 199000,
  });
  const [editingCode, setEditingCode] = useState("");
  const [editCoupon, setEditCoupon] = useState(null);

  const fetchCoupons = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/admin/coupon", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoupons(data.coupons || []);
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    }
  };

  const fetchComboSetting = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/admin/combo-setting", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data?.setting) {
        setComboSetting({
          maxComboItems: data.setting.maxComboItems,
          comboDiscountPercent: data.setting.comboDiscountPercent,
        });
      }
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    }
  };

  const fetchShippingSetting = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/admin/shipping-setting", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data?.setting) {
        setShippingSetting({
          freeShipMinOrder: data.setting.freeShipMinOrder,
          plusFreeShipMinOrder: data.setting.plusFreeShipMinOrder,
        });
      }
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    }
  };

  const fetchOrdersAnalytics = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/store/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrdersAnalytics(data.orders || []);
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    }
  };

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    try {
      const token = await getToken();
      const payload = {
        ...newCoupon,
        discount: Number(newCoupon.discount),
        maxUses: Number(newCoupon.maxUses || 0),
        expiresAt: new Date(newCoupon.expiresAt),
      };

      const { data } = await axios.post("/api/admin/coupon", { coupon: payload }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(data.message);
      await fetchCoupons();
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    }
  };

  const handleGenerateCouponCode = () => {
    const discount = Number(newCoupon.discount);
    if (!discount || discount <= 0) {
      toast.error("Vui lòng nhập Mức giảm (%) trước khi tạo mã");
      return;
    }

    let memberType = "GEN";
    if (newCoupon.forMember) memberType = "PLUS";
    else if (newCoupon.forNewUser) memberType = "NEW";

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const randomPart = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    const generatedCode = `${memberType}-${discount}-${randomPart}`;
    setNewCoupon({ ...newCoupon, code: generatedCode });
    toast.success("Đã tạo mã giảm giá tự động");
  };

  const handleUpdateComboSetting = async (e) => {
    e.preventDefault();
    try {
      const token = await getToken();
      const payload = {
        maxComboItems: Number(comboSetting.maxComboItems),
        comboDiscountPercent: Number(comboSetting.comboDiscountPercent),
      };
      const { data } = await axios.put("/api/admin/combo-setting", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(data.message || "Đã cập nhật cấu hình combo");
      setComboSetting({
        maxComboItems: data.setting.maxComboItems,
        comboDiscountPercent: data.setting.comboDiscountPercent,
      });
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    }
  };

  const deleteCoupon = async (code) => {
    const confirmed = window.confirm("Bạn có chắc muốn xóa mã giảm giá này?");
    if (!confirmed) return;
    try {
      const token = await getToken();
      await axios.delete(`/api/admin/coupon?code=${code}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchCoupons();
      toast.success("Đã xóa mã giảm giá thành công");
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    }
  };

  const startEditCoupon = (coupon) => {
    setEditingCode(coupon.code);
    setEditCoupon({
      code: coupon.code,
      description: coupon.description,
      discount: coupon.discount,
      maxUses: coupon.maxUses,
      expiresAt: format(coupon.expiresAt, "yyyy-MM-dd"),
      forNewUser: coupon.forNewUser,
      forMember: coupon.forMember,
      isPublic: coupon.isPublic,
    });
  };

  const cancelEditCoupon = () => {
    setEditingCode("");
    setEditCoupon(null);
  };

  const saveEditCoupon = async () => {
    if (!editCoupon?.code) return;
    try {
      const token = await getToken();
      await axios.put(
        "/api/admin/coupon",
        {
          code: editCoupon.code,
          coupon: {
            description: editCoupon.description,
            discount: Number(editCoupon.discount),
            maxUses: Number(editCoupon.maxUses || 0),
            expiresAt: editCoupon.expiresAt,
            forNewUser: editCoupon.forNewUser,
            forMember: editCoupon.forMember,
            isPublic: editCoupon.isPublic,
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Đã cập nhật mã giảm giá");
      cancelEditCoupon();
      await fetchCoupons();
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    }
  };

  const handleUpdateShippingSetting = async (e) => {
    e.preventDefault();
    try {
      const token = await getToken();
      const payload = {
        freeShipMinOrder: Number(shippingSetting.freeShipMinOrder),
        plusFreeShipMinOrder: Number(shippingSetting.plusFreeShipMinOrder),
      };
      const { data } = await axios.put("/api/admin/shipping-setting", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(data.message || "Đã cập nhật cấu hình miễn phí vận chuyển");
      setShippingSetting({
        freeShipMinOrder: data.setting.freeShipMinOrder,
        plusFreeShipMinOrder: data.setting.plusFreeShipMinOrder,
      });
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    }
  };

  useEffect(() => {
    fetchCoupons();
    fetchComboSetting();
    fetchShippingSetting();
    fetchOrdersAnalytics();
  }, []);

  const analytics = useMemo(() => {
    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;
    const sevenDaysLater = new Date(now.getTime() + 7 * dayMs);
    const VIETNAM_TZ = "Asia/Bangkok";
    const dateKeyFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: VIETNAM_TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const getDateKey = (value) => {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return null;
      const parts = dateKeyFormatter.formatToParts(d);
      const year = parts.find((p) => p.type === "year")?.value;
      const month = parts.find((p) => p.type === "month")?.value;
      const day = parts.find((p) => p.type === "day")?.value;
      if (!year || !month || !day) return null;
      return `${year}-${month}-${day}`;
    };
    const todayKey = getDateKey(now);
    const sevenDaysLaterKey = getDateKey(sevenDaysLater);
    const isCouponAvailable = (coupon) => {
      const expireKey = getDateKey(coupon?.expiresAt);
      const notExpired = expireKey && todayKey ? expireKey >= todayKey : false;
      const maxUses = Number(coupon?.maxUses || 0);
      const usedCount = Number(coupon?.usedCount || 0);
      const hasQuota = maxUses === 0 || usedCount < maxUses;
      return notExpired && hasQuota;
    };

    const expiredCoupons = coupons.filter((c) => {
      const expireKey = getDateKey(c?.expiresAt);
      if (!expireKey || !todayKey) return true;
      return expireKey < todayKey;
    });
    const outOfQuotaCoupons = coupons.filter((c) => Number(c.maxUses || 0) > 0 && Number(c.usedCount || 0) >= Number(c.maxUses || 0));
    const unavailableCodeSet = new Set([
      ...expiredCoupons.map((c) => c.code),
      ...outOfQuotaCoupons.map((c) => c.code),
    ]);
    const availableCoupons = coupons.filter((c) => !unavailableCodeSet.has(c.code) && isCouponAvailable(c));

    const mostUsedCoupon = [...coupons].sort((a, b) => Number(b.usedCount || 0) - Number(a.usedCount || 0))[0];
    const fastestDepletionCoupon = [...coupons]
      .filter((c) => Number(c.maxUses || 0) > 0)
      .sort((a, b) => (Number(b.usedCount || 0) / Number(b.maxUses || 1)) - (Number(a.usedCount || 0) / Number(a.maxUses || 1)))[0];

    const expiringSoonCoupons = coupons.filter((c) => {
      const expireKey = getDateKey(c.expiresAt);
      if (!expireKey || !todayKey || !sevenDaysLaterKey) return false;
      return isCouponAvailable(c) && expireKey >= todayKey && expireKey <= sevenDaysLaterKey;
    });
    const availableCouponsCount = Math.max(0, coupons.length - unavailableCodeSet.size);

    console.log("[COUPON_ANALYTICS][availability]", {
      nowISO: now.toISOString(),
      todayKey,
      totalCoupons: coupons.length,
      expiredCount: expiredCoupons.length,
      outOfQuotaCount: outOfQuotaCoupons.length,
      unavailableUniqueCount: unavailableCodeSet.size,
      availableCouponsCount,
      coupons: coupons.map((c) => {
        const expireKey = getDateKey(c?.expiresAt);
        const maxUses = Number(c?.maxUses || 0);
        const usedCount = Number(c?.usedCount || 0);
        return {
          code: c.code,
          expiresAtRaw: c.expiresAt,
          expireKey,
          maxUses,
          usedCount,
          isExpired: expireKey && todayKey ? expireKey < todayKey : true,
          isOutOfQuota: maxUses > 0 && usedCount >= maxUses,
          availableByRule: isCouponAvailable(c),
        };
      }),
    });

    const ordersWithCoupon = ordersAnalytics.filter((o) => {
      if (o?.isCouponUsed === true) return true;
      if (typeof o?.coupon === "object" && o?.coupon) {
        if (o.coupon.code) return true;
        if (Number(o.coupon.discount || 0) > 0) return true;
      }
      if (typeof o?.coupon === "string") {
        try {
          const parsed = JSON.parse(o.coupon);
          if (parsed?.code) return true;
          if (Number(parsed?.discount || 0) > 0) return true;
          return false;
        } catch {
          return false;
        }
      }
      return false;
    });
    const ordersWithoutCoupon = ordersAnalytics.filter((o) => !o.isCouponUsed);
    const revenueWithCoupon = ordersWithCoupon.reduce((sum, o) => sum + Number(o.total || 0), 0);
    const revenueWithoutCoupon = ordersWithoutCoupon.reduce((sum, o) => sum + Number(o.total || 0), 0);
    const totalRevenue = ordersAnalytics.reduce((sum, o) => sum + Number(o.total || 0), 0);
    const totalCouponUsedCount = ordersWithCoupon.length;
    const aovWithCoupon = ordersWithCoupon.length ? revenueWithCoupon / ordersWithCoupon.length : 0;
    const aovWithoutCoupon = ordersWithoutCoupon.length ? revenueWithoutCoupon / ordersWithoutCoupon.length : 0;

    const comboDiscountPercent = Number(comboSetting.comboDiscountPercent || 0);
    const comboRevenueProxy = ordersAnalytics.reduce((sum, order) => {
      const comboItems = (order.orderItems || []).filter((item) => Number(item.price) < Number(item.product?.price || 0));
      return sum + comboItems.reduce((itemSum, item) => itemSum + Number(item.price || 0) * Number(item.quantity || 0), 0);
    }, 0);

    const freeShipNormalThreshold = Number(shippingSetting.freeShipMinOrder || 0);
    const freeShipPlusThreshold = Number(shippingSetting.plusFreeShipMinOrder || 0);
    const plusOrders = ordersAnalytics.filter((o) => o.user?.membershipPlan === "plus" && o.user?.membershipStatus === "active");
    const regularOrders = ordersAnalytics.filter((o) => !(o.user?.membershipPlan === "plus" && o.user?.membershipStatus === "active"));
    const regularEligible = regularOrders.filter((o) => Number(o.total || 0) >= freeShipNormalThreshold).length;
    const plusEligible = plusOrders.filter((o) => Number(o.total || 0) >= freeShipPlusThreshold).length;
    const regularConversionProxy = regularOrders.length ? (regularEligible / regularOrders.length) * 100 : 0;
    const plusConversionProxy = plusOrders.length ? (plusEligible / plusOrders.length) * 100 : 0;
    const regularAov = regularOrders.length ? regularOrders.reduce((s, o) => s + Number(o.total || 0), 0) / regularOrders.length : 0;
    const plusAov = plusOrders.length ? plusOrders.reduce((s, o) => s + Number(o.total || 0), 0) / plusOrders.length : 0;

    return {
      availableCouponsCount,
      mostUsedCoupon,
      fastestDepletionCoupon,
      expiringSoonCoupons,
      expiredCoupons,
      outOfQuotaCoupons,
      ordersWithCouponCount: ordersWithCoupon.length,
      revenueWithCoupon,
      aovWithCoupon,
      aovWithoutCoupon,
      comboDiscountPercent,
      comboRevenueProxy,
      regularConversionProxy,
      plusConversionProxy,
      regularAov,
      plusAov,
      totalOrders: ordersAnalytics.length,
      totalCouponOrders: ordersWithCoupon.length,
      totalCouponUsedCount,
      totalRevenue,
    };
  }, [coupons, comboSetting, shippingSetting, ordersAnalytics]);

  const VIETNAM_TZ = "Asia/Bangkok";
  const dateKeyFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: VIETNAM_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const getDateKey = (value) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    const parts = dateKeyFormatter.formatToParts(d);
    const year = parts.find((p) => p.type === "year")?.value;
    const month = parts.find((p) => p.type === "month")?.value;
    const day = parts.find((p) => p.type === "day")?.value;
    if (!year || !month || !day) return null;
    return `${year}-${month}-${day}`;
  };
  const todayKey = getDateKey(new Date());
  const isCouponExpired = (coupon) => {
    const expireKey = getDateKey(coupon?.expiresAt);
    if (!expireKey || !todayKey) return false;
    return expireKey < todayKey;
  };

  const couponUsageByCode = useMemo(() => {
    const map = new Map();
    const normalizeCode = (code) => String(code || "").trim().toUpperCase();

    ordersAnalytics.forEach((order) => {
      let code = null;
      if (order?.coupon && typeof order.coupon === "object" && order.coupon.code) {
        code = order.coupon.code;
      } else if (typeof order?.coupon === "string") {
        try {
          const parsed = JSON.parse(order.coupon);
          code = parsed?.code || null;
        } catch {
          code = null;
        }
      }
      if (!code) return;
      const key = normalizeCode(code);
      map.set(key, (map.get(key) || 0) + 1);
    });

    return map;
  }, [ordersAnalytics]);

  return (
    <div className="mb-40 text-slate-500">
      <div className="w-full">
        <h2 className="text-2xl">Coupon, Combo, Freeship <span className="font-medium text-slate-800">hiệu quả</span></h2>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs text-slate-500">Mã còn hiệu lực</p>
            <p className="mt-1 text-2xl font-semibold text-slate-800">{analytics.availableCouponsCount}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs text-slate-500">Mã dùng nhiều nhất</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{analytics.mostUsedCoupon?.code || "—"}</p>
            <p className="text-xs text-slate-500">Lượt dùng: {analytics.mostUsedCoupon?.usedCount || 0}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs text-slate-500">Mã hết lượt nhanh</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{analytics.fastestDepletionCoupon?.code || "—"}</p>
            <p className="text-xs text-slate-500">{analytics.fastestDepletionCoupon ? `${Math.round((Number(analytics.fastestDepletionCoupon.usedCount || 0) / Number(analytics.fastestDepletionCoupon.maxUses || 1)) * 100)}% quota` : "Không giới hạn"}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs text-slate-500">Tổng lượt dùng coupon (theo Coupon.usedCount)</p>
            <p className="mt-1 text-2xl font-semibold text-slate-800">{analytics.totalCouponUsedCount}</p>
            <p className="text-xs text-slate-500">Đơn có coupon ghi nhận trong Order: {analytics.totalCouponOrders}</p>
            <p className="text-xs text-slate-500">Tổng doanh thu: {Math.round(analytics.totalRevenue).toLocaleString("vi-VN")} đ</p>
            <p className="text-xs text-emerald-700">Doanh thu từ đơn coupon: {Math.round(analytics.revenueWithCoupon).toLocaleString("vi-VN")} đ</p>
            <p className="text-[11px] text-slate-400">Tổng đơn đọc được: {analytics.totalOrders}</p>
            {analytics.totalCouponUsedCount !== analytics.totalCouponOrders && (
              <p className="text-[11px] text-amber-600">
                Cảnh báo: lượt dùng coupon và đơn coupon đang lệch nhau.
              </p>
            )}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-sm font-medium text-slate-700">Doanh thu từ combo (proxy)</p>
            <p className="mt-1 text-xl font-semibold text-slate-800">{Math.round(analytics.comboRevenueProxy).toLocaleString("vi-VN")} đ</p>
            <p className="text-xs text-slate-500">Mức giảm combo hiện tại: {analytics.comboDiscountPercent}%</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-sm font-medium text-slate-700">Tác động freeship đến conversion (proxy)</p>
            <p className="mt-1 text-sm text-slate-700">Khách thường đạt ngưỡng: <span className="font-semibold">{analytics.regularConversionProxy.toFixed(1)}%</span></p>
            <p className="text-sm text-slate-700">Khách Plus đạt ngưỡng: <span className="font-semibold">{analytics.plusConversionProxy.toFixed(1)}%</span></p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-sm font-medium text-slate-700">Tác động freeship đến AOV</p>
            <p className="mt-1 text-sm text-slate-700">AOV thường: <span className="font-semibold">{Math.round(analytics.regularAov).toLocaleString("vi-VN")} đ</span></p>
            <p className="text-sm text-slate-700">AOV Plus: <span className="font-semibold">{Math.round(analytics.plusAov).toLocaleString("vi-VN")} đ</span></p>
            <p className="text-xs text-slate-500">AOV đơn có coupon: {Math.round(analytics.aovWithCoupon).toLocaleString("vi-VN")} đ</p>
          </div>
        </div>

        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="font-medium text-amber-800">Cảnh báo coupon sắp hết hạn / hết lượt</p>
          <div className="mt-2 text-sm text-amber-900">
            <p>Sắp hết hạn (7 ngày): {analytics.expiringSoonCoupons.length ? analytics.expiringSoonCoupons.map((c) => c.code).join(", ") : "Không có"}</p>
            <p>Hết lượt: {analytics.outOfQuotaCoupons.length ? analytics.outOfQuotaCoupons.map((c) => c.code).join(", ") : "Không có"}</p>
          </div>
        </div>
      </div>

      <form onSubmit={(e) => toast.promise(handleAddCoupon(e), { loading: "Đang thêm mã giảm giá..." })} className="mt-14 max-w-sm text-sm">
        <h2 className="text-2xl">Thêm <span className="font-medium text-slate-800">Mã giảm giá</span></h2>
        <div className="mt-2 flex gap-2 max-sm:flex-col">
          <input type="text" placeholder="Mã giảm giá" className="mt-2 w-full rounded-md border border-slate-200 p-2 outline-slate-400" name="code" value={newCoupon.code} onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })} required />
          <input type="number" placeholder="Mức giảm (%)" min={1} max={100} className="mt-2 w-full rounded-md border border-slate-200 p-2 outline-slate-400" name="discount" value={newCoupon.discount} onChange={(e) => setNewCoupon({ ...newCoupon, discount: e.target.value })} required />
        </div>
        <input type="number" placeholder="Số lượng phát hành (0 = không giới hạn)" min={0} className="mt-2 w-full rounded-md border border-slate-200 p-2 outline-slate-400" name="maxUses" value={newCoupon.maxUses} onChange={(e) => setNewCoupon({ ...newCoupon, maxUses: e.target.value })} />
        <input type="text" placeholder="Mô tả mã giảm giá" className="mt-2 w-full rounded-md border border-slate-200 p-2 outline-slate-400" name="description" value={newCoupon.description} onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })} required />
        <label>
          <p className="mt-3">Ngày hết hạn</p>
          <input type="date" className="mt-1 w-full rounded-md border border-slate-200 p-2 outline-slate-400" name="expiresAt" value={format(newCoupon.expiresAt, "yyyy-MM-dd")} onChange={(e) => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })} />
        </label>
        <div className="mt-5">
          <label className="mt-3 flex gap-2">
            <input type="checkbox" checked={newCoupon.forNewUser} onChange={(e) => setNewCoupon({ ...newCoupon, forNewUser: e.target.checked, forMember: e.target.checked ? false : newCoupon.forMember })} />
            <span>Dành cho người dùng mới</span>
          </label>
          <label className="mt-3 flex gap-2">
            <input type="checkbox" checked={newCoupon.forMember} onChange={(e) => setNewCoupon({ ...newCoupon, forMember: e.target.checked, forNewUser: e.target.checked ? false : newCoupon.forNewUser })} />
            <span>Dành cho thành viên Plus</span>
          </label>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <button type="button" onClick={handleGenerateCouponCode} className="rounded bg-slate-200 p-2 px-6 text-slate-700 transition hover:bg-slate-300 active:scale-95">Tạo mã</button>
          <button className="rounded bg-emerald-600 p-2 px-10 text-white transition hover:bg-emerald-700 active:scale-95">Thêm mã</button>
        </div>
      </form>

      <div className="mt-14 w-full">
        <h2 className="text-2xl">Danh sách <span className="font-medium text-slate-800">Mã giảm giá</span></h2>
        <div className="mt-4 w-full overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Mã</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Mô tả</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Giảm giá</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Số lượng</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Hết hạn</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Người dùng mới</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Thành viên Plus</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {coupons.map((coupon) => (
                <tr key={coupon.code} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{coupon.code}</td>
                  <td className="px-4 py-3 text-slate-800">
                    {editingCode === coupon.code ? (
                      <input type="text" className="w-full rounded border border-slate-200 p-1.5" value={editCoupon?.description || ""} onChange={(e) => setEditCoupon({ ...editCoupon, description: e.target.value })} />
                    ) : coupon.description}
                  </td>
                  <td className="px-4 py-3 text-slate-800">
                    {editingCode === coupon.code ? (
                      <input type="number" min={1} max={100} className="w-24 rounded border border-slate-200 p-1.5" value={editCoupon?.discount ?? ""} onChange={(e) => setEditCoupon({ ...editCoupon, discount: e.target.value })} />
                    ) : `${coupon.discount}%`}
                  </td>
                  <td className="px-4 py-3 text-slate-800">
                    {editingCode === coupon.code ? (
                      <input type="number" min={0} className="w-24 rounded border border-slate-200 p-1.5" value={editCoupon?.maxUses ?? ""} onChange={(e) => setEditCoupon({ ...editCoupon, maxUses: e.target.value })} />
                    ) : (() => {
                      const usedFromOrders = couponUsageByCode.get(String(coupon.code).toUpperCase()) || 0;
                      return coupon.maxUses > 0 ? `${usedFromOrders}/${coupon.maxUses}` : `${usedFromOrders} (không giới hạn)`;
                    })()}
                  </td>
                  <td className={`px-4 py-3 ${isCouponExpired(coupon) ? "font-semibold text-red-600" : "text-slate-800"}`}>
                    {editingCode === coupon.code ? (
                      <input type="date" className="rounded border border-slate-200 p-1.5" value={editCoupon?.expiresAt || ""} onChange={(e) => setEditCoupon({ ...editCoupon, expiresAt: e.target.value })} />
                    ) : format(coupon.expiresAt, "yyyy-MM-dd")}
                  </td>
                  <td className="px-4 py-3 text-slate-800">
                    {editingCode === coupon.code ? (
                      <input type="checkbox" checked={Boolean(editCoupon?.forNewUser)} onChange={(e) => setEditCoupon({ ...editCoupon, forNewUser: e.target.checked, forMember: e.target.checked ? false : editCoupon?.forMember })} />
                    ) : coupon.forNewUser ? "Có" : "Không"}
                  </td>
                  <td className="px-4 py-3 text-slate-800">
                    {editingCode === coupon.code ? (
                      <input type="checkbox" checked={Boolean(editCoupon?.forMember)} onChange={(e) => setEditCoupon({ ...editCoupon, forMember: e.target.checked, forNewUser: e.target.checked ? false : editCoupon?.forNewUser })} />
                    ) : coupon.forMember ? "Có" : "Không"}
                  </td>
                  <td className="px-4 py-3 text-slate-800">
                    <div className="flex items-center gap-2">
                      {editingCode === coupon.code ? (
                        <>
                          <SaveIcon onClick={() => toast.promise(saveEditCoupon(), { loading: "Đang lưu..." })} className="h-5 w-5 cursor-pointer text-emerald-600 hover:text-emerald-800" />
                          <XIcon onClick={cancelEditCoupon} className="h-5 w-5 cursor-pointer text-slate-500 hover:text-slate-700" />
                        </>
                      ) : (
                        <PencilIcon onClick={() => startEditCoupon(coupon)} className="h-5 w-5 cursor-pointer text-blue-500 hover:text-blue-700" />
                      )}
                      <DeleteIcon onClick={() => toast.promise(deleteCoupon(coupon.code), { loading: "Đang xóa mã..." })} className="h-5 w-5 cursor-pointer text-red-500 hover:text-red-800" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-14 max-w-sm text-sm">
        <h2 className="text-2xl">Quản lý <span className="font-medium text-slate-800">Miễn phí vận chuyển</span></h2>
        <form onSubmit={(e) => toast.promise(handleUpdateShippingSetting(e), { loading: "Đang cập nhật miễn phí vận chuyển..." })}>
          <label className="mt-4 block">
            <p>Đơn tối thiểu miễn phí vận chuyển (thành viên thường)</p>
            <input type="number" min={0} className="mt-1 w-full rounded-md border border-slate-200 p-2 outline-slate-400" value={shippingSetting.freeShipMinOrder} onChange={(e) => setShippingSetting({ ...shippingSetting, freeShipMinOrder: e.target.value })} required />
          </label>
          <label className="mt-3 block">
            <p>Đơn tối thiểu miễn phí vận chuyển (thành viên Plus)</p>
            <input type="number" min={0} className="mt-1 w-full rounded-md border border-slate-200 p-2 outline-slate-400" value={shippingSetting.plusFreeShipMinOrder} onChange={(e) => setShippingSetting({ ...shippingSetting, plusFreeShipMinOrder: e.target.value })} required />
          </label>
          <button className="mt-4 rounded bg-emerald-600 p-2 px-10 text-white transition hover:bg-emerald-700 active:scale-95">Lưu cấu hình miễn phí vận chuyển</button>
        </form>
      </div>

      <div className="mt-14 max-w-sm text-sm">
        <h2 className="text-2xl">Quản lý <span className="font-medium text-slate-800">Combo</span></h2>
        <form onSubmit={(e) => toast.promise(handleUpdateComboSetting(e), { loading: "Đang cập nhật cấu hình combo..." })}>
          <label className="mt-4 block">
            <p>Số sản phẩm combo tối đa</p>
            <input type="number" min={1} max={10} className="mt-1 w-full rounded-md border border-slate-200 p-2 outline-slate-400" value={comboSetting.maxComboItems} onChange={(e) => setComboSetting({ ...comboSetting, maxComboItems: e.target.value })} required />
          </label>
          <label className="mt-3 block">
            <p>Mức giảm combo (%)</p>
            <input type="number" min={1} max={90} className="mt-1 w-full rounded-md border border-slate-200 p-2 outline-slate-400" value={comboSetting.comboDiscountPercent} onChange={(e) => setComboSetting({ ...comboSetting, comboDiscountPercent: e.target.value })} required />
          </label>
          <button className="mt-4 rounded bg-emerald-600 p-2 px-10 text-white transition hover:bg-emerald-700 active:scale-95">Lưu cấu hình combo</button>
        </form>
      </div>
    </div>
  );
}
