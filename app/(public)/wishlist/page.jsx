'use client'

import Link from "next/link";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { HeartOffIcon } from "lucide-react";

import PageTitle from "../../../components/PageTitle";
import ProductCard from "../../../components/ProductCard";

export default function WishlistPage() {
  const products = useSelector((state) => state.product.list);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const wishlistProducts = useMemo(
    () => products.filter((product) => wishlistItems.includes(product.id)),
    [products, wishlistItems]
  );

  if (wishlistProducts.length === 0) {
    return (
      <div className="mx-6 flex min-h-[80vh] items-center justify-center">
        <div className="max-w-xl rounded-3xl border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
            <HeartOffIcon size={28} />
          </div>
          <h1 className="text-2xl font-semibold text-slate-800">Wishlist của bạn đang trống</h1>
          <p className="mt-3 text-slate-500">
            Hãy thêm những sản phẩm bạn yêu thích để quay lại xem nhanh bất cứ lúc nào.
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

  return (
    <div className="mx-6 min-h-screen text-slate-800">
      <div className="mx-auto max-w-7xl">
        <PageTitle
          heading="Wishlist"
          text={`${wishlistProducts.length} sản phẩm bạn đã yêu thích`}
          linkText="Xem thêm"
          path="/shop"
        />

        <div className="grid grid-cols-2 gap-x-6 gap-y-8 pb-12 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {wishlistProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
