'use client'

import { useUser } from "@clerk/nextjs";

export default function CreateStore() {
  const { user } = useUser();

  if (!user) {
    return (
      <div className="min-h-[80vh] mx-6 flex items-center justify-center text-slate-400">
        <h1 className="text-2xl sm:text-4xl font-semibold">Please <span className="text-slate-500">login</span> to create a store.</h1>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center">
      <p className="max-w-2xl text-2xl font-semibold text-slate-700">
        Tính năng đăng ký Seller đã được tắt.
      </p>
      <p className="mt-3 max-w-2xl text-slate-500">
        Hệ thống hiện chuyển sang mô hình B2C, toàn bộ cửa hàng và vận hành sản phẩm do Admin quản lý tập trung.
      </p>
    </div>
  );
}
