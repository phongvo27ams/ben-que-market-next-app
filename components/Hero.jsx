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
        <div className='group relative flex flex-1 flex-col overflow-hidden rounded-[2rem] border border-white/50 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.85),_rgba(207,250,215,0.92)_35%,_rgba(123,217,155,0.96)_100%)] shadow-[0_24px_80px_rgba(34,197,94,0.16)] xl:min-h-[32rem]'>
          <div className='absolute -left-10 top-10 h-40 w-40 rounded-full bg-white/40 blur-3xl' />
          <div className='absolute right-0 top-0 h-48 w-48 rounded-full bg-lime-200/50 blur-3xl' />
          <div className='absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-emerald-300/30 blur-2xl' />
          <div className='absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(15,23,42,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.08)_1px,transparent_1px)] [background-size:26px_26px]' />

          <div className='relative z-10 p-5 sm:p-8 lg:p-12 xl:p-16'>
            <div className='inline-flex max-w-full items-center gap-2 rounded-full border border-white/60 bg-white/55 p-1 pr-3 text-[11px] text-emerald-900 backdrop-blur-md sm:gap-3 sm:pr-4 sm:text-sm'>
              <span className='ml-1 rounded-full bg-emerald-600 px-3 py-1 text-[10px] text-white shadow-sm sm:text-xs'>NEWS</span>
              <span className='line-clamp-2'>Miễn phí vận chuyển cho đơn hàng từ 200.000đ</span>
              <ChevronRightIcon className='shrink-0 transition-all group-hover:ml-1' size={16} />
            </div>

            <h2 className='mt-4 max-w-xs text-3xl font-semibold leading-tight text-emerald-800 sm:max-w-md sm:text-5xl'>
              Tinh hoa miền Tây. Vững tin chất lượng.
            </h2>

            <p className='mt-4 max-w-md text-sm leading-6 text-slate-700 sm:text-base xl:max-w-sm'>
              Khám phá những đặc sản chọn lọc với hương vị chân thật, mức giá dễ chịu và trải nghiệm mua sắm đáng tin cậy.
            </p>

            <div className='mt-5 text-sm font-medium text-slate-800 sm:mt-8'>
              <p>Chỉ từ</p>
              <p className='text-3xl sm:text-4xl'>49.000 {currency}</p>
            </div>

            <button
              type="button"
              onClick={() => router.push('/shop')}
              className='mt-5 rounded-xl bg-slate-800 px-6 py-3 text-sm text-white shadow-lg shadow-slate-900/15 transition hover:bg-slate-900 active:scale-95 sm:mt-8 sm:px-10 sm:py-4'
            >
              XEM THÊM
            </button>
          </div>

          <div className='relative z-10 flex justify-center px-4 pb-2 sm:px-8 sm:pb-0 xl:absolute xl:bottom-0 xl:right-0 xl:w-[60%]'>
            <div className='absolute bottom-8 h-28 w-44 rounded-full bg-emerald-950/15 blur-2xl sm:h-32 sm:w-60' />
            <Image
              className='h-auto w-full max-w-[21rem] drop-shadow-[0_22px_36px_rgba(15,23,42,0.18)] sm:max-w-[26rem] xl:max-w-[42rem]'
              src={assets.hero_model_img}
              alt='Hero product'
            />
          </div>
        </div>

        <div className='flex w-full flex-col gap-4 text-sm text-slate-600 md:flex-row xl:max-w-sm xl:flex-col'>
          <button
            type="button"
            onClick={() => router.push('/shop?sort=rating')}
            className='group relative flex flex-1 items-center justify-between gap-3 overflow-hidden rounded-[2rem] border border-white/60 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.95),_rgba(255,218,168,0.92)_38%,_rgba(251,146,60,0.9)_100%)] p-5 text-left shadow-[0_18px_50px_rgba(251,146,60,0.18)] sm:p-6 sm:px-8'
          >
            <div className='absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/40 blur-2xl' />
            <div className='absolute right-2 top-2 h-24 w-24 rounded-full bg-amber-100/40 blur-2xl' />
            <div className='absolute inset-0 opacity-20 [background-image:linear-gradient(225deg,rgba(255,255,255,0.82)_0,rgba(255,255,255,0)_42%)]' />

            <div className='relative z-10 min-w-0'>
              <p className='max-w-[12rem] text-2xl font-semibold leading-tight text-amber-800 sm:max-w-[13rem] sm:text-3xl'>
                Sản phẩm tốt nhất
              </p>
              <p className='mt-3 flex items-center gap-1 text-sm text-slate-700'>
                Xem thêm <ArrowRightIcon className='transition-all group-hover:ml-2' size={18} />
              </p>
            </div>

            <div className='relative z-10'>
              <div className='absolute inset-x-4 bottom-2 h-6 rounded-full bg-amber-950/15 blur-xl' />
              <Image className='relative w-36 shrink-0 drop-shadow-[0_12px_24px_rgba(124,45,18,0.18)] sm:w-48' src={assets.hero_product_img1} alt='Best products' />
            </div>
          </button>

          <button
            type="button"
            onClick={() => router.push('/shop?sort=discount-desc')}
            className='group relative flex flex-1 items-center justify-between gap-3 overflow-hidden rounded-[2rem] border border-white/60 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.96),_rgba(191,219,254,0.92)_40%,_rgba(59,130,246,0.9)_100%)] p-5 text-left shadow-[0_18px_50px_rgba(59,130,246,0.18)] sm:p-6 sm:px-8'
          >
            <div className='absolute right-2 top-2 h-24 w-24 rounded-full bg-cyan-100/40 blur-2xl' />
            <div className='absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/35 blur-2xl' />
            <div className='absolute inset-0 opacity-20 [background-image:linear-gradient(225deg,rgba(255,255,255,0.9)_0,rgba(255,255,255,0)_45%)]' />

            <div className='relative z-10 min-w-0'>
              <p className='max-w-[10rem] text-2xl font-semibold leading-tight text-blue-800 sm:text-3xl'>
                Giảm giá sâu nhất
              </p>
              <p className='mt-3 flex items-center gap-1 text-sm text-slate-700'>
                Xem thêm <ArrowRightIcon className='transition-all group-hover:ml-2' size={18} />
              </p>
            </div>

            <div className='relative z-10'>
              <div className='absolute inset-x-4 bottom-2 h-6 rounded-full bg-sky-950/15 blur-xl' />
              <Image className='relative w-36 shrink-0 drop-shadow-[0_12px_24px_rgba(30,64,175,0.18)] sm:w-52' src={assets.hero_product_img2} alt='Discount products' />
            </div>
          </button>
        </div>
      </div>

      <CategoriesMarquee selectedCategory={selectedCategory} onToggleCategory={onToggleCategory} />
    </div>
  );
};

export default Hero;
