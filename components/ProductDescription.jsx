'use client'

import { ArrowRight, StarIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

const ProductDescription = ({ product }) => {
  const [selectedTab, setSelectedTab] = useState('Mô tả')

  return (
    <div className="my-14 text-sm text-slate-600 sm:my-18">
      <div className="mb-6 flex max-w-full overflow-x-auto border-b border-slate-200 sm:max-w-2xl">
        {['Mô tả', 'Đánh giá'].map((tab, index) => (
          <button
            className={`${tab === selectedTab ? 'border-b-[1.5px] font-semibold text-slate-800' : 'text-slate-400'} whitespace-nowrap px-4 py-3 font-medium`}
            key={index}
            onClick={() => setSelectedTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {selectedTab === "Mô tả" && (
        <div
          className="max-w-4xl overflow-hidden break-words text-left sm:text-justify [&_*]:max-w-full [&_a]:break-all [&_a]:text-blue-600 [&_a]:underline [&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h1]:my-4 [&_h1]:break-words [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:text-slate-800 [&_h2]:my-3 [&_h2]:break-words [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-slate-800 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-xl [&_img]:object-contain [&_li]:break-words [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-3 [&_p]:break-words [&_p]:leading-7 [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-slate-900 [&_pre]:p-4 [&_pre]:text-slate-100 [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto [&_table]:border-collapse [&_td]:border [&_td]:border-slate-200 [&_td]:p-2 [&_th]:border [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:p-2 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6"
          dangerouslySetInnerHTML={{ __html: product.description }}
        />
      )}

      {selectedTab === "Đánh giá" && (
        <div className="mt-8 flex flex-col gap-6 sm:mt-10">
          {product.rating.map((item, index) => (
            <div key={index} className="flex gap-4 sm:gap-5">
              <Image src={item.user.image} alt={item.user.name} className="h-10 w-10 rounded-full" width={80} height={80} />
              <div className="min-w-0">
                <div className="flex items-center">
                  {Array(5).fill('').map((_, starIndex) => (
                    <StarIcon key={starIndex} size={18} className='mt-0.5 text-transparent' fill={item.rating >= starIndex + 1 ? "#00C950" : "#D1D5DB"} />
                  ))}
                </div>
                <p className="my-3 max-w-2xl leading-6">{item.review}</p>
                <p className="font-medium text-slate-800">{item.user.name}</p>
                <p className="mt-2 text-xs sm:text-sm">{new Date(item.createdAt).toDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 flex items-start gap-3 sm:mt-14">
        <Image src={product.store.logo} alt={product.store.name} className="h-11 w-11 rounded-full ring ring-slate-300" width={80} height={80} />
        <div className="min-w-0">
          <p className="font-medium text-slate-700">Sản phẩm của {product.store.name}</p>
          <Link href={`/shop/${product.store.username}`} className="mt-1 inline-flex items-center gap-1.5 text-green-500">Xem thêm <ArrowRight size={14} /></Link>
        </div>
      </div>
    </div>
  )
}

export default ProductDescription;
