"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import toast from "react-hot-toast";
import { assets, categories } from "../../../assets/assets";
import RichTextEditor from "../../../components/RichTextEditor";

export default function AdminAddProduct() {
  const { getToken } = useAuth();
  const [images, setImages] = useState({ 1: null, 2: null, 3: null, 4: null });
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [productInfo, setProductInfo] = useState({
    name: "",
    description: "",
    mrp: 0,
    price: 0,
    inStock: 0,
    category: "",
    origin: "",
    certification: "",
    ocopStars: 0,
  });

  const onChangeHandler = (e) => setProductInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleImageUpload = (key, file) => setImages((prev) => ({ ...prev, [key]: file }));

  const handleGenerateDescriptionWithAI = async () => {
    if (!productInfo.name.trim() || !productInfo.category || !productInfo.origin.trim()) {
      toast.error("Hãy nhập Tên sản phẩm, Danh mục và Xuất xứ trước khi dùng AI.");
      return;
    }
    const firstImageFile = images[1] || images[2] || images[3] || images[4];
    if (!firstImageFile) {
      toast.error("Vui lòng tải lên ít nhất 1 ảnh để AI phân tích.");
      return;
    }
    try {
      setAiLoading(true);
      const imageDataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Không thể đọc ảnh để gửi AI"));
        reader.readAsDataURL(firstImageFile);
      });

      const token = await getToken();
      const response = await toast.promise(
        axios.post(
          "/api/store/ai",
          {
            productName: productInfo.name,
            category: productInfo.category,
            origin: productInfo.origin,
            imageDataUrl,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        {
          loading: "AI đang viết bài giới thiệu...",
          success: "Đã tạo mô tả sản phẩm.",
          error: (err) => err?.response?.data?.error || err.message,
        }
      );
      if (response.data?.description) {
        setProductInfo((prev) => ({
          ...prev,
          name: response.data.name || prev.name,
          description: response.data.description,
        }));
      }
    } finally {
      setAiLoading(false);
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      if (!images[1] && !images[2] && !images[3] && !images[4]) {
        return toast.error("Vui lòng tải lên ít nhất một ảnh sản phẩm.");
      }
      setLoading(true);
      const formData = new FormData();
      Object.entries({
        name: productInfo.name,
        description: productInfo.description,
        mrp: productInfo.mrp,
        price: productInfo.price,
        inStock: productInfo.inStock,
        category: productInfo.category,
        origin: productInfo.origin,
        certification: productInfo.certification,
        ocopStars: productInfo.ocopStars,
      }).forEach(([k, v]) => formData.append(k, v));
      Object.keys(images).forEach((key) => images[key] && formData.append("images", images[key]));
      const token = await getToken();
      await axios.post("/api/store/product", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Đã thêm sản phẩm thành công.");
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => toast.promise(onSubmitHandler(e), { loading: "Đang thêm sản phẩm..." })} className="mb-28 w-full text-slate-600">
      <h1 className="text-2xl">Thêm <span className="font-medium text-slate-800">Sản phẩm mới</span></h1>

      <label className="my-6 flex w-full flex-col gap-2">
        Tên sản phẩm
        <input type="text" name="name" onChange={onChangeHandler} value={productInfo.name} className="w-full rounded border border-slate-200 p-2 px-4 outline-none" required />
      </label>

      <p className="mt-7">Hình ảnh sản phẩm</p>
      <div className="mt-4 flex gap-3">
        {Object.keys(images).map((key) => (
          <label key={key} htmlFor={`images${key}`}>
            <Image width={300} height={300} className="h-16 w-auto cursor-pointer rounded border border-slate-200" src={images[key] ? URL.createObjectURL(images[key]) : assets.upload_area} alt="" />
            <input type="file" accept="image/*" id={`images${key}`} onChange={(e) => handleImageUpload(key, e.target.files[0])} hidden />
          </label>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={handleGenerateDescriptionWithAI} disabled={aiLoading} className="rounded bg-emerald-600 px-5 py-2 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300">
          {aiLoading ? "AI đang viết..." : "Dùng AI tạo mô tả"}
        </button>
      </div>

      <div className="my-6 flex flex-col gap-2">
        <p>Mô tả sản phẩm</p>
        <div className="w-full">
          <RichTextEditor value={productInfo.description} onChange={(value) => setProductInfo((prev) => ({ ...prev, description: value }))} minHeight={320} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <label className="flex flex-col gap-2">Giá gốc<input type="number" name="mrp" onChange={onChangeHandler} value={productInfo.mrp} className="w-full rounded border border-slate-200 p-2 px-4 outline-none" required /></label>
        <label className="flex flex-col gap-2">Giá bán<input type="number" name="price" onChange={onChangeHandler} value={productInfo.price} className="w-full rounded border border-slate-200 p-2 px-4 outline-none" required /></label>
        <label className="flex flex-col gap-2">Số lượng tồn kho<input type="number" min="0" name="inStock" onChange={onChangeHandler} value={productInfo.inStock} className="w-full rounded border border-slate-200 p-2 px-4 outline-none" required /></label>
      </div>

      <label className="my-6 flex flex-col gap-2">Xuất xứ<input type="text" name="origin" onChange={onChangeHandler} value={productInfo.origin} className="w-full rounded border border-slate-200 p-2 px-4 outline-none" required /></label>
      <label className="my-6 flex flex-col gap-2">Số sao OCOP: <span className="font-medium text-slate-800">{productInfo.ocopStars}</span><input type="range" name="ocopStars" min="0" max="5" step="1" value={productInfo.ocopStars} onChange={onChangeHandler} className="w-full accent-emerald-600" /></label>
      <label className="my-6 flex flex-col gap-2">Giấy chứng nhận<textarea name="certification" onChange={onChangeHandler} value={productInfo.certification} rows={3} className="w-full rounded border border-slate-200 p-2 px-4 outline-none resize-none" required /></label>
      <label className="my-6 flex flex-col gap-2">Danh mục sản phẩm<select onChange={(e) => setProductInfo({ ...productInfo, category: e.target.value })} value={productInfo.category} className="w-full rounded border border-slate-200 p-2 px-4 outline-none" required><option value="">Chọn danh mục</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>

      <button disabled={loading} className="mt-7 rounded bg-slate-800 px-6 py-2 text-white transition hover:bg-slate-900">Thêm sản phẩm</button>
    </form>
  );
}
