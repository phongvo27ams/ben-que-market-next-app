"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { addToCart } from "../lib/features/cart/cartSlice";
import { StarIcon, TagIcon, EarthIcon, CreditCardIcon, UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useAuth, useUser } from "@clerk/nextjs";

import Counter from "./Counter";
import { formatMoney } from "../lib/format";

const ProductDetails = ({ product }) => {
  const productId = product.id;
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';

  const cart = useSelector(state => state.cart.cartItems);
  const dispatch = useDispatch();

  const router = useRouter()

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
        if (storeId && product.storeId && storeId === product.storeId) {
          setIsOwnProduct(true);
        } else {
          setIsOwnProduct(false);
        }
      } catch (err) {
        setIsOwnProduct(false);
      }
    };
    checkSellerOwnership();
  }, [user, product.storeId, getToken]);

  const addToCartHandler = () => {
    if (isOwnProduct) return; // Prevent adding own product
    dispatch(addToCart({ productId }))
  }

  const averageRating = product.rating.reduce((acc, item) => acc + item.rating, 0) / product.rating.length;

  return (
    <div className="flex max-lg:flex-col gap-12">
      <div className="flex max-sm:flex-col-reverse gap-3">
        <div className="flex sm:flex-col gap-3">
          {product.images.map((image, index) => (
            <div key={index} onClick={() => setMainImage(product.images[index])} className="bg-slate-100 flex items-center justify-center size-26 rounded-lg group cursor-pointer">
              <Image src={image} className="group-hover:scale-103 group-active:scale-95 transition" alt="" width={45} height={45} />
            </div>
          ))}
        </div>
        <div className="flex justify-center items-center h-100 sm:size-113 bg-slate-100 rounded-lg ">
          <Image src={mainImage} alt="" width={250} height={250} />
        </div>
      </div>
      <div className="flex-1">
        <h1 className="text-3xl font-semibold text-slate-800">{product.name}</h1>
        <div className='flex items-center mt-2'>
          {Array(5).fill('').map((_, index) => (
            <StarIcon key={index} size={14} className='text-transparent mt-0.5' fill={averageRating >= index + 1 ? "#00C950" : "#D1D5DB"} />
          ))}
          <p className="text-sm ml-3 text-slate-500">{product.rating.length} Lượt đánh giá</p>
        </div>
        <div className="flex items-start my-6 gap-3 text-2xl font-semibold text-slate-800">
              <p>{formatMoney(product.price, currency)}</p>
              <p className="text-xl text-slate-500 line-through">{formatMoney(product.mrp, currency)}</p>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <TagIcon size={14} />
          <p>Tiết kiệm {((product.mrp - product.price) / product.mrp * 100).toFixed(0)}% ngay bây giờ!</p>
        </div>
        <div className="flex items-end gap-5 mt-10">
          {
            !isOwnProduct && cart[productId] && (
              <div className="flex flex-col gap-3">
                <p className="text-lg text-slate-800 font-semibold">Quantity</p>
                <Counter productId={productId} />
              </div>
            )
          }
          <button
            disabled={isOwnProduct}
            onClick={() => (!cart[productId] ? addToCartHandler() : router.push('/cart'))}
            className={`px-10 py-3 text-sm font-medium rounded transition ${isOwnProduct ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-slate-800 text-white hover:bg-slate-900 active:scale-95'}`}
          >
            {isOwnProduct ? 'Owned Product' : (!cart[productId] ? 'Add to Cart' : 'View Cart')}
          </button>
        </div>
        <hr className="border-gray-300 my-5" />
        <div className="flex flex-col gap-4 text-slate-500">
          <p className="flex gap-3"> <EarthIcon className="text-slate-400" />Miễn phí vận chuyển cho Membership</p>
          <p className="flex gap-3"> <CreditCardIcon className="text-slate-400" />Thanh toán trực tuyến an toàn</p>
          <p className="flex gap-3"> <UserIcon className="text-slate-400" />Được tin tưởng bởi khách hàng của chúng tôi</p>
        </div>

      </div>
    </div>
  )
}

export default ProductDetails;