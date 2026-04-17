'use client'

import { StarIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { formatMoney } from "../lib/format"

const ProductCard = ({ product, compact = false }) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

  // Calculate the average rating of the product
  const rating = Math.round(product.rating.reduce((acc, curr) => acc + curr.rating, 0) / product.rating.length);

  return (
    <Link href={`/product/${product.id}`} className={`group ${compact ? 'block w-full' : 'max-xl:mx-auto'}`}>
      <div className={`bg-[#F5F5F5] rounded-lg flex items-center justify-center ${compact ? 'h-36 w-full sm:h-56 px-3' : 'h-40 sm:w-60 sm:h-68'}`}>
        <Image
          width={500}
          height={500}
          className={`${compact ? 'max-h-24 sm:max-h-32' : 'max-h-30 sm:max-h-40'} w-auto group-hover:scale-115 transition duration-300`}
          src={product.images[0]}
          alt=""
        />
      </div>

      <div className={`flex justify-between gap-3 text-sm text-slate-800 pt-2 ${compact ? 'w-full' : 'max-w-60'}`}>
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

        <p className='whitespace-nowrap flex-shrink-0'>
          {formatMoney(product.price, currency)}
        </p>
      </div>
    </Link>
  )
}

export default ProductCard
