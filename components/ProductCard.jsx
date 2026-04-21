'use client'

import { HeartIcon, StarIcon } from 'lucide-react'
import { useAuth, useClerk, useUser } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { addToCart } from '../lib/features/cart/cartSlice'
import { toggleWishlistItem } from '../lib/features/wishlist/wishlistSlice'
import { formatMoney } from "../lib/format"

const ProductCard = ({ product, compact = false }) => {
  const dispatch = useDispatch()
  const cartItems = useSelector((state) => state.cart.cartItems)
  const wishlistItems = useSelector((state) => state.wishlist.items)
  const { user } = useUser()
  const { openSignIn } = useClerk()
  const { isLoaded } = useAuth()
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'
  const isDiscounted = product.price < product.mrp
  const discountPercent = isDiscounted
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0
  const currentCartQuantity = cartItems[product.id] || 0
  const isWishlisted = wishlistItems.includes(product.id)

  // Calculate the average rating of the product
  const rating = Math.round(product.rating.reduce((acc, curr) => acc + curr.rating, 0) / product.rating.length);

  const handleBuyNow = (event) => {
    event.preventDefault()
    event.stopPropagation()

    if (product.inStock <= 0) {
      toast.error('Sản phẩm đã hết hàng')
      return
    }

    if (currentCartQuantity >= product.inStock) {
      toast.error(`Chỉ còn ${product.inStock} sản phẩm trong kho`)
      return
    }

    dispatch(addToCart({ productId: product.id }))
    toast.success('Đã thêm sản phẩm vào giỏ hàng')
  }

  const handleWishlistToggle = async (event) => {
    event.preventDefault()
    event.stopPropagation()

    if (!isLoaded) return

    if (!user) {
      await openSignIn({ redirectUrl: window.location.pathname })
      return
    }

    dispatch(toggleWishlistItem({ productId: product.id }))
    toast.success(isWishlisted ? 'Đã bỏ khỏi yêu thích' : 'Đã thêm vào yêu thích')
  }

  return (
    <div className={`group relative ${compact ? 'block w-full' : 'max-xl:mx-auto'}`}>
      <Link href={`/product/${product.id}`} className="block">
        <div className={`relative overflow-hidden rounded-lg bg-[#F5F5F5] flex items-center justify-center ${compact ? 'h-36 w-full sm:h-56 px-3' : 'h-40 sm:w-60 sm:h-68'}`}>
          {isDiscounted && (
            <div className="absolute left-0 top-0 z-10 -translate-x-[110%] transition-transform duration-300 group-hover:translate-x-0">
              <div className="rounded-br-xl bg-green-600 px-3 py-2 text-xs font-semibold text-white shadow-sm">
                SALE -{discountPercent}%
              </div>
            </div>
          )}
          <div className="absolute right-1 top-2 z-10 translate-x-[160%] transition-transform duration-300 group-hover:translate-x-0">
            <button
              type="button"
              onClick={handleWishlistToggle}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              className="flex items-center justify-center text-red-500 drop-shadow-sm transition duration-200 hover:scale-115 hover:-rotate-6 active:scale-95 active:rotate-0"
            >
              <HeartIcon
                size={22}
                strokeWidth={2}
                className={`transition-all duration-200 ${isWishlisted ? 'fill-red-500 text-red-500 scale-115' : 'fill-transparent text-red-500'} group-hover:[filter:drop-shadow(0_3px_8px_rgba(239,68,68,0.28))]`}
              />
            </button>
          </div>
          <Image
            width={500}
            height={500}
            className={`${compact ? 'max-h-24 sm:max-h-32' : 'max-h-30 sm:max-h-40'} w-auto group-hover:scale-115 transition duration-300`}
            src={product.images[0]}
            alt={product.name}
          />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full px-0 opacity-0 transition-all duration-300 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={product.inStock <= 0}
              className={`w-full py-3 text-sm font-semibold tracking-wide transition ${product.inStock <= 0 ? 'cursor-not-allowed bg-slate-300/95 text-slate-500' : 'bg-green-600/95 text-white hover:bg-green-700/95'}`}
            >
              {product.inStock <= 0 ? 'HẾT HÀNG' : 'MUA NGAY'}
            </button>
          </div>
        </div>

        <div className={`flex justify-between gap-3 pt-2 text-sm text-slate-800 ${compact ? 'w-full' : 'max-w-60'}`}>
          <div className='flex-1 min-w-0'>
            <p className={compact ? 'line-clamp-2' : ''}>{product.name}</p>

            <div className='flex'>
              {Array(5).fill('').map((_, index) => (
                <StarIcon
                  key={index}
                  size={14}
                  className='text-transparent mt-0.5'
                  fill={rating >= index + 1 ? "#00C950" : "#D1D5DB"}
                />
              ))}
            </div>
          </div>

          <div className='whitespace-nowrap flex-shrink-0 text-right'>
            <p className='font-semibold text-green-600'>
              {formatMoney(product.price, currency)}
            </p>
            {isDiscounted && (
              <p className='text-xs text-slate-400 line-through'>
                {formatMoney(product.mrp, currency)}
              </p>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}

export default ProductCard
