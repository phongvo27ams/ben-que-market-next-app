"use client";

import { useState } from "react";
import { Star, XIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import { useDispatch } from "react-redux";
import axios from "axios";

import { addRating } from "../lib/features/rating/ratingSlice";

const RatingModal = ({ ratingModal, setRatingModal }) => {
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const readonly = Boolean(ratingModal.readonly);

  const [rating, setRating] = useState(ratingModal.rating || 0);
  const [review, setReview] = useState(ratingModal.review || "");

  const handleSubmit = async () => {
    if (rating <= 0 || rating > 5) {
      return toast("Vui lòng chọn số sao đánh giá");
    }
    if (review.length < 5) {
      return toast("Vui lòng viết đánh giá ngắn");
    }

    try {
      const token = await getToken();
      const { data } = await axios.post('/api/rating', {
        productId: ratingModal.productId,
        orderId: ratingModal.orderId,
        rating,
        review,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch(addRating(data.rating));
      toast.success("Đã gửi đánh giá thành công");
      setRatingModal(null);
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error(error?.response?.data?.error || error.message);
    }
  }

  return (
    <div className="fixed inset-0 z-120 flex items-center justify-center bg-black/10">
      <div className="relative w-96 rounded-lg bg-white p-8 shadow-lg">
        <button onClick={() => setRatingModal(null)} className="absolute right-3 top-3 text-gray-500 hover:text-gray-700">
          <XIcon size={20} />
        </button>

        <h2 className="mb-4 text-xl font-medium text-slate-600">
          {readonly ? "Xem đánh giá" : "Đánh giá sản phẩm"}
        </h2>

        <div className="mb-4 flex items-center justify-center">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={`size-8 ${readonly ? "cursor-default" : "cursor-pointer"} ${rating > i ? "fill-current text-green-400" : "text-gray-300"}`}
              onClick={() => !readonly && setRating(i + 1)}
            />
          ))}
        </div>

        <textarea
          className="mb-4 w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          placeholder="Viết đánh giá của bạn..."
          rows="4"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          readOnly={readonly}
        />

        {readonly ? (
          <button onClick={() => setRatingModal(null)} className="w-full rounded-md bg-slate-700 py-2 text-white transition hover:bg-slate-800">
            Đóng
          </button>
        ) : (
          <button onClick={() => toast.promise(handleSubmit(), { loading: "Đang gửi..." })} className="w-full rounded-md bg-green-500 py-2 text-white transition hover:bg-green-600">
            Gửi đánh giá
          </button>
        )}
      </div>
    </div>
  );
}

export default RatingModal;
