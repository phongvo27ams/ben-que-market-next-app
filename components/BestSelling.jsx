'use client'

import Title from './Title';
import ProductCard from './ProductCard';

const displayQuantity = 8;

const BestSellingSkeleton = () => (
  <>
    {Array.from({ length: displayQuantity }).map((_, index) => (
      <div key={index} className='w-full max-w-[220px]'>
        <div className='h-36 w-full animate-pulse rounded-lg bg-slate-200 sm:h-56' />
        <div className='mt-3 flex justify-between gap-3'>
          <div className='min-w-0 flex-1'>
            <div className='h-4 w-4/5 animate-pulse rounded bg-slate-200' />
            <div className='mt-2 h-4 w-3/5 animate-pulse rounded bg-slate-200' />
            <div className='mt-3 flex gap-1'>
              {Array.from({ length: 5 }).map((__, starIndex) => (
                <div key={starIndex} className='h-3.5 w-3.5 animate-pulse rounded-full bg-slate-200' />
              ))}
            </div>
          </div>
          <div className='flex-shrink-0'>
            <div className='h-4 w-16 animate-pulse rounded bg-slate-200' />
            <div className='mt-2 h-3 w-12 animate-pulse rounded bg-slate-200' />
          </div>
        </div>
      </div>
    ))}
  </>
);

const BestSelling = ({ products = [], selectedCategory = null }) => {
  const bestSellingProducts = products
    .slice()
    .sort((a, b) => b.rating.length - a.rating.length)
    .slice(0, displayQuantity);
  const categorySuffix = selectedCategory ? ` cho danh mục "${selectedCategory}"` : "";
  const isLoading = products.length === 0;

  return (
    <div className='mx-auto my-16 max-w-6xl px-4 sm:my-24 sm:px-6'>
      <Title
        title='Sản phẩm bán chạy'
        description={isLoading ? 'Đang tải danh sách sản phẩm bán chạy...' : `Hiển thị ${bestSellingProducts.length} trong số ${products.length} sản phẩm${categorySuffix}`}
        href='/shop'
      />
      <div className='mt-8 grid grid-cols-2 justify-items-center gap-x-4 gap-y-8 sm:mt-12 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8 xl:gap-x-10'>
        {isLoading ? (
          <BestSellingSkeleton />
        ) : (
          bestSellingProducts.map((product, index) => (
            <ProductCard key={index} product={product} compact />
          ))
        )}
      </div>
    </div>
  );
}

export default BestSelling;
