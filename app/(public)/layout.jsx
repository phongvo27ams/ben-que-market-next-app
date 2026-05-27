"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useUser, useAuth } from "@clerk/nextjs";
import { fetchProducts } from "../../lib/features/product/productSlice";

import Banner from "../../components/Banner";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { fetchCart, uploadCart } from "../../lib/features/cart/cartSlice";
import { fetchAddresses } from "../../lib/features/address/addressSlice";
import { fetchUserRatings } from "../../lib/features/rating/ratingSlice";
import { fetchWishlist, uploadWishlist } from "../../lib/features/wishlist/wishlistSlice";

export default function PublicLayout({ children }) {
  const dispatch = useDispatch();
  const { user } = useUser();
  const { getToken } = useAuth();
  const { cartItems, comboProductIds } = useSelector((state) => state.cart);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  // Fetch products on initial load
  useEffect(() => {
    dispatch(fetchProducts({}));
  }, []);

  // Fetch cart data when user changes
  useEffect(() => {
    if (user) {
      dispatch(fetchCart({ getToken }));
      dispatch(fetchAddresses({ getToken }));
      dispatch(fetchUserRatings({ getToken }));
      dispatch(fetchWishlist({ getToken }));
    }
  }, [user]);

  // Upload cart data when cartItems change
  useEffect(() => {
    if (user) {
      dispatch(uploadCart({ getToken }));
    }
  }, [cartItems, comboProductIds]);

  useEffect(() => {
    if (user) {
      dispatch(uploadWishlist({ getToken }));
    }
  }, [wishlistItems]);

  return (
    <>
      <Banner />
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
