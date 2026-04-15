'use client'

import React from 'react';
import Image from 'next/image';

import { ArrowRightIcon, ChevronRightIcon } from 'lucide-react';

import { assets } from '../assets/assets';

import CategoriesMarquee from './CategoriesMarquee';

const Hero = () => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

  return (
    <div className='mx-6'>
      <div className='flex max-xl:flex-col gap-8 max-w-7xl mx-auto my-10'>
        <div className='relative flex-1 flex flex-col bg-green-200 rounded-3xl xl:min-h-100 group'>
          <div className='p-5 sm:p-16'>
            <div className='inline-flex items-center gap-3 bg-green-300 text-green-600 pr-4 p-1 rounded-full text-xs sm:text-sm'>
              <span className='bg-green-600 px-3 py-1 max-sm:ml-1 rounded-full text-white text-xs'>NEWS</span> Miễn phí vận chuyển cho đơn hàng từ 200.000 đ! <ChevronRightIcon className='group-hover:ml-2 transition-all' size={16} />
            </div>
            <h2 className='text-3xl sm:text-5xl leading-[1.2] my-3 font-medium bg-gradient-to-r from-slate-600 to-[#A0FF74] bg-clip-text text-transparent max-w-xs  sm:max-w-md'>
              Tinh hoa miền Tây. Vững tin chất lượng.
            </h2>
            <div className='text-slate-800 text-sm font-medium mt-4 sm:mt-8'>
              <p>Chỉ từ</p>
              <p className='text-3xl'>49.000 {currency}</p>
            </div>
            <button className='bg-slate-800 text-white text-sm py-2.5 px-7 sm:py-5 sm:px-12 mt-4 sm:mt-10 rounded-md hover:bg-slate-900 hover:scale-103 active:scale-95 transition'>XEM THÊM</button>
          </div>

          <Image
            className="w-[85%] mx-auto mt-4 sm:absolute sm:bottom-0 sm:right-0 md:right-10 sm:w-[50%] sm:max-w-none"
            src={assets.hero_model_img}
            alt=""
          />
        </div>

        <div className='flex flex-col md:flex-row xl:flex-col gap-5 w-full xl:max-w-sm text-sm text-slate-600'>
          <div className='flex-1 flex items-center justify-between w-full bg-orange-200 rounded-3xl p-6 px-8 group'>
            <div>
              <p className='text-3xl font-medium bg-gradient-to-r from-slate-800 to-[#FFAD51] bg-clip-text text-transparent max-w-40'>Sản phẩm tốt nhất</p>
              <p className='flex items-center gap-1 mt-4'>Xem thêm <ArrowRightIcon className='group-hover:ml-2 transition-all' size={18} /> </p>
            </div>
            <Image className='w-40' src={assets.hero_product_img1} alt="" />
          </div>
          <div className='flex-1 flex items-center justify-between w-full bg-blue-200 rounded-3xl p-6 px-8 group'>
            <div>
              <p className='text-3xl font-medium bg-gradient-to-r from-slate-800 to-[#78B2FF] bg-clip-text text-transparent max-w-40'>Giảm giá 20%</p>
              <p className='flex items-center gap-1 mt-4'>Xem thêm <ArrowRightIcon className='group-hover:ml-2 transition-all' size={18} /> </p>
            </div>
            <Image className='w-45' src={assets.hero_product_img2} alt="" />
          </div>
        </div>
      </div>

      <CategoriesMarquee />
    </div>

  )
}

export default Hero;