'use client'

import axios from "axios"
import React from "react"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import Image from "next/image"
import { Pencil, Trash2, X } from "lucide-react"
import Loading from "../../../components/Loading"
import { formatMoney } from "../../../lib/format"
import { useAuth, useUser } from "@clerk/nextjs"
import { assets } from "../../../assets/assets"
import RichTextEditor from "../../../components/RichTextEditor"

const stripHtml = (html = "") => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

export default function StoreManageProducts() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const categories = [
    "Đặc sản thực phẩm khô",
    "Trái cây đặc sản theo mùa",
    "Đồ uống tự nhiên",
    "Đồ ăn chế biến sẵn",
    "Đồ thủ công mỹ nghệ",
    "Quà lưu niệm"
  ];

  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [editingProductId, setEditingProductId] = useState(null)
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    mrp: 0,
    price: 0,
    category: "",
    inStock: true,
  })
  const [editImages, setEditImages] = useState([null, null, null, null])

  const fetchProducts = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get('/api/store/product', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(data.products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error(error?.response?.data?.error || error.message)
    }
    setLoading(false);
  }

  const toggleStock = async (productId) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(`/api/store/stock-toggle`, { productId }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === productId ? { ...product, inStock: !product.inStock } : product
        )
      );
      toast.success(data.message);
    } catch (error) {
      console.error("Error updating stock status:", error);
      toast.error(error?.response?.data?.error || error.message);
    }
  }

  const startEdit = (product) => {
    setEditingProductId(product.id);
    setEditForm({
      name: product.name,
      description: product.description,
      mrp: product.mrp,
      price: product.price,
      category: product.category,
      inStock: product.inStock,
    });
    setEditImages([
      product.images[0] || null,
      product.images[1] || null,
      product.images[2] || null,
      product.images[3] || null,
    ]);
  }

  const cancelEdit = () => {
    setEditingProductId(null);
    setEditForm({
      name: "",
      description: "",
      mrp: 0,
      price: 0,
      category: "",
      inStock: true,
    });
    setEditImages([null, null, null, null]);
  }

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  const updateProduct = async (productId) => {
    try {
      const token = await getToken();
      const retainedImages = editImages.filter((image) => typeof image === "string");
      const newImages = editImages.filter((image) => image instanceof File);

      if (retainedImages.length + newImages.length === 0) {
        toast.error("Please keep at least one product image");
        return;
      }

      const formData = new FormData();
      formData.append("productId", productId);
      formData.append("name", editForm.name);
      formData.append("description", editForm.description);
      formData.append("mrp", Number(editForm.mrp));
      formData.append("price", Number(editForm.price));
      formData.append("category", editForm.category);
      formData.append("inStock", editForm.inStock);
      formData.append("retainedImages", JSON.stringify(retainedImages));
      newImages.forEach((image) => formData.append("newImages", image));

      const { data } = await axios.put('/api/store/product', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === productId
            ? {
                ...product,
                ...editForm,
                mrp: Number(editForm.mrp),
                price: Number(editForm.price),
                images: data.images,
              }
            : product
        )
      );
      toast.success(data.message);
      cancelEdit();
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    }
  }

  const handleEditImageChange = (index, file) => {
    setEditImages((prev) => prev.map((image, currentIndex) => (
      currentIndex === index ? file || null : image
    )));
  }

  const removeEditImage = (index) => {
    setEditImages((prev) => prev.map((image, currentIndex) => (
      currentIndex === index ? null : image
    )));
  }

  const getEditImagePreview = (image) => {
    if (!image) return assets.upload_area;
    if (typeof image === "string") return image;
    return URL.createObjectURL(image);
  }

  const deleteProduct = async (productId) => {
    try {
      const confirmed = window.confirm("Delete this product?");
      if (!confirmed) return;

      const token = await getToken();
      const { data } = await axios.delete(`/api/store/product?productId=${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProducts((prevProducts) => prevProducts.filter((product) => product.id !== productId));
      if (editingProductId === productId) {
        cancelEdit();
      }
      toast.success(data.message);
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    }
  }

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  if (loading) return <Loading />

  return (
    <>
      <h1 className="text-2xl text-slate-500 mb-5">Manage <span className="text-slate-800 font-medium">Products</span></h1>
      <div className="w-full overflow-x-auto lg:overflow-visible rounded-xl ring-1 ring-slate-200 bg-white">
        <table className="w-full min-w-[980px] table-fixed text-left text-sm">
          <colgroup>
            <col className="w-[24%]" />
            <col className="w-[26%]" />
            <col className="w-[12%]" />
            <col className="w-[12%]" />
            <col className="w-[10%]" />
            <col className="w-[16%]" />
          </colgroup>
          <thead className="bg-slate-50 text-gray-700 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">MRP</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3 text-center">In Stock</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
        </thead>
        <tbody className="text-slate-700">
          {products.map((product) => (
              <React.Fragment key={product.id}>
                <tr key={product.id} className="border-t border-gray-200 align-top hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Image width={40} height={40} className='h-10 w-10 flex-none rounded p-1 shadow' src={product.images[0]} alt="" />
                      <span className="truncate font-medium text-slate-800">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <p className="line-clamp-2 break-words">{stripHtml(product.description)}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatMoney(product.mrp, currency)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatMoney(product.price, currency)}</td>
                  <td className="px-4 py-3 text-center">
                    <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
                      <input type="checkbox" className="sr-only peer" onChange={() => toast.promise(toggleStock(product.id), { loading: "Updating data..." })} checked={product.inStock} />
                      <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                      <span className="dot absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-4"></span>
                    </label>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => startEdit(product)}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => toast.promise(deleteProduct(product.id), { loading: "Deleting product..." })}
                        className="inline-flex items-center gap-1 text-red-500 hover:text-red-700 transition"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
                {editingProductId === product.id && (
                  <tr className="border-t border-gray-200 bg-slate-50">
                    <td colSpan={6} className="overflow-visible p-4">
                      <div className="overflow-visible rounded-xl border border-slate-200 bg-white p-4">
                        <div className="mb-4 flex items-center justify-between">
                          <h2 className="text-base font-medium text-slate-800">Edit Product</h2>
                          <button type="button" onClick={cancelEdit} className="text-slate-500 hover:text-slate-700">
                            <X size={18} />
                          </button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="md:col-span-2">
                            <p className="mb-2 text-sm font-medium text-slate-700">Product Images</p>
                            <div className="flex flex-wrap gap-3">
                              {editImages.map((image, index) => (
                                <div key={index} className="relative">
                                  <label htmlFor={`edit-image-${product.id}-${index}`} className="block cursor-pointer">
                                    <Image
                                      width={300}
                                      height={300}
                                      className="h-20 w-20 rounded border border-slate-200 object-cover"
                                      src={getEditImagePreview(image)}
                                      alt=""
                                    />
                                  </label>
                                  <input
                                    id={`edit-image-${product.id}-${index}`}
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={(e) => handleEditImageChange(index, e.target.files?.[0])}
                                  />
                                  {image && (
                                    <button
                                      type="button"
                                      onClick={() => removeEditImage(index)}
                                      className="absolute -right-2 -top-2 rounded-full bg-white p-1 text-red-500 shadow hover:text-red-700"
                                    >
                                      <X size={14} />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                            <p className="mt-2 text-xs text-slate-500">Click an image slot to replace it, or press X to remove it.</p>
                          </div>
                          <label className="flex flex-col gap-2">
                            Name
                            <input type="text" name="name" value={editForm.name} onChange={handleEditChange} className="rounded border border-slate-200 p-2 px-3 outline-none" required />
                          </label>
                          <label className="flex flex-col gap-2">
                            Category
                            <select name="category" value={editForm.category} onChange={handleEditChange} className="rounded border border-slate-200 p-2 px-3 outline-none" required>
                              <option value="">Select a category</option>
                              {categories.map((category) => (
                                <option key={category} value={category}>{category}</option>
                              ))}
                            </select>
                          </label>
                          <div className="flex flex-col gap-2 md:col-span-2">
                            <p>Description</p>
                            <RichTextEditor
                              value={editForm.description}
                              onChange={(value) => setEditForm((prev) => ({ ...prev, description: value }))}
                              placeholder="Write a blog-style product story with headings, highlights, ingredients, usage, benefits, and a call to action."
                              minHeight={340}
                            />
                          </div>
                          <label className="flex flex-col gap-2">
                            Actual Price ({currency})
                            <input type="number" min="0" name="mrp" value={editForm.mrp} onChange={handleEditChange} className="rounded border border-slate-200 p-2 px-3 outline-none" required />
                          </label>
                          <label className="flex flex-col gap-2">
                            Offer Price ({currency})
                            <input type="number" min="0" name="price" value={editForm.price} onChange={handleEditChange} className="rounded border border-slate-200 p-2 px-3 outline-none" required />
                          </label>
                          <label className="flex items-center gap-3 text-sm text-slate-700">
                            <input type="checkbox" name="inStock" checked={editForm.inStock} onChange={handleEditChange} />
                            Available in stock
                          </label>
                        </div>

                        <div className="mt-4 flex gap-3">
                          <button
                            type="button"
                            onClick={() => toast.promise(updateProduct(product.id), { loading: "Updating product..." })}
                            className="rounded bg-slate-800 px-5 py-2 text-white hover:bg-slate-900 transition"
                          >
                            Save Changes
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="rounded border border-slate-200 px-5 py-2 text-slate-700 hover:bg-slate-50 transition"
                          >
                            Cancel
                          </button>
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
