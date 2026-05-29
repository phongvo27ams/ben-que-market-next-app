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

const DEFAULT_COMBO_DISCOUNT_PERCENT = 10;
const DEFAULT_MAX_COMBO_ITEMS = 1;

export default function Cart() {
  const { cartItems, comboProductIds = [], comboLinks = {} } = useSelector((state) => state.cart);
  const products = useSelector((state) => state.product.list);
  const dispatch = useDispatch();

  const [cartArray, setCartArray] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [membershipPlan, setMembershipPlan] = useState("free");
  const [membershipStatus, setMembershipStatus] = useState("inactive");
  const [comboDiscountPercent, setComboDiscountPercent] = useState(DEFAULT_COMBO_DISCOUNT_PERCENT);
  const [maxComboItems, setMaxComboItems] = useState(DEFAULT_MAX_COMBO_ITEMS);
  const isPlusMember = membershipPlan === "plus" && membershipStatus === "active";

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
    if (!isPlusMember) {
      toast.error("Ưu đãi combo chỉ dành cho thành viên Plus.");
      return;
    }

    const currentComboCount = comboProductIds.filter((id) => Boolean(cartItems[id])).length;
    const isCurrentProductAlreadyCombo = comboProductIds.includes(product.id);
    if (!isCurrentProductAlreadyCombo && currentComboCount >= maxComboItems) {
      toast.error(`Bạn chỉ có thể thêm tối đa ${maxComboItems} sản phẩm combo`);
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
    const baseProduct = cartArray.find((item) => !comboProductIds.includes(item.id));
    if (!baseProduct) {
      toast.error("Cần có sản phẩm gốc trong giỏ để thêm combo");
      return;
    }

    dispatch(setComboProduct({ productId: product.id, baseProductId: baseProduct.id }));
    toast.success(`Đã thêm sản phẩm combo với ưu đãi ${comboDiscountPercent}%`);
  };

  useEffect(() => {
    if (products.length > 0) {
      createCartArray();
    }
  }, [cartItems, products]);

  useEffect(() => {
    const fetchMembership = async () => {
      try {
        const response = await fetch("/api/user/membership", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        const plan = data?.membership?.membershipPlan || "free";
        const status = data?.membership?.membershipStatus || "inactive";
        setMembershipPlan(plan);
        setMembershipStatus(status);
      } catch {
        setMembershipPlan("free");
        setMembershipStatus("inactive");
      }
    };

    fetchMembership();
  }, []);

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

  const selectedComboIds = comboProductIds.filter((id) => Boolean(cartItems[id]));
  const selectedComboCount = selectedComboIds.length;
  useEffect(() => {
    console.log("[CART_UI] combo state", {
      comboProductIds,
      comboLinks,
      selectedComboIds,
      cartItems,
    });
  }, [comboProductIds, comboLinks, selectedComboIds, cartItems]);

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
                        {comboProductIds.includes(item.id) ? (
                          <div className="mt-1">
                            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Giá Combo</p>
                            <p className="font-bold text-emerald-600">
                              {formatMoney(Math.round(item.price * (1 - comboDiscountPercent / 100)))}
                            </p>
                            <p className="text-xs text-slate-400 line-through">{formatMoney(item.price)}</p>
                            {comboLinks[item.id] && (
                              <p className="text-[11px] text-emerald-700">Gắn với sản phẩm gốc trong giỏ</p>
                            )}
                          </div>
                        ) : (
                          <p>{formatMoney(item.price)}</p>
                        )}
                      </div>
                    </Link>
                  </td>
                  <td className="text-center">
                    <Counter productId={item.id} maxStock={item.inStock} />
                  </td>
                  <td className="whitespace-nowrap text-center">
                    {formatMoney(
                      (comboProductIds.includes(item.id)
                        ? Math.round(item.price * (1 - comboDiscountPercent / 100))
                        : item.price) * item.quantity
                    )}
                  </td>
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
                <h2 className="mt-2 text-2xl font-semibold text-slate-800">Chọn thêm {maxComboItems} sản phẩm phù hợp</h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-500">
                  Hệ thống chỉ gợi ý các sản phẩm cùng danh mục hoặc cùng xuất xứ với giỏ hàng hiện tại.
                  {isPlusMember
                    ? ` Bạn có thể thêm tối đa ${maxComboItems} sản phẩm combo để nhận ưu đãi thêm ${comboDiscountPercent}%.`
                    : " Ưu đãi combo chỉ dành cho thành viên Plus. Nâng cấp Plus để mở khóa giảm giá combo."}
                </p>
              </div>
              <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">
                Ưu đãi combo hiện tại: <span className="font-semibold">-{comboDiscountPercent}%</span>
              </div>
            </div>

            {selectedComboCount > 0 && (
              <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                Bạn đã thêm {selectedComboCount}/{maxComboItems} sản phẩm combo.
              </div>
            )}

            {!isPlusMember && (
              <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Bạn đang dùng tài khoản thường. Đăng ký Plus để thêm sản phẩm combo và nhận giảm giá trực tiếp cho sản phẩm combo.
              </div>
            )}

            <div className="grid grid-cols-2 justify-items-center gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
              {comboSuggestions.map((product) => {
                const isComboSelected = selectedComboIds.includes(product.id);
                const isAnotherComboLocked = !isComboSelected && selectedComboCount >= maxComboItems;
                const isComboDisabled = !isPlusMember || Boolean(isAnotherComboLocked);
                const comboPrice = Math.round(product.price * (1 - comboDiscountPercent / 100));

                return (
                  <div key={product.id} className="w-full max-w-[220px]">
                    <div className="mb-3 rounded-2xl border border-dashed border-green-200 bg-green-50 px-3 py-2 text-center text-xs font-medium text-green-700">
                      {product.origin ? `${product.origin} • ` : ""}Giảm thêm {comboDiscountPercent}%
                    </div>
                    <div className="mb-3 rounded-2xl border border-green-100 bg-white px-4 py-3 text-center">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Giá combo</p>
                      <p className="mt-2 text-lg font-semibold text-green-600">{formatMoney(comboPrice)}</p>
                      <p className="mt-1 text-sm text-slate-400 line-through">{formatMoney(product.price)}</p>
                    </div>
                    <ProductCard product={product} compact showQuickBuy={false} />
                    <button
                      type="button"
                      onClick={() => handleAddComboProduct(product)}
                      disabled={isComboDisabled}
                      className={`mt-3 w-full rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                        isComboDisabled
                          ? "cursor-not-allowed bg-slate-200 text-slate-500"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {!isPlusMember
                        ? "Dành riêng cho Plus"
                        : isAnotherComboLocked
                        ? `Đã đủ ${maxComboItems} sản phẩm combo`
                        : `Thêm combo -${comboDiscountPercent}%`}
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
