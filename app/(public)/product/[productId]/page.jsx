'use client'

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import ProductDescription from "../../../../components/ProductDescription";
import ProductDetails from "../../../../components/ProductDetails";

export default function Product() {
  const { productId } = useParams();
  const [product, setProduct] = useState();
  const products = useSelector(state => state.product.list);

  useEffect(() => {
    if (products.length > 0) {
      setProduct(products.find((item) => item.id === productId));
    }
    scrollTo(0, 0);
  }, [productId, products]);

  return (
    <div className="px-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 mt-6 flex flex-wrap items-center gap-2 text-xs text-gray-600 sm:mt-8 sm:text-sm">
          <Link href="/" className="transition hover:text-slate-900">
            Trang chủ
          </Link>
          <span>/</span>
          <Link href="/shop" className="transition hover:text-slate-900">
            Sản phẩm
          </Link>
          {product?.category && (
            <>
              <span>/</span>
              <Link
                href={`/shop?category=${encodeURIComponent(product.category)}`}
                className="transition hover:text-slate-900"
              >
                {product.category}
              </Link>
            </>
          )}
        </div>

        {product && <ProductDetails product={product} />}
        {product && <ProductDescription product={product} />}
      </div>
    </div>
  );
}
