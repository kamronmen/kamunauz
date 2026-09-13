import { create } from "zustand";
import { Product, CartItem } from "@/types";
import { sound } from "@/lib/sound";

interface CartState {
  cart: CartItem[];
  addItem: (product: Product, qty?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
  getTotalItemsCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: [],

  addItem: (product: Product, qty = 1) => {
    const { cart } = get();
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);

    if (existingIndex > -1) {
      const existing = cart[existingIndex];
      const newQty = existing.quantity + qty;
      if (newQty > product.stockQuantity) {
        sound.playError();
        return;
      }
      const updated = [...cart];
      updated[existingIndex] = {
        ...existing,
        quantity: newQty,
        subtotal: newQty * product.sellingPrice,
      };
      set({ cart: updated });
    } else {
      if (product.stockQuantity < qty) {
        sound.playError();
        return;
      }
      set({
        cart: [
          ...cart,
          {
            product,
            quantity: qty,
            subtotal: qty * product.sellingPrice,
          },
        ],
      });
    }
    sound.playBeep();
  },

  updateQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }

    const { cart } = get();
    const updated = cart.map((item) => {
      if (item.product.id === productId) {
        if (quantity > item.product.stockQuantity) {
          sound.playError();
          return item;
        }
        return {
          ...item,
          quantity,
          subtotal: quantity * item.product.sellingPrice,
        };
      }
      return item;
    });

    set({ cart: updated });
  },

  removeItem: (productId: string) => {
    set({ cart: get().cart.filter((item) => item.product.id !== productId) });
  },

  clearCart: () => {
    set({ cart: [] });
  },

  getTotalAmount: () => {
    return get().cart.reduce((sum, item) => sum + item.subtotal, 0);
  },

  getTotalItemsCount: () => {
    return get().cart.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
