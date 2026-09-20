import { create } from "zustand";
import {
  cartService,
  type Cart,
  
} from "@/features/cart/services/cartService";
import { useAuthStore } from "./useAuthStore";

type CartItem = {
  id: string; // cartItemId from backend
  _id: string; // menuItemId (for compatibility)
  name: string;
  price: number;
  image: string;
  quantity: number;
  restaurantId?: string;
};

type CartState = {
  cart: CartItem[];
  restaurantId: string | null;
  subtotal: number;
  isLoading: boolean;
  error: string | null;
  promoCode: string | null;
  setPromoCode: (code: string | null) => void;
  loadCart: (token: string) => Promise<void>;
  addToCart: (
    item: Omit<CartItem, "quantity" | "id">,
    restaurantId?: string,
    token?: string
  ) => Promise<void>;
  removeFromCart: (cartItemId: string, token?: string) => Promise<void>;
  increaseQuantity: (cartItemId: string, token?: string) => Promise<void>;
  decreaseQuantity: (cartItemId: string, token?: string) => Promise<void>;
  clearCart: (token?: string) => Promise<void>;
  setRestaurant: (restaurantId: string) => void;
  syncCartFromBackend: (backendCart: Cart) => void;
};

const mapBackendCartToLocal = (backendCart: Cart): CartItem[] => {
  if (!backendCart.items || backendCart.items.length === 0) {
    return [];
  }

  return backendCart.items.map((item) => ({
    id: item.id,
    _id: item.menuItemId, // For compatibility with existing code
    name: item.menuItemName,
    price: item.price,
    image: item.imageUrl,
    quantity: item.quantity,
    restaurantId: backendCart.restaurantId,
  }));
};

export const useCartStore = create<CartState>((set, get) => ({
  cart: [],
  restaurantId: null,
  subtotal: 0,
  isLoading: false,
  error: null,
  promoCode: null,

  setPromoCode: (code: string | null) => set({ promoCode: code }),

  syncCartFromBackend: (backendCart: Cart) => {
    const items = mapBackendCartToLocal(backendCart);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    set({
      cart: items,
      restaurantId: backendCart.restaurantId || null,
      subtotal,
    });
  },

  loadCart: async (token: string) => {
    try {
      set({ isLoading: true, error: null });
      const backendCart = await cartService.getCart(token);
      get().syncCartFromBackend(backendCart);
    } catch (err: any) {
      set({ error: err.message || "Failed to load cart" });
      // If cart doesn't exist, that's okay - just set empty cart
      set({ cart: [], restaurantId: null, subtotal: 0 });
    } finally {
      set({ isLoading: false });
    }
  },

  setRestaurant: (restaurantId: string) => {
    const currentRestaurantId = get().restaurantId;
    // If switching restaurants, clear cart
    if (currentRestaurantId && currentRestaurantId !== restaurantId) {
      set({ cart: [], subtotal: 0, restaurantId });
    } else {
      set({ restaurantId });
    }
  },

  addToCart: async (item, restaurantId, token) => {
    try {
      set({ isLoading: true, error: null });

      const authToken = token ?? useAuthStore.getState().token;
      const targetRestaurantId = restaurantId ?? get().restaurantId;

      if (!authToken) {
        const message = "You must be logged in to add items to the cart.";
        set({ error: message, isLoading: false });
        throw new Error(message);
      }

      if (!targetRestaurantId) {
        const message = "Select a restaurant before adding items to the cart.";
        set({ error: message, isLoading: false });
        throw new Error(message);
      }

      const backendCart = await cartService.addItem(
        {
          restaurantId: targetRestaurantId,
          menuItemId: item._id,
          quantity: 1,
        },
        authToken
      );

      get().syncCartFromBackend(backendCart);
    } catch (err: any) {
      set({ error: err.message || "Failed to add item to cart" });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  removeFromCart: async (cartItemId: string, token) => {
    try {
      set({ isLoading: true, error: null });
      const authToken = token ?? useAuthStore.getState().token;
      if (!authToken) {
        const message = "You must be logged in to update the cart.";
        set({ error: message, isLoading: false });
        throw new Error(message);
      }
      const backendCart = await cartService.removeItem(cartItemId, authToken);
      get().syncCartFromBackend(backendCart);
    } catch (err: any) {
      set({ error: err.message || "Failed to remove item from cart" });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  increaseQuantity: async (cartItemId: string, token) => {
    try {
      set({ isLoading: true, error: null });
      const currentItem = get().cart.find((i) => i.id === cartItemId);
      if (!currentItem) return;

      const authToken = token ?? useAuthStore.getState().token;
      if (!authToken) {
        const message = "You must be logged in to update the cart.";
        set({ error: message, isLoading: false });
        throw new Error(message);
      }

      const backendCart = await cartService.updateQuantity(
        cartItemId,
        {
          quantity: currentItem.quantity + 1,
        },
        authToken
      );

      get().syncCartFromBackend(backendCart);
    } catch (err: any) {
      set({ error: err.message || "Failed to update quantity" });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  decreaseQuantity: async (cartItemId: string, token) => {
    try {
      set({ isLoading: true, error: null });
      const currentItem = get().cart.find((i) => i.id === cartItemId);
      if (!currentItem || currentItem.quantity <= 1) {
        // If quantity is 1, remove item instead
        await get().removeFromCart(cartItemId, token);
        return;
      }

      const authToken = token ?? useAuthStore.getState().token;
      if (!authToken) {
        const message = "You must be logged in to update the cart.";
        set({ error: message, isLoading: false });
        throw new Error(message);
      }

      const backendCart = await cartService.updateQuantity(
        cartItemId,
        {
          quantity: currentItem.quantity - 1,
        },
        authToken
      );

      get().syncCartFromBackend(backendCart);
    } catch (err: any) {
      set({ error: err.message || "Failed to update quantity" });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  clearCart: async (token) => {
    try {
      set({ isLoading: true, error: null });
      const authToken = token ?? useAuthStore.getState().token;
      if (!authToken) {
        const message = "You must be logged in to update the cart.";
        set({ error: message, isLoading: false });
        throw new Error(message);
      }
      await cartService.clearCart(authToken);
      set({ cart: [], subtotal: 0, restaurantId: null, promoCode: null });
    } catch (err: any) {
      set({ error: err.message || "Failed to clear cart" });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
}));
