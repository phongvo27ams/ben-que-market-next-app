'use client'

import React from 'react'
import toast from 'react-hot-toast';

export default function Banner() {
  const [isOpen, setIsOpen] = React.useState(true);

  const handleClaim = async () => {
    try {
      await navigator.clipboard.writeText('NEW20');
      toast.success('Mã giảm giá đã được sao chép vào clipboard!');
    } catch {
      toast.success('Mã ưu đãi: NEW20');
    }
    setIsOpen(false);
  };

  return isOpen && (
    <div className="w-full bg-gradient-to-r from-violet-500 via-[#9938CA] to-[#E0724A] px-4 py-2 text-white sm:px-6 sm:py-1">
      <div className='mx-auto flex max-w-7xl items-start justify-between gap-3 sm:items-center'>
        <div className="min-w-0">
          <p className="text-left text-xs font-medium leading-5 sm:text-center sm:text-sm">
            Nhận ngay ưu đãi giảm giá 20% cho đơn hàng đầu tiên!
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <button
            onClick={handleClaim}
            type="button"
            className="rounded-full bg-white px-4 py-2 text-xs font-medium text-gray-800 transition hover:bg-slate-100 active:scale-95 sm:px-7 sm:text-sm"
          >
            Nhận ưu đãi
          </button>

          <button onClick={() => setIsOpen(false)} type="button" aria-label="Close banner" className="rounded-full p-2 transition hover:bg-white/10">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect y="12.532" width="17.498" height="2.1" rx="1.05" transform="rotate(-45.74 0 12.532)" fill="#fff" />
              <rect x="12.533" y="13.915" width="17.498" height="2.1" rx="1.05" transform="rotate(-135.74 12.533 13.915)" fill="#fff" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
