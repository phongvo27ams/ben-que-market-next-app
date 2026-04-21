'use client'

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteItemFromCart } from "../../../lib/features/cart/cartSlice";
import { ShoppingCartIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import Counter from "../../../components/Counter";
import OrderSummary from "../../../components/OrderSummary";
import PageTitle from "../../../components/PageTitle";
import { formatMoney } from "../../../lib/format";

export default function Cart() {
  const { cartItems } = useSelector(state => state.cart);
  const products = useSelector(state => state.product.list);
  const dispatch = useDispatch();

  const [cartArray, setCartArray] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const createCartArray = () => {
    setTotalPrice(0);
    const nextCartArray = [];

    for (const [key, value] of Object.entries(cartItems)) {
      const product = products.find((item) => item.id === key);
      if (product) {
        nextCartArray.push({
          ...product,
          quantity: value,
        });
        setTotalPrice((prev) => prev + product.price * value);
      }
    }

    setCartArray(nextCartArray);
  };

  const handleDeleteItemFromCart = (productId) => {
    dispatch(deleteItemFromCart({ productId }));
  };

  useEffect(() => {
    if (products.length > 0) {
      createCartArray();
    }
  }, [cartItems, products]);

  return cartArray.length > 0 ? (
    <div className="mx-6 min-h-screen text-slate-800">
      <div className="mx-auto max-w-7xl">
        <PageTitle heading="My Cart" text="items in your cart" linkText="Add more" />

        <div className="flex items-start justify-between gap-5 max-lg:flex-col">
          <table className="w-full max-w-4xl table-auto text-slate-600">
            <thead>
              <tr className="max-sm:text-sm">
                <th className="text-left">Product</th>
                <th>Quantity</th>
                <th>Total Price</th>
                <th className="max-md:hidden">Remove</th>
              </tr>
            </thead>
            <tbody>
              {cartArray.map((item, index) => (
                <tr key={index} className="space-x-2">
                  <td className="my-4 flex gap-3">
                    <div className="flex size-18 items-center justify-center gap-3 rounded-md bg-slate-100">
                      <Image src={item.images[0]} className="h-14 w-auto" alt={item.name} width={45} height={45} />
                    </div>
                    <div>
                      <p className="max-sm:text-sm">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.category}</p>
                      <p>{formatMoney(item.price)}</p>
                    </div>
                  </td>
                  <td className="text-center">
                    <Counter productId={item.id} maxStock={item.inStock} />
                  </td>
                  <td className="text-center">{formatMoney(item.price * item.quantity).toLocaleString()}</td>
                  <td className="text-center max-md:hidden">
                    <button
                      onClick={() => handleDeleteItemFromCart(item.id)}
                      className="rounded-full p-2.5 text-red-500 transition-all hover:bg-red-50 active:scale-95"
                    >
                      <Trash2Icon size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <OrderSummary totalPrice={totalPrice} items={cartArray} />
        </div>
      </div>
    </div>
  ) : (
    <div className="mx-6 flex min-h-[80vh] items-center justify-center">
      <div className="max-w-xl rounded-3xl border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
          <ShoppingCartIcon size={28} />
        </div>
        <h1 className="text-2xl font-semibold text-slate-800">Giỏ hàng của bạn đang trống</h1>
        <p className="mt-3 text-slate-500">
          Hãy khám phá thêm những sản phẩm đặc sắc và thêm chúng vào giỏ để tiếp tục mua sắm.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex rounded-full bg-green-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-green-700"
        >
          Khám phá sản phẩm
        </Link>
      </div>
    </div>
  );
}
