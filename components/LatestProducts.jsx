'use client'
import React from 'react'
import Title from './Title'
import ProductCard from './ProductCard'

const LatestProducts = ({ products = [], selectedCategory = null }) => {
  const displayQuantity = 4
  const latestProducts = products
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, displayQuantity)
  const categorySuffix = selectedCategory ? ` cho danh mục "${selectedCategory}"` : ""

  return (
    <div className='px-6 my-30 max-w-6xl mx-auto'>
      <Title title='Sản phẩm mới nhất' description={`Hiển thị ${latestProducts.length} trong số ${products.length} sản phẩm${categorySuffix}`} href='/shop' />
      <div className='mt-12  grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12'>
        {latestProducts.map((product, index) => (
          <ProductCard key={index} product={product} />
        ))}
      </div>
    </div>
  )
}

export default LatestProducts
