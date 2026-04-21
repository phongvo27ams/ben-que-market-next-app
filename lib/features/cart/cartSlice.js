import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

let debounceTimer = null;

const normalizeCartData = (cart) => {
  if (cart && typeof cart === "object" && !Array.isArray(cart) && cart.items) {
    return {
      cartItems: cart.items || {},
      comboProductId: cart.comboProductId || null,
    };
  }

  return {
    cartItems: cart || {},
    comboProductId: null,
  };
};

export const uploadCart = createAsyncThunk("cart/uploadCart",
  async ({ getToken }, thunkAPI) => {
    try {
      if (debounceTimer) clearTimeout(debounceTimer);

      // Debounce the upload to avoid excessive calls
      debounceTimer = setTimeout(async () => {
        const { cartItems, comboProductId } = thunkAPI.getState().cart;
        const token = await getToken();
        await axios.post("/api/cart",
          { cart: { items: cartItems, comboProductId } },
          {
            headers:
              { Authorization: `Bearer ${token}` },
          }
        );
      }, 1000);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
)

export const fetchCart = createAsyncThunk("cart/fetchCart",
  async ({ getToken }, thunkAPI) => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
)

const cartSlice = createSlice({
  name: "cart",

  initialState: {
    total: 0,
    cartItems: {},
    comboProductId: null,
  },

  reducers: {
    addToCart: (state, action) => {
      const { productId } = action.payload;
      if (state.cartItems[productId]) {
        state.cartItems[productId]++;
      } else {
        state.cartItems[productId] = 1;
      }
      state.total += 1;
    },

    removeFromCart: (state, action) => {
      const { productId } = action.payload;
      if (state.cartItems[productId]) {
        state.cartItems[productId]--;
        if (state.cartItems[productId] === 0) {
          delete state.cartItems[productId];
          if (state.comboProductId === productId) {
            state.comboProductId = null;
          }
        }
      }
      state.total -= 1;
    },

    deleteItemFromCart: (state, action) => {
      const { productId } = action.payload;
      state.total -= state.cartItems[productId] ? state.cartItems[productId] : 0;
      delete state.cartItems[productId];
      if (state.comboProductId === productId) {
        state.comboProductId = null;
      }
    },

    clearCart: (state) => {
      state.cartItems = {};
      state.total = 0;
      state.comboProductId = null;
    },

    setComboProduct: (state, action) => {
      state.comboProductId = action.payload.productId;
    },

    clearComboProduct: (state, action) => {
      if (!action.payload?.productId || state.comboProductId === action.payload.productId) {
        state.comboProductId = null;
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.fulfilled, (state, action) => {
        const { cartItems, comboProductId } = normalizeCartData({
          items: action.payload.cart,
          comboProductId: action.payload.comboProductId,
        });
        state.cartItems = cartItems;
        state.comboProductId = comboProductId;
        state.total = Object.values(state.cartItems).reduce((acc, qty) => acc + qty, 0);
      })
  }
})

export const { addToCart, removeFromCart, clearCart, deleteItemFromCart, setComboProduct, clearComboProduct } = cartSlice.actions;

export default cartSlice.reducer;
