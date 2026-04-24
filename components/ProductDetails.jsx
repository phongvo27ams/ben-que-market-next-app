"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { StarIcon, TagIcon, BadgeCheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useAuth, useUser } from "@clerk/nextjs";

import { addToCart } from "../lib/features/cart/cartSlice";
import Counter from "./Counter";
import { formatMoney } from "../lib/format";
import OcopBadge from "./OcopBadge";

const ProductDetails = ({ product }) => {
  const productId = product.id;
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";
  const cart = useSelector((state) => state.cart.cartItems);
  const dispatch = useDispatch();
  const router = useRouter();
  const [mainImage, setMainImage] = useState(product.images[0]);
  const [isOwnProduct, setIsOwnProduct] = useState(false);
  const { getToken } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    const checkSellerOwnership = async () => {
      try {
        if (!user) return;
        const token = await getToken();
        const { data } = await axios.get("/api/store/is-seller", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const storeId = data?.storeInfo?.id;
        setIsOwnProduct(Boolean(storeId && product.storeId && storeId === product.storeId));
      } catch {
        setIsOwnProduct(false);
      }
    };

    checkSellerOwnership();
  }, [user, product.storeId, getToken]);

  const addToCartHandler = () => {
    if (isOwnProduct || product.inStock <= 0) return;
    dispatch(addToCart({ productId }));
  };

  const averageRating = product.rating.length
    ? product.rating.reduce((acc, item) => acc + item.rating, 0) / product.rating.length
    : 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex gap-3 overflow-x-auto pb-1 sm:flex-col sm:overflow-visible">
            {product.images.map((image, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setMainImage(product.images[index])}
                className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-slate-100 transition sm:h-24 sm:w-24 ${
                  mainImage === image ? "ring-2 ring-green-500" : ""
                }`}
              >
                <Image
                  src={image}
                  className="h-14 w-auto transition"
                  alt={product.name}
                  width={80}
                  height={80}
                />
              </button>
            ))}
          </div>

          <div className="relative flex h-[20rem] w-full items-center justify-center rounded-2xl bg-slate-100 p-6 sm:h-[26.25rem] lg:w-[30rem] lg:max-w-[30rem]">
            <OcopBadge
              stars={product.ocopStars}
              className="absolute right-4 top-4 rounded-2xl bg-white/85 px-3 py-2 shadow-sm backdrop-blur-sm"
              letterClassName="text-xl sm:text-2xl"
              starSize={17}
            />
            <Image
              src={mainImage}
              alt={product.name}
              width={320}
              height={320}
              className="h-auto max-h-full w-auto max-w-full object-contain"
            />
          </div>
        </div>

        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-slate-800 sm:text-3xl">{product.name}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="flex items-center">
              {Array(5)
                .fill("")
                .map((_, index) => (
                  <StarIcon
                    key={index}
                    size={15}
                    className="mt-0.5 text-transparent"
                    fill={averageRating >= index + 1 ? "#00C950" : "#D1D5DB"}
                  />
                ))}
            </div>
            <p className="text-sm text-slate-500">{product.rating.length} lượt đánh giá</p>
          </div>

          <div className="my-5 flex flex-wrap items-end gap-x-3 gap-y-1 text-slate-800">
            <p className="text-2xl font-semibold sm:text-3xl">{formatMoney(product.price, currency)}</p>
            {product.mrp > product.price && (
              <p className="text-lg text-slate-500 line-through sm:text-xl">{formatMoney(product.mrp, currency)}</p>
            )}
          </div>

          {product.mrp > product.price && (
            <div className="flex items-start gap-2 text-sm text-slate-500 sm:text-base">
              <TagIcon size={16} className="mt-0.5 shrink-0" />
              <p>Tiết kiệm {(((product.mrp - product.price) / product.mrp) * 100).toFixed(0)}% ngay bây giờ</p>
            </div>
          )}

          <div className="mt-4 rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
            {product.inStock > 0 ? `Còn ${product.inStock} sản phẩm trong kho` : "Sản phẩm hiện đã hết hàng"}
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-5">
            {!isOwnProduct && cart[productId] && (
              <div className="flex flex-col gap-3">
                <p className="text-base font-semibold text-slate-800">Số lượng</p>
                <Counter productId={productId} maxStock={product.inStock} />
              </div>
            )}

            <button
              disabled={isOwnProduct || product.inStock <= 0}
              onClick={() => (!cart[productId] ? addToCartHandler() : router.push("/cart"))}
              className={`w-full rounded-xl px-8 py-3 text-sm font-medium transition sm:w-auto ${
                isOwnProduct || product.inStock <= 0
                  ? "cursor-not-allowed bg-slate-300 text-slate-500"
                  : "bg-slate-800 text-white hover:bg-slate-900 active:scale-95"
              }`}
            >
              {isOwnProduct
                ? "Sản phẩm của bạn"
                : product.inStock <= 0
                  ? "Hết hàng"
                  : !cart[productId]
                    ? "Thêm vào giỏ"
                    : "Xem giỏ hàng"}
            </button>
          </div>
        </div>
      </div>

      <section className="rounded-[1.75rem] border border-amber-100 bg-[linear-gradient(135deg,_rgba(255,251,235,1)_0%,_rgba(255,255,255,1)_100%)] p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl text-sm text-slate-600 sm:text-base">
            <div className="flex items-center gap-3">
              <BadgeCheckIcon className="shrink-0 text-amber-600" size={20} />
              <p className="font-semibold uppercase tracking-[0.18em] text-amber-700">Câu chuyện OCOP</p>
            </div>

            <p className="mt-4 leading-7">
              OCOP là chương trình tôn vinh những sản phẩm mang bản sắc địa phương, nơi mỗi món hàng không chỉ được
              đánh giá bằng chất lượng mà còn bằng câu chuyện vùng miền, tay nghề người làm và khả năng thương mại hóa
              bền vững. Một sản phẩm OCOP tốt luôn cho người mua cảm giác yên tâm về nguồn gốc, tiêu chuẩn và giá trị
              văn hóa đằng sau nó.
            </p>

            <p className="mt-4 leading-7">
              Hệ thống xếp hạng sao giúp bạn nhận biết rõ hơn mức độ hoàn thiện và tiềm năng phát triển của sản phẩm:
              3 sao là sản phẩm đạt tiêu chuẩn cấp tỉnh, 4 sao là sản phẩm có tiềm năng mở rộng ra thị trường quốc gia,
              và 5 sao là những sản phẩm hướng tới xuất khẩu quốc tế, sẵn sàng chinh phục những thị trường khó tính hơn.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:w-[24rem] lg:grid-cols-1">
            <div className="rounded-2xl border border-amber-100 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Xếp hạng hiện tại</p>
              <div className="mt-3">
                <OcopBadge
                  stars={product.ocopStars}
                  className="rounded-xl bg-amber-50 px-3 py-2"
                  letterClassName="text-lg"
                  starSize={16}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">3 sao</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Đạt tiêu chuẩn cấp tỉnh, đủ điều kiện phát triển ổn định trong thị trường địa phương.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">4 sao - 5 sao</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Sẵn sàng mở rộng ra thị trường quốc gia và tiến tới xuất khẩu ở phân khúc cao hơn.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetails;
