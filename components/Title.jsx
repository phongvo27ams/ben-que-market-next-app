'use client'

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const Title = ({ title, description, visibleButton = true, href = '' }) => {
  return (
    <div className='flex flex-col items-center px-2 text-center'>
      <h2 className='text-2xl font-semibold text-slate-800 sm:text-3xl'>{title}</h2>
      <Link
        href={href}
        className='mt-2 flex max-w-2xl flex-col items-center gap-2 text-sm text-slate-600 sm:flex-row sm:justify-center sm:gap-4'
      >
        <p className='max-w-lg text-center leading-6'>{description}</p>
        {visibleButton && (
          <span className='inline-flex items-center gap-1 whitespace-nowrap text-green-500'>
            Xem thêm <ArrowRight size={14} />
          </span>
        )}
      </Link>
    </div>
  );
};

export default Title;
