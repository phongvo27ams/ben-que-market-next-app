import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

let debounceTimer = null;

export const uploadWishlist = createAsyncThunk(
  "wishlist/uploadWishlist",
  async ({ getToken }, thunkAPI) => {
    try {
      if (debounceTimer) clearTimeout(debounceTimer);

      debounceTimer = setTimeout(async () => {
        const { items } = thunkAPI.getState().wishlist;
        const token = await getToken();
        await axios.post(
          "/api/wishlist",
          { wishlist: items },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }, 500);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async ({ getToken }, thunkAPI) => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data.wishlist || [];
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: [],
  },
  reducers: {
    toggleWishlistItem: (state, action) => {
      const { productId } = action.payload;
      const exists = state.items.includes(productId);
      state.items = exists
        ? state.items.filter((id) => id !== productId)
        : [...state.items, productId];
    },
    clearWishlist: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchWishlist.fulfilled, (state, action) => {
      state.items = action.payload;
    });
  },
});

export const { toggleWishlistItem, clearWishlist } = wishlistSlice.actions;

export default wishlistSlice.reducer;
