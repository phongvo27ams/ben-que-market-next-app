import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PlusIcon, SquarePenIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import toast from "react-hot-toast";

import AddressModal from "./AddressModal";
import { formatMoney } from "../lib/format";
import { fetchCart } from "../lib/features/cart/cartSlice";

const DEFAULT_COMBO_DISCOUNT_PERCENT = 10;
const DEFAULT_MAX_COMBO_ITEMS = 1;

const OrderSummary = ({ totalPrice, items }) => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const router = useRouter();

  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";
  const addressList = useSelector((state) => state.address.list);
  const { cartItems, comboProductIds = [] } = useSelector((state) => state.cart);
  const shippingFee = 50000;
  const defaultPlusFreeShipMinOrder = Number(process.env.NEXT_PUBLIC_PLUS_FREE_SHIP_MIN_ORDER || 199000);
  const defaultFreeShipMinOrder = Number(process.env.NEXT_PUBLIC_FREE_SHIP_MIN_ORDER || 200000);

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [coupon, setCoupon] = useState("");
  const [isPlusMember, setIsPlusMember] = useState(false);
  const [comboDiscountPercent, setComboDiscountPercent] = useState(DEFAULT_COMBO_DISCOUNT_PERCENT);
  const [maxComboItems, setMaxComboItems] = useState(DEFAULT_MAX_COMBO_ITEMS);
  const [freeShipMinOrder, setFreeShipMinOrder] = useState(defaultFreeShipMinOrder);
  const [plusFreeShipMinOrder, setPlusFreeShipMinOrder] = useState(defaultPlusFreeShipMinOrder);

  useEffect(() => {
    const fetchMembership = async () => {
      try {
        if (!user) {
          setIsPlusMember(false);
          return;
        }

        const token = await getToken();
        const { data } = await axios.get("/api/user/membership", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsPlusMember(Boolean(data?.isPlus));
      } catch {
        setIsPlusMember(false);
      }
    };

    fetchMembership();
  }, [user, getToken]);

  useEffect(() => {
    const fetchComboSetting = async () => {
      try {
        const response = await fetch("/api/combo-setting", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        const maxItems = Number(data?.setting?.maxComboItems);
        const discount = Number(data?.setting?.comboDiscountPercent);
        if (Number.isInteger(maxItems) && maxItems > 0) setMaxComboItems(maxItems);
        if (!Number.isNaN(discount) && discount > 0) setComboDiscountPercent(discount);
      } catch {
        setMaxComboItems(DEFAULT_MAX_COMBO_ITEMS);
        setComboDiscountPercent(DEFAULT_COMBO_DISCOUNT_PERCENT);
      }
    };

    fetchComboSetting();
  }, []);

  useEffect(() => {
    const fetchShippingSetting = async () => {
      try {
        const response = await fetch("/api/shipping-setting", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        const freeThreshold = Number(data?.setting?.freeShipMinOrder);
        const plusThreshold = Number(data?.setting?.plusFreeShipMinOrder);
        if (!Number.isNaN(freeThreshold) && freeThreshold >= 0) setFreeShipMinOrder(freeThreshold);
        if (!Number.isNaN(plusThreshold) && plusThreshold >= 0) setPlusFreeShipMinOrder(plusThreshold);
      } catch {
        setFreeShipMinOrder(defaultFreeShipMinOrder);
        setPlusFreeShipMinOrder(defaultPlusFreeShipMinOrder);
      }
    };

    fetchShippingSetting();
  }, [defaultFreeShipMinOrder, defaultPlusFreeShipMinOrder]);

  const selectedComboIds = useMemo(
    () => comboProductIds.filter((id) => Boolean(cartItems[id])).slice(0, maxComboItems),
    [comboProductIds, cartItems, maxComboItems]
  );

  const comboDiscountAmount = useMemo(() => {
    if (!isPlusMember) return 0;
    return selectedComboIds.reduce((sum, comboId) => {
      const comboItem = items.find((item) => item.id === comboId);
      if (!comboItem) return sum;
      return sum + comboItem.price * (comboDiscountPercent / 100);
    }, 0);
  }, [isPlusMember, selectedComboIds, items, comboDiscountPercent]);

  const handleCouponCode = async (e) => {
    e.preventDefault();

    try {
      if (!user) return toast.error("Vui lòng đăng nhập để áp dụng mã giảm giá");

      const token = await getToken();
      const { data } = await axios.post(
        "/api/coupon",
        { code: couponCodeInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCoupon(data.coupon);
      toast.success("Áp dụng mã giảm giá thành công");
    } catch (error) {
      console.error("Error applying coupon:", error);
      toast.error(error?.response?.data?.error || error.message);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    try {
      if (!user) return toast.error("Vui lòng đăng nhập để đặt hàng");
      if (!selectedAddress) return toast.error("Vui lòng chọn địa chỉ nhận hàng");

      const token = await getToken();
      const orderData = {
        addressId: selectedAddress.id,
        items,
        paymentMethod,
      };

      if (coupon) orderData.couponCode = coupon.code;

      const { data } = await axios.post("/api/orders", orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (paymentMethod === "STRIPE") {
        window.location.href = data.session.url;
      } else {
        toast.success(data.message);
        router.push("/orders");
        dispatch(fetchCart({ getToken }));
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error(error?.response?.data?.error || error.message);
    }
  };

  const subtotalAfterCombo = Math.max(0, totalPrice - comboDiscountAmount);
  const couponAmount = coupon ? (coupon.discount / 100) * subtotalAfterCombo : 0;
  const subtotalAfterDiscount = subtotalAfterCombo - couponAmount;
  const freeShipThreshold = isPlusMember ? plusFreeShipMinOrder : freeShipMinOrder;
  const qualifiesFreeShip = subtotalAfterDiscount >= freeShipThreshold;
  const finalTotal = qualifiesFreeShip ? subtotalAfterDiscount : subtotalAfterDiscount + shippingFee;

  return (
    <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-slate-50/30 p-7 text-sm text-slate-500 lg:max-w-[340px]">
      <h2 className="text-xl font-medium text-slate-600">Tóm tắt thanh toán</h2>

      <p className="my-4 text-xs text-slate-400">Phương thức thanh toán</p>

      <div className="flex items-center gap-2">
        <input type="radio" id="COD" onChange={() => setPaymentMethod("COD")} checked={paymentMethod === "COD"} className="accent-gray-500" />
        <label htmlFor="COD" className="cursor-pointer">Thanh toán khi nhận hàng</label>
      </div>

      <div className="mt-1 flex items-center gap-2">
        <input type="radio" id="STRIPE" name="payment" onChange={() => setPaymentMethod("STRIPE")} checked={paymentMethod === "STRIPE"} className="accent-gray-500" />
        <label htmlFor="STRIPE" className="cursor-pointer">Thanh toán qua Stripe</label>
      </div>

      <div className="my-4 border-y border-slate-200 py-4 text-slate-400">
        <p>Địa chỉ nhận hàng</p>
        {selectedAddress ? (
          <div className="flex items-center gap-2">
            <p>{selectedAddress.name}, {selectedAddress.city}, {selectedAddress.state}, {selectedAddress.zip}</p>
            <SquarePenIcon onClick={() => setSelectedAddress(null)} className="cursor-pointer" size={18} />
          </div>
        ) : (
          <div>
            {addressList.length > 0 && (
              <select className="my-3 w-full rounded border border-slate-400 p-2 outline-none" onChange={(e) => setSelectedAddress(addressList[e.target.value])}>
                <option value="">Chọn địa chỉ</option>
                {addressList.map((address, index) => (
                  <option key={index} value={index}>
                    {address.name}, {address.city}, {address.state}, {address.zip}
                  </option>
                ))}
              </select>
            )}
            <button className="mt-1 flex items-center gap-1 text-slate-600" onClick={() => setShowAddressModal(true)}>
              Thêm địa chỉ <PlusIcon size={18} />
            </button>
          </div>
        )}
      </div>

      <div className="border-b border-slate-200 pb-4">
        <div className="flex justify-between">
          <div className="flex flex-col gap-1 text-slate-400">
            <p>Tạm tính:</p>
            {comboDiscountAmount > 0 && <p>Giảm combo:</p>}
            <p>Phí vận chuyển:</p>
            {coupon && <p>Mã giảm giá:</p>}
          </div>

          <div className="flex flex-col gap-1 text-right font-medium">
            <p>{formatMoney(totalPrice, currency)}</p>
            {comboDiscountAmount > 0 && <p>{`-${formatMoney(comboDiscountAmount, currency)}`}</p>}
            {qualifiesFreeShip ? <p>Miễn phí</p> : <p>{formatMoney(shippingFee, currency)}</p>}
            {coupon && <p>{`-${formatMoney(couponAmount, currency)}`}</p>}
          </div>
        </div>

        {isPlusMember && !qualifiesFreeShip && (
          <p className="mt-2 text-xs text-amber-600">
            Plus miễn phí vận chuyển cho đơn từ {formatMoney(plusFreeShipMinOrder, currency)}
          </p>
        )}
        {!isPlusMember && (
          <p className="mt-2 text-xs text-amber-600">
            Miễn phí vận chuyển cho đơn từ {formatMoney(freeShipMinOrder, currency)}.
            Nâng cấp Plus để nhận ưu đãi từ {formatMoney(plusFreeShipMinOrder, currency)}
          </p>
        )}

        {!coupon ? (
          <form onSubmit={(e) => toast.promise(handleCouponCode(e), { loading: "Đang kiểm tra mã..." })} className="mt-3 flex justify-center gap-3">
            <input onChange={(e) => setCouponCodeInput(e.target.value)} value={couponCodeInput} type="text" placeholder="Mã giảm giá" className="w-full rounded border border-slate-400 p-1.5 outline-none" />
            <button className="min-w-fit whitespace-nowrap rounded bg-slate-600 px-3 text-white transition-all hover:bg-slate-800 active:scale-95">
              Áp dụng
            </button>
          </form>
        ) : (
          <div className="mt-2 flex w-full items-center justify-center gap-2 text-xs">
            <p>Mã: <span className="ml-1 font-semibold">{coupon.code.toUpperCase()}</span></p>
            <p>{coupon.description}</p>
            <XIcon size={18} onClick={() => setCoupon("")} className="cursor-pointer transition hover:text-red-700" />
          </div>
        )}
      </div>

      <div className="flex justify-between py-4">
        <p>Tổng cộng:</p>
        <p className="text-right font-medium">{formatMoney(finalTotal, currency)}</p>
      </div>

      <button onClick={(e) => toast.promise(handlePlaceOrder(e), { loading: "Đang đặt hàng..." })} className="w-full rounded bg-slate-700 py-2.5 text-white transition-all hover:bg-slate-900 active:scale-95">
        Đặt hàng
      </button>

      {showAddressModal && <AddressModal setShowAddressModal={setShowAddressModal} />}
    </div>
  );
};

export default OrderSummary;
