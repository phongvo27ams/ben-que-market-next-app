'use client'

import { useEffect, useState } from "react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { DeleteIcon } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";

export default function AdminCoupons() {
  const { getToken } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    description: "",
    discount: "",
    forNewUser: false,
    forMember: false,
    isPublic: false,
    expiresAt: new Date(),
  });

  const fetchCoupons = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/admin/coupon", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoupons(data.coupons);
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    }
  };

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    try {
      const token = await getToken();
      const payload = {
        ...newCoupon,
        discount: Number(newCoupon.discount),
        expiresAt: new Date(newCoupon.expiresAt),
      };
      const { data } = await axios.post("/api/admin/coupon", { coupon: payload }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(data.message);
      await fetchCoupons();
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    }
  };

  const deleteCoupon = async (code) => {
    const confirmed = window.confirm("Bạn có chắc muốn xóa mã giảm giá này?");
    if (!confirmed) return;
    try {
      const token = await getToken();
      await axios.delete(`/api/admin/coupon?code=${code}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchCoupons();
      toast.success("Đã xóa mã giảm giá thành công");
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  return (
    <div className="mb-40 text-slate-500">
      <form onSubmit={(e) => toast.promise(handleAddCoupon(e), { loading: "Đang thêm mã giảm giá..." })} className="max-w-sm text-sm">
        <h2 className="text-2xl">Thêm <span className="font-medium text-slate-800">Mã giảm giá</span></h2>
        <div className="mt-2 flex gap-2 max-sm:flex-col">
          <input type="text" placeholder="Mã giảm giá" className="mt-2 w-full rounded-md border border-slate-200 p-2 outline-slate-400" name="code" value={newCoupon.code} onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })} required />
          <input type="number" placeholder="Mức giảm (%)" min={1} max={100} className="mt-2 w-full rounded-md border border-slate-200 p-2 outline-slate-400" name="discount" value={newCoupon.discount} onChange={(e) => setNewCoupon({ ...newCoupon, discount: e.target.value })} required />
        </div>
        <input type="text" placeholder="Mô tả mã giảm giá" className="mt-2 w-full rounded-md border border-slate-200 p-2 outline-slate-400" name="description" value={newCoupon.description} onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })} required />
        <label>
          <p className="mt-3">Ngày hết hạn</p>
          <input type="date" className="mt-1 w-full rounded-md border border-slate-200 p-2 outline-slate-400" name="expiresAt" value={format(newCoupon.expiresAt, "yyyy-MM-dd")} onChange={(e) => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })} />
        </label>
        <div className="mt-5">
          <label className="mt-3 flex gap-2">
            <input type="checkbox" checked={newCoupon.forNewUser} onChange={(e) => setNewCoupon({ ...newCoupon, forNewUser: e.target.checked })} />
            <span>Dành cho người dùng mới</span>
          </label>
          <label className="mt-3 flex gap-2">
            <input type="checkbox" checked={newCoupon.forMember} onChange={(e) => setNewCoupon({ ...newCoupon, forMember: e.target.checked })} />
            <span>Dành cho thành viên Plus</span>
          </label>
        </div>
        <button className="mt-4 rounded bg-slate-700 p-2 px-10 text-white transition active:scale-95">Thêm mã</button>
      </form>

      <div className="mt-14 w-full">
        <h2 className="text-2xl">Danh sách <span className="font-medium text-slate-800">Mã giảm giá</span></h2>
        <div className="mt-4 w-full overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Mã</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Mô tả</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Giảm giá</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Hết hạn</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Người dùng mới</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Thành viên Plus</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {coupons.map((coupon) => (
                <tr key={coupon.code} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{coupon.code}</td>
                  <td className="px-4 py-3 text-slate-800">{coupon.description}</td>
                  <td className="px-4 py-3 text-slate-800">{coupon.discount}%</td>
                  <td className="px-4 py-3 text-slate-800">{format(coupon.expiresAt, "yyyy-MM-dd")}</td>
                  <td className="px-4 py-3 text-slate-800">{coupon.forNewUser ? "Có" : "Không"}</td>
                  <td className="px-4 py-3 text-slate-800">{coupon.forMember ? "Có" : "Không"}</td>
                  <td className="px-4 py-3 text-slate-800">
                    <DeleteIcon onClick={() => toast.promise(deleteCoupon(coupon.code), { loading: "Đang xóa mã..." })} className="h-5 w-5 cursor-pointer text-red-500 hover:text-red-800" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
