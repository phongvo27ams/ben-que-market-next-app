import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

let debounceTimer = null;

const normalizeCartData = (cart) => {
  if (cart && typeof cart === "object" && !Array.isArray(cart) && cart.items) {
    const normalizedComboIds = Array.isArray(cart.comboProductIds)
      ? cart.comboProductIds
      : cart.comboProductId
      ? [cart.comboProductId]
      : [];
    return {
      cartItems: cart.items || {},
      comboProductIds: normalizedComboIds,
      comboLinks: cart.comboLinks || {},
    };
  }

  return {
    cartItems: cart || {},
    comboProductIds: [],
    comboLinks: {},
  };
};

export const uploadCart = createAsyncThunk("cart/uploadCart",
  async ({ getToken }, thunkAPI) => {
    try {
      if (debounceTimer) clearTimeout(debounceTimer);

      // Debounce the upload to avoid excessive calls
      debounceTimer = setTimeout(async () => {
        const { cartItems, comboProductIds, comboLinks } = thunkAPI.getState().cart;
        const token = await getToken();
        await axios.post("/api/cart",
          { cart: { items: cartItems, comboProductIds, comboLinks } },
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
    comboProductIds: [],
    comboLinks: {},
  },

  reducers: {
    replaceCartFromOrder: (state, action) => {
      const nextItems = action.payload?.items || {};
      state.cartItems = nextItems;
      state.comboProductIds = [];
      state.comboLinks = {};
      state.total = Object.values(nextItems).reduce((acc, qty) => acc + Number(qty || 0), 0);
    },

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
          state.comboProductIds = state.comboProductIds.filter((id) => id !== productId);
          delete state.comboLinks[productId];
        }
      }
      state.total -= 1;
    },

    setCartItemQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const nextQty = Number(quantity);

      const prevQty = Number(state.cartItems[productId] || 0);
      const safeQty = Number.isNaN(nextQty) ? prevQty : Math.max(0, Math.floor(nextQty));

      if (safeQty <= 0) {
        if (prevQty > 0) {
          state.total -= prevQty;
        }
        delete state.cartItems[productId];
        state.comboProductIds = state.comboProductIds.filter((id) => id !== productId);
        delete state.comboLinks[productId];
        return;
      }

      state.cartItems[productId] = safeQty;
      state.total += safeQty - prevQty;
    },

    deleteItemFromCart: (state, action) => {
      const { productId } = action.payload;
      console.log("[CART][deleteItemFromCart] before", {
        productId,
        cartItems: state.cartItems,
        comboProductIds: state.comboProductIds,
        comboLinks: state.comboLinks,
      });
      state.total -= state.cartItems[productId] ? state.cartItems[productId] : 0;

      const linkedComboIds = Object.keys(state.comboLinks).filter((comboId) => state.comboLinks[comboId] === productId);
      for (const comboId of linkedComboIds) {
        // Keep combo item in cart, but remove its combo benefit when base product is deleted.
        delete state.comboLinks[comboId];
        state.comboProductIds = state.comboProductIds.filter((id) => id !== comboId);
      }

      delete state.cartItems[productId];
      state.comboProductIds = state.comboProductIds.filter((id) => id !== productId);
      delete state.comboLinks[productId];
      console.log("[CART][deleteItemFromCart] after", {
        productId,
        cartItems: state.cartItems,
        comboProductIds: state.comboProductIds,
        comboLinks: state.comboLinks,
      });
    },

    clearCart: (state) => {
      state.cartItems = {};
      state.total = 0;
      state.comboProductIds = [];
      state.comboLinks = {};
    },

    setComboProduct: (state, action) => {
      const { productId, baseProductId } = action.payload;
      if (!state.comboProductIds.includes(action.payload.productId)) {
        state.comboProductIds.push(productId);
      }
      if (baseProductId) state.comboLinks[productId] = baseProductId;
    },

    clearComboProduct: (state, action) => {
      if (!action.payload?.productId) {
        state.comboProductIds = [];
        state.comboLinks = {};
      } else {
        state.comboProductIds = state.comboProductIds.filter((id) => id !== action.payload.productId);
        delete state.comboLinks[action.payload.productId];
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.fulfilled, (state, action) => {
        const { cartItems, comboProductIds, comboLinks } = normalizeCartData({
          items: action.payload.cart,
          comboProductIds: action.payload.comboProductIds,
          comboProductId: action.payload.comboProductId,
          comboLinks: action.payload.comboLinks,
        });
        state.cartItems = cartItems;
        state.comboProductIds = comboProductIds;
        state.comboLinks = comboLinks || {};
        state.total = Object.values(state.cartItems).reduce((acc, qty) => acc + qty, 0);
      })
  }
})

export const { replaceCartFromOrder, addToCart, removeFromCart, setCartItemQuantity, clearCart, deleteItemFromCart, setComboProduct, clearComboProduct } = cartSlice.actions;

export default cartSlice.reducer;
