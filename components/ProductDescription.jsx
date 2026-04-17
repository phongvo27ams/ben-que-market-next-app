'use client'

import { ArrowRight, StarIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

const ProductDescription = ({ product }) => {
  const [selectedTab, setSelectedTab] = useState('Mô tả')

  return (
    <div className="my-18 text-sm text-slate-600">
      <div className="flex border-b border-slate-200 mb-6 max-w-2xl">
        {['Mô tả', 'Đánh giá'].map((tab, index) => (
          <button className={`${tab === selectedTab ? 'border-b-[1.5px] font-semibold' : 'text-slate-400'} px-3 py-2 font-medium`} key={index} onClick={() => setSelectedTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      {selectedTab === "Mô tả" && (
        <div
          className="max-w-3xl overflow-hidden break-words text-justify [&_*]:max-w-full [&_a]:break-all [&_a]:text-blue-600 [&_a]:underline [&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h1]:my-4 [&_h1]:break-words [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:text-slate-800 [&_h2]:my-3 [&_h2]:break-words [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-slate-800 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-xl [&_img]:object-contain [&_li]:break-words [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-3 [&_p]:break-words [&_p]:leading-7 [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-slate-900 [&_pre]:p-4 [&_pre]:text-slate-100 [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto [&_table]:border-collapse [&_td]:border [&_td]:border-slate-200 [&_td]:p-2 [&_th]:border [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:p-2 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6"
          dangerouslySetInnerHTML={{ __html: product.description }}
        />
      )}

      {selectedTab === "Đánh giá" && (
        <div className="flex flex-col gap-3 mt-14">
          {product.rating.map((item, index) => (
            <div key={index} className="flex gap-5 mb-10">
              <Image src={item.user.image} alt="" className="size-10 rounded-full" width={100} height={100} />
              <div>
                <div className="flex items-center" >
                  {Array(5).fill('').map((_, index) => (
                    <StarIcon key={index} size={18} className='text-transparent mt-0.5' fill={item.rating >= index + 1 ? "#00C950" : "#D1D5DB"} />
                  ))}
                </div>
                <p className="text-sm max-w-lg my-4">{item.review}</p>
                <p className="font-medium text-slate-800">{item.user.name}</p>
                <p className="mt-3 font-light">{new Date(item.createdAt).toDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3 mt-14">
        <Image src={product.store.logo} alt="" className="size-11 rounded-full ring ring-slate-400" width={100} height={100} />
        <div>
          <p className="font-medium text-slate-600">Sản phẩm của {product.store.name}</p>
          <Link href={`/shop/${product.store.username}`} className="flex items-center gap-1.5 text-green-500">xem thêm <ArrowRight size={14} /></Link>
        </div>
      </div>
    </div>
  )
}

export default ProductDescription;
