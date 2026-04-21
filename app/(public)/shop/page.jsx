'use client'

import { Suspense, useEffect, useMemo, useState } from "react"
import { MoveLeftIcon, RotateCcwIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSelector } from "react-redux"

import ProductCard from "../../../components/ProductCard"
import { categories } from "../../../assets/assets"
import { formatMoney } from "../../../lib/format"

function ShopContent() {
  const searchParams = useSearchParams()
  const search = searchParams.get('search') || ''
  const initialSort = searchParams.get('sort') || 'latest'
  const initialCategory = searchParams.get('category') || ''
  const initialOrigin = searchParams.get('origin') || ''
  const router = useRouter()
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'
  const products = useSelector((state) => state.product.list)

  const priceBounds = useMemo(() => {
    if (!products.length) return { min: 0, max: 0 }
    const prices = products.map((product) => product.price)
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    }
  }, [products])

  const origins = useMemo(() => {
    return [...new Set(products.map((product) => product.origin).filter(Boolean))].sort((a, b) => a.localeCompare(b))
  }, [products])

  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [selectedOrigin, setSelectedOrigin] = useState(initialOrigin)
  const [minPrice, setMinPrice] = useState(priceBounds.min)
  const [maxPrice, setMaxPrice] = useState(priceBounds.max)
  const [sortBy, setSortBy] = useState(initialSort)
  const [inStockOnly, setInStockOnly] = useState(false)
  const [minRating, setMinRating] = useState(0)

  useEffect(() => {
    setMinPrice(priceBounds.min)
    setMaxPrice(priceBounds.max)
  }, [priceBounds.min, priceBounds.max])

  useEffect(() => {
    setSortBy(initialSort)
  }, [initialSort])

  useEffect(() => {
    setSelectedCategory(initialCategory)
  }, [initialCategory])

  useEffect(() => {
    setSelectedOrigin(initialOrigin)
  }, [initialOrigin])

  const filteredProducts = useMemo(() => {
    let nextProducts = [...products]

    if (search) {
      nextProducts = nextProducts.filter((product) =>
        product.name.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (selectedCategory) {
      nextProducts = nextProducts.filter((product) => product.category === selectedCategory)
    }

    if (selectedOrigin) {
      nextProducts = nextProducts.filter((product) => product.origin === selectedOrigin)
    }

    nextProducts = nextProducts.filter((product) => product.price >= minPrice && product.price <= maxPrice)

    if (inStockOnly) {
      nextProducts = nextProducts.filter((product) => product.inStock > 0)
    }

    if (minRating > 0) {
      nextProducts = nextProducts.filter((product) => {
        const averageRating = product.rating.length
          ? product.rating.reduce((acc, item) => acc + item.rating, 0) / product.rating.length
          : 0
        return averageRating >= minRating
      })
    }

    switch (sortBy) {
      case 'price-asc':
        nextProducts.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        nextProducts.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        nextProducts.sort((a, b) => {
          const ratingA = a.rating.length ? a.rating.reduce((acc, item) => acc + item.rating, 0) / a.rating.length : 0
          const ratingB = b.rating.length ? b.rating.reduce((acc, item) => acc + item.rating, 0) / b.rating.length : 0
          return ratingB - ratingA
        })
        break
      case 'discount-desc':
        nextProducts.sort((a, b) => {
          const discountA = a.mrp > a.price ? ((a.mrp - a.price) / a.mrp) * 100 : 0
          const discountB = b.mrp > b.price ? ((b.mrp - b.price) / b.mrp) * 100 : 0
          return discountB - discountA
        })
        break
      default:
        nextProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }

    return nextProducts
  }, [products, search, selectedCategory, selectedOrigin, minPrice, maxPrice, inStockOnly, minRating, sortBy])

  const resetFilters = () => {
    setSelectedCategory('')
    setSelectedOrigin('')
    setMinPrice(priceBounds.min)
    setMaxPrice(priceBounds.max)
    setSortBy('latest')
    setInStockOnly(false)
    setMinRating(0)
    router.push('/shop')
  }

  const handleMinPriceChange = (value) => {
    const nextMin = Number(value)
    setMinPrice(nextMin > maxPrice ? maxPrice : nextMin)
  }

  const handleMaxPriceChange = (value) => {
    const nextMax = Number(value)
    setMaxPrice(nextMax < minPrice ? minPrice : nextMax)
  }

  return (
    <div className="min-h-[70vh] px-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <h1 onClick={() => router.push('/shop')} className="my-6 flex cursor-pointer flex-wrap items-center gap-2 text-xl text-slate-500 sm:text-2xl">
          {search && <MoveLeftIcon size={20} />}
          Tất cả <span className="font-medium text-slate-700">Sản phẩm</span>
        </h1>

        <div className="mb-20 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10 xl:gap-14">
          <div className="order-2 lg:order-1">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              {selectedCategory && <span className="rounded-full bg-slate-100 px-3 py-1">Danh mục: {selectedCategory}</span>}
              {selectedOrigin && <span className="rounded-full bg-slate-100 px-3 py-1">Xuất xứ: {selectedOrigin}</span>}
              {inStockOnly && <span className="rounded-full bg-slate-100 px-3 py-1">Còn hàng</span>}
              {minRating > 0 && <span className="rounded-full bg-slate-100 px-3 py-1">Đánh giá: {minRating}+</span>}
            </div>

            <div className="grid grid-cols-2 justify-items-center gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8 xl:grid-cols-3 2xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} compact />
              ))}

              {!filteredProducts.length && (
                <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-slate-500">
                  Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại.
                </div>
              )}
            </div>
          </div>

          <aside className="order-1 lg:order-2 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Bộ lọc sản phẩm</h2>
                  <p className="text-sm text-slate-500">Tinh chỉnh danh sách theo nhu cầu của bạn</p>
                </div>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 text-sm text-slate-500 transition hover:text-slate-800"
                >
                  <RotateCcwIcon size={14} />
                </button>
              </div>

              <div className="mt-6 space-y-6">
                <section>
                  <h3 className="text-sm font-medium text-slate-800">Danh mục</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setSelectedCategory((current) => current === category ? '' : category)}
                        className={`rounded-full border px-3 py-1.5 text-sm transition ${selectedCategory === category
                          ? 'border-slate-800 bg-slate-800 text-white'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
                          }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-medium text-slate-800">Xuất xứ</h3>
                  <select
                    value={selectedOrigin}
                    onChange={(e) => setSelectedOrigin(e.target.value)}
                    className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none"
                  >
                    <option value="">Tất cả xuất xứ</option>
                    {origins.map((origin) => (
                      <option key={origin} value={origin}>{origin}</option>
                    ))}
                  </select>
                </section>

                <section>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-sm font-medium text-slate-800">Khoảng giá</h3>
                    <p className="text-sm text-slate-500">
                      {formatMoney(minPrice, currency)} - {formatMoney(maxPrice, currency)}
                    </p>
                  </div>

                  <div className="mt-4">
                    <input
                      type="range"
                      min={priceBounds.min}
                      max={priceBounds.max}
                      value={minPrice}
                      onChange={(e) => handleMinPriceChange(e.target.value)}
                      className="w-full accent-slate-700"
                    />
                    <input
                      type="range"
                      min={priceBounds.min}
                      max={priceBounds.max}
                      value={maxPrice}
                      onChange={(e) => handleMaxPriceChange(e.target.value)}
                      className="mt-2 w-full accent-green-600"
                    />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <label className="text-sm text-slate-600">
                      Từ
                      <input
                        type="number"
                        min={priceBounds.min}
                        max={maxPrice}
                        value={minPrice}
                        onChange={(e) => handleMinPriceChange(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none"
                      />
                    </label>
                    <label className="text-sm text-slate-600">
                      Đến
                      <input
                        type="number"
                        min={minPrice}
                        max={priceBounds.max}
                        value={maxPrice}
                        onChange={(e) => handleMaxPriceChange(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none"
                      />
                    </label>
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-medium text-slate-800">Sắp xếp</h3>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none"
                  >
                    <option value="latest">Mới nhất</option>
                    <option value="price-asc">Giá tăng dần</option>
                    <option value="price-desc">Giá giảm dần</option>
                    <option value="rating">Đánh giá cao nhất</option>
                    <option value="discount-desc">Giảm giá sâu nhất</option>
                  </select>
                </section>

                <section>
                  <h3 className="text-sm font-medium text-slate-800">Trạng thái</h3>
                  <label className="mt-3 flex items-center gap-3 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                    />
                    Chỉ hiển thị sản phẩm còn hàng
                  </label>
                </section>

                <section>
                  <h3 className="text-sm font-medium text-slate-800">Đánh giá tối thiểu</h3>
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {[0, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setMinRating(rating)}
                        className={`rounded-lg border px-3 py-2 text-sm transition ${minRating === rating
                          ? 'border-green-600 bg-green-50 text-green-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                      >
                        {rating === 0 ? 'Tất cả' : `${rating}+`}
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default function Shop() {
  return (
    <Suspense fallback={<div className="px-6 py-10">Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}
