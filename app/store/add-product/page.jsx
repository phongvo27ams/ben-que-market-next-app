"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import toast from "react-hot-toast";

import { assets, categories } from "../../../assets/assets";
import RichTextEditor from "../../../components/RichTextEditor";

export default function StoreAddProduct() {
  const [images, setImages] = useState({ 1: null, 2: null, 3: null, 4: null });
  const [productInfo, setProductInfo] = useState({
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
  });
  const [productionFacilities, setProductionFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const { getToken } = useAuth();

  const onChangeHandler = (e) => {
    setProductInfo({ ...productInfo, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (key, file) => {
    setImages((prev) => ({ ...prev, [key]: file }));
  };

  const fetchProductionFacilities = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/store/production-facility", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const facilities = data.productionFacilities || [];
      setProductionFacilities(facilities);
      setProductInfo((prev) => ({
        ...prev,
        productionFacilityId: prev.productionFacilityId || facilities[0]?.id || "",
      }));
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    }
  };

  const handleGenerateDescriptionWithAI = async () => {
    if (!productInfo.name.trim()) {
      toast.error("Hãy nhập tên sản phẩm trước khi dùng AI.");
      return;
    }

    if (!productInfo.category) {
      toast.error("Hãy chọn danh mục sản phẩm trước khi dùng AI.");
      return;
    }

    if (!productInfo.origin.trim()) {
      toast.error("Hãy nhập xuất xứ sản phẩm trước khi dùng AI.");
      return;
    }

    try {
      setAiLoading(true);
      const token = await getToken();

      const response = await toast.promise(
        axios.post(
          "/api/store/ai",
          {
            productName: productInfo.name,
            category: productInfo.category,
            origin: productInfo.origin,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        {
          loading: "AI đang viết bài giới thiệu sản phẩm...",
          success: (res) => {
            const data = res.data;
            if (data.description) {
              setProductInfo((prev) => ({
                ...prev,
                name: data.name || prev.name,
                description: data.description,
              }));
              return data.fallback
                ? "AI lỗi, hệ thống đã tạo bản nháp mô tả dự phòng."
                : "AI đã tạo xong bài giới thiệu sản phẩm.";
            }
            return "AI không trả về mô tả hợp lệ.";
          },
          error: (err) => {
            const status = err?.response?.status;
            if (status === 403) {
              return "AI chỉ dành cho tài khoản Store đã được duyệt.";
            }
            return err?.response?.data?.error || err.message;
          },
        }
      );

      if (response.data?.fallback) {
        toast((t) => (
          <div className="max-w-sm text-sm">
            <p className="font-medium text-amber-700">AI không chạy được, đang dùng fallback</p>
            <p className="mt-1 text-slate-600">{response.data.error}</p>
            {response.data.providerError && (
              <p className="mt-1 break-words text-xs text-slate-500">{response.data.providerError}</p>
            )}
            <button
              type="button"
              onClick={() => toast.dismiss(t.id)}
              className="mt-3 rounded bg-slate-800 px-3 py-1 text-xs text-white"
            >
              Đóng
            </button>
          </div>
        ), { duration: 9000 });
      }
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
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
      formData.append("name", productInfo.name);
      formData.append("description", productInfo.description);
      formData.append("mrp", productInfo.mrp);
      formData.append("price", productInfo.price);
      formData.append("inStock", productInfo.inStock);
      formData.append("category", productInfo.category);
      formData.append("origin", productInfo.origin);
      formData.append("productionFacilityId", productInfo.productionFacilityId);
      formData.append("certification", productInfo.certification);
      formData.append("ocopStars", productInfo.ocopStars);

      Object.keys(images).forEach((key) => {
        if (images[key]) {
          formData.append("images", images[key]);
        }
      });

      const token = await getToken();
      await axios.post("/api/store/product", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Đã thêm sản phẩm thành công.");

      setProductInfo({
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
      });
      setImages({ 1: null, 2: null, 3: null, 4: null });
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductionFacilities();
  }, []);

  return (
    <form onSubmit={(e) => toast.promise(onSubmitHandler(e), { loading: "Đang thêm sản phẩm..." })} className="mb-28 text-slate-600">
      <h1 className="text-2xl">Thêm <span className="font-medium text-slate-800">Sản phẩm mới</span></h1>

      <label className="my-6 flex flex-col gap-2">
        Tên sản phẩm
        <input
          type="text"
          name="name"
          onChange={onChangeHandler}
          value={productInfo.name}
          placeholder="Nhập tên sản phẩm trước khi dùng AI"
          className="w-full max-w-sm rounded border border-slate-200 p-2 px-4 outline-none"
          required
        />
      </label>

      <p className="mt-7">Hình ảnh sản phẩm</p>
      <div className="mt-4 flex gap-3">
        {Object.keys(images).map((key) => (
          <label key={key} htmlFor={`images${key}`}>
            <Image
              width={300}
              height={300}
              className="h-15 w-auto cursor-pointer rounded border border-slate-200"
              src={images[key] ? URL.createObjectURL(images[key]) : assets.upload_area}
              alt=""
            />
            <input type="file" accept="image/*" id={`images${key}`} onChange={(e) => handleImageUpload(key, e.target.files[0])} hidden />
          </label>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleGenerateDescriptionWithAI}
          disabled={aiLoading}
          className="rounded bg-emerald-600 px-5 py-2 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
        >
          {aiLoading ? "AI đang viết..." : "Dùng AI tạo mô tả"}
        </button>
        <p className="text-sm text-slate-500">
          AI sẽ viết bài marketing storytelling từ Tên, Danh mục và Xuất xứ với 4 heading và 4 đoạn văn nổi bật.
        </p>
      </div>

      <div className="my-6 flex flex-col gap-2">
        <p>Mô tả sản phẩm</p>
        <div className="w-full max-w-3xl">
          <RichTextEditor
            value={productInfo.description}
            onChange={(value) => setProductInfo((prev) => ({ ...prev, description: value }))}
            placeholder="Nhập mô tả thủ công hoặc bấm nút AI để tạo bài giới thiệu sản phẩm."
            minHeight={320}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-5">
        <label className="flex flex-col gap-2">
          Giá gốc ({process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "đ"})
          <input type="number" name="mrp" onChange={onChangeHandler} value={productInfo.mrp} placeholder="0" className="w-full max-w-45 rounded border border-slate-200 p-2 px-4 outline-none" required />
        </label>
        <label className="flex flex-col gap-2">
          Giá bán ({process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "đ"})
          <input type="number" name="price" onChange={onChangeHandler} value={productInfo.price} placeholder="0" className="w-full max-w-45 rounded border border-slate-200 p-2 px-4 outline-none" required />
        </label>
        <label className="flex flex-col gap-2">
          Số lượng tồn kho
          <input type="number" min="0" name="inStock" onChange={onChangeHandler} value={productInfo.inStock} placeholder="0" className="w-full max-w-45 rounded border border-slate-200 p-2 px-4 outline-none" required />
        </label>
      </div>

      <label className="my-6 flex flex-col gap-2">
        Xuất xứ
        <input
          type="text"
          name="origin"
          onChange={onChangeHandler}
          value={productInfo.origin}
          placeholder="Ví dụ: Bến Tre, Đồng Tháp, An Giang..."
          className="w-full max-w-sm rounded border border-slate-200 p-2 px-4 outline-none"
          required
        />
      </label>

      <label className="my-6 flex flex-col gap-2">
        Cơ sở sản xuất
        <select
          name="productionFacilityId"
          onChange={onChangeHandler}
          value={productInfo.productionFacilityId}
          className="w-full max-w-2xl rounded border border-slate-200 p-2 px-4 outline-none"
          required
        >
          <option value="">Chọn cơ sở sản xuất</option>
          {productionFacilities.map((facility) => (
            <option key={facility.id} value={facility.id}>
              {facility.name}
            </option>
          ))}
        </select>
        {productionFacilities.length === 0 && (
          <p className="text-sm text-amber-600">Chưa có cơ sở sản xuất nào trong hệ thống để chọn.</p>
        )}
      </label>

      <label className="my-6 flex flex-col gap-2">
        Số sao OCOP: <span className="font-medium text-slate-800">{productInfo.ocopStars}</span>
        <input
          type="range"
          name="ocopStars"
          min="0"
          max="5"
          step="1"
          value={productInfo.ocopStars}
          onChange={onChangeHandler}
          className="w-full max-w-2xl accent-emerald-600"
        />
        <div className="flex w-full max-w-2xl justify-between text-xs text-slate-400">
          <span>0 sao</span>
          <span>5 sao</span>
        </div>
      </label>

      <label className="my-6 flex flex-col gap-2">
        Giấy chứng nhận
        <textarea
          name="certification"
          onChange={onChangeHandler}
          value={productInfo.certification}
          placeholder="Nhập thông tin giấy chứng nhận, tiêu chuẩn, kiểm định..."
          rows={3}
          className="w-full max-w-2xl rounded border border-slate-200 p-2 px-4 outline-none resize-none"
          required
        />
      </label>

      <label className="my-6 flex flex-col gap-2">
        Danh mục sản phẩm
        <select onChange={(e) => setProductInfo({ ...productInfo, category: e.target.value })} value={productInfo.category} className="w-full max-w-sm rounded border border-slate-200 p-2 px-4 outline-none" required>
          <option value="">Chọn danh mục</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </label>

      <button disabled={loading} className="mt-7 rounded bg-slate-800 px-6 py-2 text-white transition hover:bg-slate-900">
        Thêm sản phẩm
      </button>
    </form>
  );
}
