import React, { useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import { PlusIcon, SquarePenIcon, XIcon } from "lucide-react";
import AddressModal from "./AddressModal";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Protect, useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";

import { formatMoney } from "../lib/format";
import { fetchCart } from "../lib/features/cart/cartSlice";

const OrderSummary = ({ totalPrice, items }) => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const dispatch = useDispatch();

  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";
  const router = useRouter();
  const addressList = useSelector(state => state.address.list);
  const shippingFee = 50000;

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [coupon, setCoupon] = useState("");

  const handleCouponCode = async (e) => {
    e.preventDefault();

    try {
      if (!user) {
        return toast.error("Vui lòng đăng nhập để áp dụng mã giảm giá");
      }

      const token = await getToken();
      const { data } = await axios.post("/api/coupon", { code: couponCodeInput }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCoupon(data.coupon);
      toast.success("Áp dụng mã giảm giá thành công");
    } catch (error) {
      console.error("Error applying coupon:", error);
      toast.error(error?.response?.data?.error || error.message);
    }
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    try {
      if (!user) {
        return toast.error("Vui lòng đăng nhập để đặt hàng");
      }

      if (!selectedAddress) {
        return toast.error("Vui lòng chọn địa chỉ nhận hàng");
      }

      const token = await getToken();

      const orderData = {
        addressId: selectedAddress.id,
        items,
        paymentMethod,
      };

      if (coupon) {
        orderData.couponCode = coupon.code;
      }

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
  }

  return (
    <div className='w-full max-w-lg rounded-xl border border-slate-200 bg-slate-50/30 p-7 text-sm text-slate-500 lg:max-w-[340px]'>
      <h2 className='text-xl font-medium text-slate-600'>Tóm tắt thanh toán</h2>

      <p className='my-4 text-xs text-slate-400'>Phương thức thanh toán</p>

      <div className='flex items-center gap-2'>
        <input type="radio" id="COD" onChange={() => setPaymentMethod('COD')} checked={paymentMethod === 'COD'} className='accent-gray-500' />
        <label htmlFor="COD" className='cursor-pointer'>Thanh toán khi nhận hàng</label>
      </div>

      <div className='mt-1 flex items-center gap-2'>
        <input type="radio" id="STRIPE" name='payment' onChange={() => setPaymentMethod('STRIPE')} checked={paymentMethod === 'STRIPE'} className='accent-gray-500' />
        <label htmlFor="STRIPE" className='cursor-pointer'>Thanh toán qua Stripe</label>
      </div>

      <div className='my-4 border-y border-slate-200 py-4 text-slate-400'>
        <p>Địa chỉ nhận hàng</p>
        {
          selectedAddress ? (
            <div className='flex items-center gap-2'>
              <p>{selectedAddress.name}, {selectedAddress.city}, {selectedAddress.state}, {selectedAddress.zip}</p>
              <SquarePenIcon onClick={() => setSelectedAddress(null)} className='cursor-pointer' size={18} />
            </div>
          ) : (
            <div>
              {
                addressList.length > 0 && (
                  <select className='my-3 w-full rounded border border-slate-400 p-2 outline-none' onChange={(e) => setSelectedAddress(addressList[e.target.value])} >
                    <option value="">Chọn địa chỉ</option>
                    {
                      addressList.map((address, index) => (
                        <option key={index} value={index}>{address.name}, {address.city}, {address.state}, {address.zip}</option>
                      ))
                    }
                  </select>
                )
              }

              <button className='mt-1 flex items-center gap-1 text-slate-600' onClick={() => setShowAddressModal(true)}>Thêm địa chỉ <PlusIcon size={18} /></button>
            </div>
          )
        }
      </div>

      <div className='border-b border-slate-200 pb-4'>
        <div className='flex justify-between'>
          <div className='flex flex-col gap-1 text-slate-400'>
            <p>Tạm tính:</p>
            <p>Phí vận chuyển:</p>
            {coupon && <p>Mã giảm giá:</p>}
          </div>

          <div className='flex flex-col gap-1 text-right font-medium'>
            <p>{formatMoney(totalPrice, currency)}</p>

            <Protect plan={'plus'} fallback={formatMoney(shippingFee, currency)}>
              <p>Miễn phí</p>
            </Protect>

            {coupon && <p>{`-${formatMoney((coupon.discount / 100) * totalPrice, currency)}`}</p>}
          </div>
        </div>

        {!coupon ? (
          <form onSubmit={e => toast.promise(handleCouponCode(e), { loading: 'Đang kiểm tra mã...' })} className='mt-3 flex justify-center gap-3'>
            <input onChange={(e) => setCouponCodeInput(e.target.value)} value={couponCodeInput} type="text" placeholder='Mã giảm giá' className='w-full rounded border border-slate-400 p-1.5 outline-none' />
            <button className='min-w-fit whitespace-nowrap rounded bg-slate-600 px-3 text-white transition-all hover:bg-slate-800 active:scale-95'>Áp dụng</button>
          </form>
        ) : (
          <div className='mt-2 flex w-full items-center justify-center gap-2 text-xs'>
            <p>Mã: <span className='ml-1 font-semibold'>{coupon.code.toUpperCase()}</span></p>
            <p>{coupon.description}</p>
            <XIcon size={18} onClick={() => setCoupon('')} className='cursor-pointer transition hover:text-red-700' />
          </div>
        )}
      </div>

      <div className='flex justify-between py-4'>
        <p>Tổng cộng:</p>
        <p className='text-right font-medium'>
          <Protect plan={'plus'} fallback={`${coupon ? formatMoney(totalPrice + shippingFee - (coupon.discount / 100) * totalPrice, currency) : formatMoney(totalPrice + shippingFee, currency)}`}>
            {coupon ? formatMoney(totalPrice - (coupon.discount / 100) * totalPrice, currency) : formatMoney(totalPrice, currency)}
          </Protect>
        </p>
      </div>

      <button onClick={e => toast.promise(handlePlaceOrder(e), { loading: 'Đang đặt hàng...' })} className='w-full rounded bg-slate-700 py-2.5 text-white transition-all hover:bg-slate-900 active:scale-95'>Đặt hàng</button>

      {showAddressModal && <AddressModal setShowAddressModal={setShowAddressModal} />}
    </div>
  );
}

export default OrderSummary;
