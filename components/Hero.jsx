'use client'

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRightIcon, ChevronRightIcon } from 'lucide-react';

import { assets } from '../assets/assets';
import CategoriesMarquee from './CategoriesMarquee';

const Hero = ({ selectedCategory, onToggleCategory }) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';
  const router = useRouter();

  return (
    <div className='mx-4 sm:mx-6'>
      <div className='mx-auto my-6 flex max-w-7xl flex-col gap-5 sm:my-8 xl:my-10 xl:flex-row xl:gap-8'>
        <div className='group relative flex flex-1 flex-col overflow-hidden rounded-3xl bg-green-200 xl:min-h-[32rem]'>
          <div className='relative z-10 p-5 sm:p-8 lg:p-12 xl:p-16'>
            <div className='inline-flex max-w-full items-center gap-2 rounded-full bg-green-300 p-1 pr-3 text-[11px] text-green-700 sm:gap-3 sm:pr-4 sm:text-sm'>
              <span className='ml-1 rounded-full bg-green-600 px-3 py-1 text-[10px] text-white sm:text-xs'>NEWS</span>
              <span className='line-clamp-2'>Miễn phí vận chuyển cho đơn hàng từ 200.000đ</span>
              <ChevronRightIcon className='shrink-0 transition-all group-hover:ml-1' size={16} />
            </div>

            <h2 className='mt-4 max-w-xs text-3xl font-medium leading-tight text-slate-800 sm:max-w-md sm:text-5xl'>
              Tinh hoa miền Tây. Vững tin chất lượng.
            </h2>

            <div className='mt-5 text-sm font-medium text-slate-800 sm:mt-8'>
              <p>Chỉ từ</p>
              <p className='text-3xl sm:text-4xl'>49.000 {currency}</p>
            </div>

            <button
              type="button"
              onClick={() => router.push('/shop')}
              className='mt-5 rounded-xl bg-slate-800 px-6 py-3 text-sm text-white transition hover:bg-slate-900 active:scale-95 sm:mt-8 sm:px-10 sm:py-4'
            >
              XEM THÊM
            </button>
          </div>

          <div className='flex justify-center px-4 pb-2 sm:px-8 sm:pb-0 xl:absolute xl:bottom-0 xl:right-0 xl:w-[52%]'>
            <Image
              className='h-auto w-full max-w-[18rem] sm:max-w-[22rem] xl:max-w-none'
              src={assets.hero_model_img}
              alt='Hero product'
            />
          </div>
        </div>

        <div className='flex w-full flex-col gap-4 text-sm text-slate-600 md:flex-row xl:max-w-sm xl:flex-col'>
          <button
            type="button"
            onClick={() => router.push('/shop?sort=rating')}
            className='flex flex-1 items-center justify-between gap-3 rounded-3xl bg-orange-200 p-5 text-left sm:p-6 sm:px-8'
          >
            <div className='min-w-0'>
              <p className='max-w-[10rem] text-2xl font-medium leading-tight text-slate-800 sm:text-3xl'>Sản phẩm tốt nhất</p>
              <p className='mt-3 flex items-center gap-1 text-sm'>Xem thêm <ArrowRightIcon className='transition-all group-hover:ml-2' size={18} /></p>
            </div>
            <Image className='w-28 shrink-0 sm:w-36' src={assets.hero_product_img1} alt='Best products' />
          </button>

          <button
            type="button"
            onClick={() => router.push('/shop?sort=discount-desc')}
            className='flex flex-1 items-center justify-between gap-3 rounded-3xl bg-blue-200 p-5 text-left sm:p-6 sm:px-8'
          >
            <div className='min-w-0'>
              <p className='max-w-[10rem] text-2xl font-medium leading-tight text-slate-800 sm:text-3xl'>Giảm giá sâu nhất</p>
              <p className='mt-3 flex items-center gap-1 text-sm'>Xem thêm <ArrowRightIcon className='transition-all group-hover:ml-2' size={18} /></p>
            </div>
            <Image className='w-28 shrink-0 sm:w-40' src={assets.hero_product_img2} alt='Discount products' />
          </button>
        </div>
      </div>

      <CategoriesMarquee selectedCategory={selectedCategory} onToggleCategory={onToggleCategory} />
    </div>
  );
};

export default Hero;
