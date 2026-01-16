// src/store/useCustomerCartStore.ts
import { create } from 'zustand';
import type { MenuItem } from '../types/menu';

interface CartItem extends MenuItem {
  quantity: number;
}

interface CartStore {
  cart: CartItem[];
  addToCart: (item: MenuItem, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  cartTotal: () => number;
}

export const useCustomerCartStore = create<CartStore>((set, get) => ({
  cart: [],
  addToCart: (item, quantity = 1) => {
    const exists = get().cart.find(i => i.id === item.id);
    if (exists) {
      set({
        cart: get().cart.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
        )
      });
    } else {
      set({ cart: [...get().cart, { ...item, quantity }] });
    }
  },
  removeFromCart: (id) => set({ cart: get().cart.filter(i => i.id !== id) }),
  updateQuantity: (id, delta) => {
    set({
      cart: get().cart.map(i =>
        i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i
      )
    });
  },
  clearCart: () => set({ cart: [] }),
  cartTotal: () => get().cart.reduce((acc, i) => acc + i.price * i.quantity, 0),
}));
