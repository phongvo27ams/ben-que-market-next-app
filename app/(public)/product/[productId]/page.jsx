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

  const fetchProduct = async () => {
    const product = products.find((product) => product.id === productId);
    setProduct(product);
  }

  useEffect(() => {
    if (products.length > 0) {
      fetchProduct()
    }
    scrollTo(0, 0)
  }, [productId, products]);

  return (
    <div className="mx-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-gray-600 text-sm mt-8 mb-5 flex flex-wrap items-center gap-2">
          <Link href="/" className="hover:text-slate-900 transition">
            Trang chủ
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-slate-900 transition">
            Sản phẩm
          </Link>
          <span>/</span>
          {product?.category && (
            <Link
              href={`/shop?category=${encodeURIComponent(product.category)}`}
              className="hover:text-slate-900 transition"
            >
              {product.category}
            </Link>
          )}
        </div>

        {product && (<ProductDetails product={product} />)}
        {product && (<ProductDescription product={product} />)}
      </div>
    </div>
  );
}
