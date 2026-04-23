'use client'

import { useEffect, useState } from 'react'
import { CopyIcon, HeartIcon, LoaderCircleIcon, StarIcon } from 'lucide-react'
import { useAuth, useClerk, useUser } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'

import { addToCart } from '../lib/features/cart/cartSlice'
import { toggleWishlistItem } from '../lib/features/wishlist/wishlistSlice'
import { formatMoney } from "../lib/format"

const ProductCard = ({ product, compact = false, showQuickBuy = true }) => {
  const [imageLoading, setImageLoading] = useState(true)
  const [isHovering, setIsHovering] = useState(false)
  const [showNativeTooltip, setShowNativeTooltip] = useState(false)
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
  const ocopStars = Number(product.ocopStars || 0)
  const currentCartQuantity = cartItems[product.id] || 0
  const isWishlisted = wishlistItems.includes(product.id)

  const rating = Math.round(
    product.rating.reduce((acc, curr) => acc + curr.rating, 0) / product.rating.length
  )

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

  const handleCopyLink = async (event) => {
    event.preventDefault()
    event.stopPropagation()

    try {
      await navigator.clipboard.writeText(`${window.location.origin}/product/${product.id}`)
      toast.success('Đã sao chép link sản phẩm')
    } catch {
      toast.error('Không thể sao chép link sản phẩm')
    }
  }

  useEffect(() => {
    let timeoutId

    if (isHovering && !showNativeTooltip) {
      timeoutId = setTimeout(() => {
        setShowNativeTooltip(true)
      }, 2000)
    }

    return () => clearTimeout(timeoutId)
  }, [isHovering, showNativeTooltip])

  return (
    <div
      className={`group relative ${compact ? 'block w-full' : 'max-xl:mx-auto'}`}
      onMouseEnter={() => {
        setIsHovering(true)
        setShowNativeTooltip(false)
      }}
      onMouseLeave={() => {
        setIsHovering(false)
        setShowNativeTooltip(false)
      }}
    >
      {showNativeTooltip && (
        <div className="pointer-events-none absolute left-1/2 top-2 z-[80] -translate-x-1/2 rounded bg-white px-2 py-1 text-xs text-slate-800 shadow">
          {product.name}
        </div>
      )}

      <Link href={`/product/${product.id}`} className="block">
        <div className={`relative flex items-center justify-center overflow-hidden rounded-lg bg-[#F5F5F5] ${compact ? 'h-36 w-full px-3 sm:h-56' : 'h-40 sm:h-68 sm:w-60'}`}>
          {isDiscounted && (
            <div className="absolute left-0 top-0 z-10 -translate-x-[110%] transition-transform duration-300 group-hover:translate-x-0">
              <div className="rounded-br-xl bg-green-600 px-3 py-2 text-xs font-semibold text-white shadow-sm">
                SALE -{discountPercent}%
              </div>
            </div>
          )}

          <div className="absolute right-1 top-2 z-10 flex items-center gap-2 translate-x-[180%] transition-transform duration-300 group-hover:translate-x-0">
            <button
              type="button"
              onClick={handleCopyLink}
              aria-label="Copy product link"
              className="flex items-center justify-center text-sky-600 drop-shadow-sm transition duration-200 hover:-rotate-6 hover:scale-115 active:rotate-0 active:scale-95"
            >
              <CopyIcon
                size={20}
                strokeWidth={2}
                className="transition-all duration-200 group-hover:[filter:drop-shadow(0_3px_8px_rgba(14,165,233,0.28))]"
              />
            </button>

            <button
              type="button"
              onClick={handleWishlistToggle}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              className="flex items-center justify-center text-red-500 drop-shadow-sm transition duration-200 hover:-rotate-6 hover:scale-115 active:rotate-0 active:scale-95"
            >
              <HeartIcon
                size={22}
                strokeWidth={2}
                className={`transition-all duration-200 ${isWishlisted ? 'scale-115 fill-red-500 text-red-500' : 'fill-transparent text-red-500'} group-hover:[filter:drop-shadow(0_3px_8px_rgba(239,68,68,0.28))]`}
              />
            </button>
          </div>

          {imageLoading && (
            <div className="absolute inset-0 z-[1] flex items-center justify-center bg-[#F5F5F5]">
              <LoaderCircleIcon className="animate-spin text-slate-400" size={30} />
            </div>
          )}

          <Image
            width={500}
            height={500}
            className={`${compact ? 'max-h-24 sm:max-h-32' : 'max-h-30 sm:max-h-40'} w-auto transition duration-300 group-hover:scale-115 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
            src={product.images[0]}
            alt={product.name}
            onLoad={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
          />

          {ocopStars > 0 && (
            <div className="pointer-events-none absolute inset-x-3 bottom-14 z-[1] translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:bottom-16">
              <div className="rounded-2xl bg-white/82 px-3 py-2 backdrop-blur-md shadow-[0_10px_30px_rgba(15,23,42,0.14)] ring-1 ring-white/60">
                <p className={`text-center font-black uppercase mb-1 leading-none tracking-[0.1em] ${compact ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'}`}>
                  <span style={{ color: '#9F5237' }}>O</span>
                  <span style={{ color: '#087943' }}>C</span>
                  <span style={{ color: '#195CAA' }}>O</span>
                  <span style={{ color: '#F8A41D' }}>P</span>
                </p>

                <div className="flex items-center justify-center gap-1">
                  {Array.from({ length: ocopStars }).map((_, index) => (
                    <StarIcon
                      key={index}
                      size={compact ? 14 : 16}
                      className="text-[#FED545]"
                      fill="#FED545"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {showQuickBuy && <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full px-0 opacity-0 transition-all duration-300 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={product.inStock <= 0}
              className={`w-full py-3 text-sm font-semibold tracking-wide transition ${product.inStock <= 0 ? 'cursor-not-allowed bg-slate-300/95 text-slate-500' : 'bg-green-600/95 text-white hover:bg-green-700/95'}`}
            >
              {product.inStock <= 0 ? 'HẾT HÀNG' : 'MUA NGAY'}
            </button>
          </div>}
        </div>

        <div className={`flex justify-between gap-3 pt-2 text-sm text-slate-800 ${compact ? 'w-full' : 'max-w-60'}`}>
          {imageLoading ? (
            <>
              <div className='min-w-0 flex-1'>
                <div className='h-4 w-4/5 animate-pulse rounded bg-slate-200' />
                <div className='mt-2 h-4 w-3/5 animate-pulse rounded bg-slate-200' />
                <div className='mt-3 flex gap-1'>
                  {Array(5).fill('').map((_, index) => (
                    <div key={index} className='h-3.5 w-3.5 animate-pulse rounded-full bg-slate-200' />
                  ))}
                </div>
              </div>

              <div className='flex-shrink-0 whitespace-nowrap text-right'>
                <div className='ml-auto h-4 w-16 animate-pulse rounded bg-slate-200' />
                {isDiscounted && <div className='mt-2 ml-auto h-3 w-12 animate-pulse rounded bg-slate-200' />}
              </div>
            </>
          ) : (
            <>
              <div className='min-w-0 flex-1'>
                <p className={compact ? 'line-clamp-2' : ''}>{product.name}</p>

                <div className='flex'>
                  {Array(5).fill('').map((_, index) => (
                    <StarIcon
                      key={index}
                      size={14}
                      className='mt-0.5 text-transparent'
                      fill={rating >= index + 1 ? "#00C950" : "#D1D5DB"}
                    />
                  ))}
                </div>
              </div>

              <div className='whitespace-nowrap text-right flex-shrink-0'>
                <p className='font-semibold text-green-600'>
                  {formatMoney(product.price, currency)}
                </p>
                {isDiscounted && (
                  <p className='text-xs text-slate-400 line-through'>
                    {formatMoney(product.mrp, currency)}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </Link>
    </div>
  )
}

export default ProductCard
