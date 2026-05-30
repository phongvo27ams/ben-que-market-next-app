'use client'
import { useEffect, useState } from "react";
import { setCartItemQuantity } from "../lib/features/cart/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";

const Counter = ({ productId, maxStock = Infinity }) => {
  const { cartItems } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  const currentQty = Number(cartItems[productId] || 1);
  const [draftQty, setDraftQty] = useState(String(currentQty));

  useEffect(() => {
    setDraftQty(String(currentQty));
  }, [currentQty]);

  const applyQuantity = (rawValue) => {
    const parsed = Number(rawValue);
    if (Number.isNaN(parsed)) {
      setDraftQty(String(currentQty));
      return;
    }

    let nextQty = Math.floor(parsed);
    if (nextQty < 1) nextQty = 1;
    if (Number.isFinite(maxStock) && nextQty > maxStock) {
      nextQty = maxStock;
      toast.error(`Chỉ còn ${maxStock} sản phẩm trong kho`);
    }

    dispatch(setCartItemQuantity({ productId, quantity: nextQty }));
    setDraftQty(String(nextQty));
  };

  return (
    <div className="inline-flex items-center justify-center rounded border border-slate-200 px-2 py-1 text-slate-600">
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={Number.isFinite(maxStock) ? maxStock : undefined}
        value={draftQty}
        onChange={(e) => setDraftQty(e.target.value)}
        onBlur={(e) => applyQuantity(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            applyQuantity(e.currentTarget.value);
            e.currentTarget.blur();
          }
        }}
        className="w-12 bg-transparent text-center text-sm outline-none"
        aria-label="Số lượng sản phẩm"
      />
    </div>
  );
};

export default Counter;
