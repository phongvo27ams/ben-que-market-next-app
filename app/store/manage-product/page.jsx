'use client'

import axios from "axios"
import React, { useEffect, useMemo, useState } from "react"
import { toast } from "react-hot-toast"
import Image from "next/image"
import { Pencil, Trash2, X } from "lucide-react"
import { useAuth, useUser } from "@clerk/nextjs"

import Loading from "../../../components/Loading"
import RichTextEditor from "../../../components/RichTextEditor"
import { assets, categories } from "../../../assets/assets"
import { formatMoney } from "../../../lib/format"

export default function StoreManageProducts() {
  const { getToken } = useAuth()
  const { user } = useUser()
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "đ"

  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [editingProductId, setEditingProductId] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" })
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    mrp: 0,
    price: 0,
    inStock: 0,
    category: "",
    origin: "",
    productionFacilityId: "",
    certification: "",
    ocopStars: 0,
  })
  const [editImages, setEditImages] = useState([null, null, null, null])
  const [productionFacilities, setProductionFacilities] = useState([])

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" }
      }
      return { key, direction: "asc" }
    })
  }

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return "↕"
    return sortConfig.direction === "asc" ? "↑" : "↓"
  }

  const sortedProducts = useMemo(() => {
    const direction = sortConfig.direction === "asc" ? 1 : -1
    return [...products].sort((a, b) => {
      switch (sortConfig.key) {
        case "name":
          return (a.name || "").localeCompare(b.name || "", "vi", { sensitivity: "base" }) * direction
        case "origin":
          return (a.origin || "").localeCompare(b.origin || "", "vi", { sensitivity: "base" }) * direction
        case "mrp":
          return (Number(a.mrp) - Number(b.mrp)) * direction
        case "price":
          return (Number(a.price) - Number(b.price)) * direction
        case "discountRate": {
          const discountA = Number(a.mrp) > 0 ? ((Number(a.mrp) - Number(a.price)) / Number(a.mrp)) * 100 : 0
          const discountB = Number(b.mrp) > 0 ? ((Number(b.mrp) - Number(b.price)) / Number(b.mrp)) * 100 : 0
          return (discountA - discountB) * direction
        }
        case "inStock":
          return (Number(a.inStock) - Number(b.inStock)) * direction
        case "createdAt":
        default:
          return (new Date(a.createdAt) - new Date(b.createdAt)) * direction
      }
    })
  }, [products, sortConfig])

  const fetchProducts = async () => {
    try {
      const token = await getToken()
      const { data } = await axios.get("/api/store/product", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setProducts(data.products || [])
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message)
    }
    setLoading(false)
  }

  const fetchProductionFacilities = async () => {
    try {
      const token = await getToken()
      const { data } = await axios.get("/api/store/production-facility", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setProductionFacilities(data.productionFacilities || [])
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message)
    }
  }

  const updateStock = async (productId, nextStock) => {
    const token = await getToken()
    const { data } = await axios.post("/api/store/stock-toggle", { productId, inStock: Number(nextStock) }, {
      headers: { Authorization: `Bearer ${token}` },
    })
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId ? { ...product, inStock: Number(nextStock) } : product
      )
    )
    toast.success(data.message)
  }

  const startEdit = (product) => {
    setEditingProductId(product.id)
    setEditForm({
      name: product.name,
      description: product.description,
      mrp: product.mrp,
      price: product.price,
      inStock: product.inStock,
      category: product.category,
      origin: product.origin || "",
      productionFacilityId: product.productionFacilityId || "",
      certification: product.certification || "",
      ocopStars: product.ocopStars || 0,
    })
    setEditImages([
      product.images?.[0] || null,
      product.images?.[1] || null,
      product.images?.[2] || null,
      product.images?.[3] || null,
    ])
  }

  const cancelEdit = () => {
    setEditingProductId(null)
    setEditForm({
      name: "",
      description: "",
      mrp: 0,
      price: 0,
      inStock: 0,
      category: "",
      origin: "",
      productionFacilityId: "",
      certification: "",
      ocopStars: 0,
    })
    setEditImages([null, null, null, null])
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  const updateProduct = async (productId) => {
    const token = await getToken()
    const retainedImages = editImages.filter((image) => typeof image === "string")
    const newImages = editImages.filter((image) => image instanceof File)

    if (retainedImages.length + newImages.length === 0) {
      toast.error("Vui lòng giữ lại ít nhất một ảnh sản phẩm.")
      return
    }

    const formData = new FormData()
    formData.append("productId", productId)
    formData.append("name", editForm.name)
    formData.append("description", editForm.description)
    formData.append("mrp", Number(editForm.mrp))
    formData.append("price", Number(editForm.price))
    formData.append("inStock", Number(editForm.inStock))
    formData.append("category", editForm.category)
    formData.append("origin", editForm.origin)
    formData.append("productionFacilityId", editForm.productionFacilityId)
    formData.append("certification", editForm.certification)
    formData.append("ocopStars", Number(editForm.ocopStars))
    formData.append("retainedImages", JSON.stringify(retainedImages))
    newImages.forEach((image) => formData.append("newImages", image))

    const { data } = await axios.put("/api/store/product", formData, {
      headers: { Authorization: `Bearer ${token}` },
    })

    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId
          ? {
              ...product,
              ...editForm,
              mrp: Number(editForm.mrp),
              price: Number(editForm.price),
              inStock: Number(editForm.inStock),
              ocopStars: Number(editForm.ocopStars),
              productionFacility:
                productionFacilities.find((facility) => facility.id === editForm.productionFacilityId) ||
                product.productionFacility,
              images: data.images,
            }
          : product
      )
    )
    toast.success(data.message)
    cancelEdit()
  }

  const handleEditImageChange = (index, file) => {
    setEditImages((prev) => prev.map((image, currentIndex) => (currentIndex === index ? file || null : image)))
  }

  const removeEditImage = (index) => {
    setEditImages((prev) => prev.map((image, currentIndex) => (currentIndex === index ? null : image)))
  }

  const getEditImagePreview = (image) => {
    if (!image) return assets.upload_area
    if (typeof image === "string") return image
    return URL.createObjectURL(image)
  }

  const deleteProduct = async (productId) => {
    const confirmed = window.confirm("Bạn có chắc muốn xóa sản phẩm này không?")
    if (!confirmed) return
    const token = await getToken()
    const { data } = await axios.delete(`/api/store/product?productId=${productId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    setProducts((prevProducts) => prevProducts.filter((product) => product.id !== productId))
    if (editingProductId === productId) cancelEdit()
    toast.success(data.message)
  }

  useEffect(() => {
    if (user) {
      fetchProducts()
      fetchProductionFacilities()
    }
  }, [user])

  if (loading) return <Loading />

  return (
    <>
      <h1 className="mb-5 text-2xl text-slate-500">
        Quản lý <span className="font-medium text-slate-800">Sản phẩm</span>
      </h1>
      <div className="w-full overflow-x-auto rounded-xl bg-white ring-1 ring-slate-200 lg:overflow-visible">
        <table className="w-full min-w-[980px] table-fixed text-left text-sm">
          <thead className="bg-slate-50 uppercase tracking-wider text-gray-700">
            <tr>
              <th className="w-[45%] px-4 py-3">
                <button type="button" onClick={() => handleSort("name")} className="inline-flex items-center gap-1">
                  Tên sản phẩm <span className="text-slate-500">{getSortIndicator("name")}</span>
                </button>
              </th>
              <th className="px-4 py-3">
                <button type="button" onClick={() => handleSort("origin")} className="inline-flex items-center gap-1">
                  Xuất xứ <span className="text-slate-500">{getSortIndicator("origin")}</span>
                </button>
              </th>
              <th className="px-4 py-3">
                <button type="button" onClick={() => handleSort("mrp")} className="inline-flex items-center gap-1">
                  Giá gốc <span className="text-slate-500">{getSortIndicator("mrp")}</span>
                </button>
              </th>
              <th className="px-4 py-3">
                <button type="button" onClick={() => handleSort("price")} className="inline-flex items-center gap-1">
                  Giá bán <span className="text-slate-500">{getSortIndicator("price")}</span>
                </button>
              </th>
              <th className="px-4 py-3">
                <button type="button" onClick={() => handleSort("discountRate")} className="inline-flex items-center gap-1">
                  Tỷ lệ <span className="text-slate-500">{getSortIndicator("discountRate")}</span>
                </button>
              </th>
              <th className="px-4 py-3 text-center">
                <button type="button" onClick={() => handleSort("inStock")} className="inline-flex items-center gap-1">
                  Tồn kho <span className="text-slate-500">{getSortIndicator("inStock")}</span>
                </button>
              </th>
              <th className="px-4 py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-slate-700">
            {sortedProducts.map((product) => (
              <React.Fragment key={product.id}>
                <tr className="border-t border-gray-200 align-middle hover:bg-gray-50">
                  <td className="w-[36%] px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Image width={60} height={60} className="h-40 w-40 flex-none rounded p-1 shadow" src={product.images?.[0]} alt="" />
                      <span className="line-clamp-2 font-medium text-slate-800">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><p className="line-clamp-2 break-words text-slate-600">{product.origin || "Chưa cập nhật"}</p></td>
                  <td className="whitespace-nowrap px-4 py-3">{formatMoney(product.mrp, currency)}</td>
                  <td className="whitespace-nowrap px-4 py-3">{formatMoney(product.price, currency)}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {Number(product.mrp) > 0 && Number(product.price) < Number(product.mrp)
                      ? `${Math.round(((Number(product.mrp) - Number(product.price)) / Number(product.mrp)) * 100)}%`
                      : "0%"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input type="number" min="0" value={product.inStock} onChange={(e) => toast.promise(updateStock(product.id, e.target.value), { loading: "Đang cập nhật tồn kho..." })} className="w-20 rounded border border-slate-200 px-2 py-1 text-center outline-none" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <button type="button" onClick={() => startEdit(product)} className="inline-flex items-center gap-1 text-blue-600 transition hover:text-blue-800"><Pencil size={16} /></button>
                      <button type="button" onClick={() => toast.promise(deleteProduct(product.id), { loading: "Đang xóa sản phẩm..." })} className="inline-flex items-center gap-1 text-red-500 transition hover:text-red-700"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
                {editingProductId === product.id && (
                  <tr className="border-t border-gray-200 bg-slate-50">
                    <td colSpan={7} className="overflow-visible p-4">
                      <div className="overflow-visible rounded-xl border border-slate-200 bg-white p-4">
                        <div className="mb-4 flex items-center justify-between">
                          <h2 className="text-base font-medium text-slate-800">Chỉnh sửa sản phẩm</h2>
                          <button type="button" onClick={cancelEdit} className="text-slate-500 hover:text-slate-700"><X size={18} /></button>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="md:col-span-2">
                            <p className="mb-2 text-sm font-medium text-slate-700">Hình ảnh sản phẩm</p>
                            <div className="flex flex-wrap gap-3">
                              {editImages.map((image, index) => (
                                <div key={index} className="relative">
                                  <label htmlFor={`edit-image-${product.id}-${index}`} className="block cursor-pointer">
                                    <Image width={300} height={300} className="h-20 w-20 rounded border border-slate-200 object-cover" src={getEditImagePreview(image)} alt="" />
                                  </label>
                                  <input id={`edit-image-${product.id}-${index}`} type="file" accept="image/*" hidden onChange={(e) => handleEditImageChange(index, e.target.files?.[0])} />
                                  {image && <button type="button" onClick={() => removeEditImage(index)} className="absolute -right-2 -top-2 rounded-full bg-white p-1 text-red-500 shadow hover:text-red-700"><X size={14} /></button>}
                                </div>
                              ))}
                            </div>
                          </div>
                          <label className="flex flex-col gap-2">Tên sản phẩm<input type="text" name="name" value={editForm.name} onChange={handleEditChange} className="rounded border border-slate-200 p-2 px-3 outline-none" required /></label>
                          <label className="flex flex-col gap-2">Danh mục<select name="category" value={editForm.category} onChange={handleEditChange} className="rounded border border-slate-200 p-2 px-3 outline-none" required><option value="">Chọn danh mục</option>{categories.map((category) => (<option key={category} value={category}>{category}</option>))}</select></label>
                          <label className="flex flex-col gap-2">Xuất xứ<input type="text" name="origin" value={editForm.origin} onChange={handleEditChange} className="rounded border border-slate-200 p-2 px-3 outline-none" required /></label>
                          <label className="flex flex-col gap-2 md:col-span-2">Cơ sở sản xuất<select name="productionFacilityId" value={editForm.productionFacilityId} onChange={handleEditChange} className="rounded border border-slate-200 p-2 px-3 outline-none"><option value="">Chọn cơ sở sản xuất</option>{productionFacilities.map((facility) => (<option key={facility.id} value={facility.id}>{facility.name}</option>))}</select></label>
                          <label className="flex flex-col gap-2 md:col-span-2">Số sao OCOP: <span className="font-medium text-slate-800">{editForm.ocopStars}</span><input type="range" name="ocopStars" min="0" max="5" step="1" value={editForm.ocopStars} onChange={handleEditChange} className="accent-emerald-600" /></label>
                          <label className="flex flex-col gap-2 md:col-span-2">Giấy chứng nhận<textarea name="certification" value={editForm.certification} onChange={handleEditChange} rows={3} className="rounded border border-slate-200 p-2 px-3 outline-none resize-none" /></label>
                          <div className="flex flex-col gap-2 md:col-span-2">
                            <p>Mô tả sản phẩm</p>
                            <RichTextEditor value={editForm.description} onChange={(value) => setEditForm((prev) => ({ ...prev, description: value }))} minHeight={340} />
                          </div>
                          <label className="flex flex-col gap-2">Giá gốc ({currency})<input type="number" min="0" name="mrp" value={editForm.mrp} onChange={handleEditChange} className="rounded border border-slate-200 p-2 px-3 outline-none" required /></label>
                          <label className="flex flex-col gap-2">Giá bán ({currency})<input type="number" min="0" name="price" value={editForm.price} onChange={handleEditChange} className="rounded border border-slate-200 p-2 px-3 outline-none" required /></label>
                          <label className="flex flex-col gap-2">Số lượng tồn kho<input type="number" min="0" name="inStock" value={editForm.inStock} onChange={handleEditChange} className="rounded border border-slate-200 p-2 px-3 outline-none" required /></label>
                        </div>
                        <div className="mt-4 flex gap-3">
                          <button type="button" onClick={() => toast.promise(updateProduct(product.id), { loading: "Đang cập nhật sản phẩm..." })} className="rounded bg-slate-800 px-5 py-2 text-white transition hover:bg-slate-900">Lưu thay đổi</button>
                          <button type="button" onClick={cancelEdit} className="rounded border border-slate-200 px-5 py-2 text-slate-700 transition hover:bg-slate-50">Hủy</button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
