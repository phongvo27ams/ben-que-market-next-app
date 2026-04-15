'use client'

import { useSelector } from 'react-redux';
import Title from './Title';
import ProductCard from './ProductCard';

const BestSelling = () => {
  const displayQuantity = 8;
  const products = useSelector(state => state.product.list);

  return (
    <div className='px-6 my-30 max-w-6xl mx-auto'>
      <Title title='Sản phẩm bán chạy' description={`Hiển thị ${products.length < displayQuantity ? products.length : displayQuantity} trong số ${products.length} sản phẩm`} href='/shop' />
      <div className='mt-12  grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12'>
        {products.slice().sort((a, b) => b.rating.length - a.rating.length).slice(0, displayQuantity).map((product, index) => (
          <ProductCard key={index} product={product} />
        ))}
      </div>
    </div>
  );
}

export default BestSelling;