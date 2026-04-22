'use client'

import Title from './Title'
import ProductCard from './ProductCard'

const LatestProducts = ({ products = [], selectedCategory = null }) => {
  const displayQuantity = 8
  const latestProducts = products
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, displayQuantity)
  const categorySuffix = selectedCategory ? ` cho danh mục "${selectedCategory}"` : ""

  return (
    <div className='mx-auto my-16 max-w-6xl px-4 sm:my-24 sm:px-6'>
      <Title title='Sản phẩm mới nhất' description={`Hiển thị ${latestProducts.length} trong số ${products.length} sản phẩm${categorySuffix}`} href='/shop' />
      <div className='mt-8 grid grid-cols-2 justify-items-center gap-x-4 gap-y-8 sm:mt-12 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8 xl:gap-x-10'>
        {latestProducts.map((product, index) => (
          <ProductCard key={index} product={product} compact />
        ))}
      </div>
    </div>
  )
}

export default LatestProducts
