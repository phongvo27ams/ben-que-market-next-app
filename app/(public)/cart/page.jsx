'use client'

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ShoppingCartIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";

import Counter from "../../../components/Counter";
import OrderSummary from "../../../components/OrderSummary";
import PageTitle from "../../../components/PageTitle";
import ProductCard from "../../../components/ProductCard";
import { deleteItemFromCart, addToCart, setComboProduct } from "../../../lib/features/cart/cartSlice";
import { formatMoney } from "../../../lib/format";

const COMBO_DISCOUNT_PERCENT = 10;
const MAX_COMBO_ITEMS = 1;

export default function Cart() {
  const { cartItems, comboProductId } = useSelector((state) => state.cart);
  const products = useSelector((state) => state.product.list);
  const dispatch = useDispatch();

  const [cartArray, setCartArray] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const createCartArray = () => {
    let nextTotalPrice = 0;
    const nextCartArray = [];

    for (const [key, value] of Object.entries(cartItems)) {
      const product = products.find((item) => item.id === key);
      if (!product) continue;

      nextCartArray.push({
        ...product,
        quantity: value,
      });
      nextTotalPrice += product.price * value;
    }

    setCartArray(nextCartArray);
    setTotalPrice(nextTotalPrice);
  };

  const handleDeleteItemFromCart = (productId) => {
    dispatch(deleteItemFromCart({ productId }));
  };

  const handleAddComboProduct = (product) => {
    const selectedComboStillInCart = comboProductId && cartItems[comboProductId];

    if (selectedComboStillInCart && comboProductId !== product.id) {
      toast.error(`Bạn chỉ có thể thêm tối đa ${MAX_COMBO_ITEMS} sản phẩm combo`);
      return;
    }

    if (product.inStock <= 0) {
      toast.error("Sản phẩm này hiện đã hết hàng");
      return;
    }

    if ((cartItems[product.id] || 0) >= product.inStock) {
      toast.error(`Chỉ còn ${product.inStock} sản phẩm trong kho`);
      return;
    }

    dispatch(addToCart({ productId: product.id }));
    dispatch(setComboProduct({ productId: product.id }));
    toast.success(`Đã thêm sản phẩm combo với ưu đãi ${COMBO_DISCOUNT_PERCENT}%`);
  };

  useEffect(() => {
    if (products.length > 0) {
      createCartArray();
    }
  }, [cartItems, products]);

  const comboSuggestions = useMemo(() => {
    if (!cartArray.length) return [];

    const cartProductIds = new Set(cartArray.map((item) => item.id));
    const cartCategories = new Set(cartArray.map((item) => item.category).filter(Boolean));
    const cartOrigins = new Set(cartArray.map((item) => item.origin).filter(Boolean));

    return products
      .filter((product) => {
        if (cartProductIds.has(product.id)) return false;

        const sameCategory = cartCategories.has(product.category);
        const sameOrigin = product.origin && cartOrigins.has(product.origin);

        return sameCategory || sameOrigin;
      })
      .slice(0, 4);
  }, [cartArray, products]);

  const selectedComboStillInCart = comboProductId && cartItems[comboProductId];

  return cartArray.length > 0 ? (
    <div className="mx-6 min-h-screen text-slate-800">
      <div className="mx-auto max-w-7xl">
        <PageTitle heading="Giỏ hàng" text="những sản phẩm bạn đã chọn" linkText="Mua thêm" />

        <div className="flex items-start justify-between gap-5 max-lg:flex-col">
          <table className="w-full max-w-4xl table-auto text-slate-600">
            <thead>
              <tr className="max-sm:text-sm">
                <th className="text-left">Sản phẩm</th>
                <th>Số lượng</th>
                <th>Thành tiền</th>
                <th className="max-md:hidden">Xóa</th>
              </tr>
            </thead>
            <tbody>
              {cartArray.map((item) => (
                <tr key={item.id} className="space-x-2">
                  <td className="my-4 flex gap-3">
                    <Link href={`/product/${item.id}`} className="flex gap-3">
                      <div className="flex size-18 items-center justify-center gap-3 rounded-md bg-slate-100 transition hover:bg-slate-200">
                        <Image src={item.images[0]} className="h-14 w-auto" alt={item.name} width={45} height={45} />
                      </div>
                      <div>
                        <p className="max-sm:text-sm transition hover:text-green-600">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.category}</p>
                        <p className="text-xs text-slate-400">{item.origin || "Chưa cập nhật xuất xứ"}</p>
                        <p>{formatMoney(item.price)}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="text-center">
                    <Counter productId={item.id} maxStock={item.inStock} />
                  </td>
                  <td className="text-center">{formatMoney(item.price * item.quantity)}</td>
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

        {comboSuggestions.length > 0 && (
          <section className="mt-14 pb-12">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-green-600">Gợi ý combo</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-800">Chọn thêm 1 sản phẩm phù hợp</h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-500">
                  Hệ thống chỉ gợi ý các sản phẩm cùng danh mục hoặc cùng xuất xứ với giỏ hàng hiện tại.
                  Bạn chỉ có thể thêm tối đa {MAX_COMBO_ITEMS} sản phẩm combo để nhận ưu đãi thêm {COMBO_DISCOUNT_PERCENT}%.
                </p>
              </div>
              <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">
                Ưu đãi combo hiện tại: <span className="font-semibold">-{COMBO_DISCOUNT_PERCENT}%</span>
              </div>
            </div>

            {selectedComboStillInCart && (
              <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                Bạn đã thêm 1 sản phẩm combo. Hãy xóa sản phẩm combo hiện tại khỏi giỏ nếu muốn chọn sản phẩm combo khác.
              </div>
            )}

            <div className="grid grid-cols-2 justify-items-center gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
              {comboSuggestions.map((product) => {
                const isAnotherComboLocked = selectedComboStillInCart && comboProductId !== product.id;

                return (
                  <div key={product.id} className="w-full max-w-[220px]">
                    <div className="mb-3 rounded-2xl border border-dashed border-green-200 bg-green-50 px-3 py-2 text-center text-xs font-medium text-green-700">
                      {product.origin ? `${product.origin} • ` : ""}Giảm thêm {COMBO_DISCOUNT_PERCENT}%
                    </div>
                    <ProductCard product={product} compact showQuickBuy={false} />
                    <button
                      type="button"
                      onClick={() => handleAddComboProduct(product)}
                      disabled={Boolean(isAnotherComboLocked)}
                      className={`mt-3 w-full rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                        isAnotherComboLocked
                          ? "cursor-not-allowed bg-slate-200 text-slate-500"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {isAnotherComboLocked
                        ? "Đã đủ 1 sản phẩm combo"
                        : `Thêm combo -${COMBO_DISCOUNT_PERCENT}%`}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}
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
