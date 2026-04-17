'use client'

import Title from './Title';
import ProductCard from './ProductCard';

const BestSelling = ({ products = [], selectedCategory = null }) => {
  const displayQuantity = 8;
  const bestSellingProducts = products
    .slice()
    .sort((a, b) => b.rating.length - a.rating.length)
    .slice(0, displayQuantity);
  const categorySuffix = selectedCategory ? ` cho danh mục "${selectedCategory}"` : "";

  return (
    <div className='px-6 my-30 max-w-6xl mx-auto'>
      <Title title='Sản phẩm bán chạy' description={`Hiển thị ${bestSellingProducts.length} trong số ${products.length} sản phẩm${categorySuffix}`} href='/shop' />
      <div className='mt-12  grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12'>
        {bestSellingProducts.map((product, index) => (
          <ProductCard key={index} product={product} />
        ))}
      </div>
    </div>
  );
}

export default BestSelling;
