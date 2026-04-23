"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  shoeId: string;
  variantId: string;
  name: string;
  price: number;
  quantity: number;
  size?: number;
  color?: string;
  image?: string;
  availableStock: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: CartItem) => { ok: boolean; message?: string };
  removeItem: (variantId: string) => void;
  updateQty: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: () => number;
  // Visual feedback states
  justAddedItems: string[];
  setJustAdded: (variantIds: string[]) => void;
  clearJustAdded: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      addItem: (item) => {
        if (item.availableStock <= 0) return { ok: false, message: "Out of stock" };
        const existing = get().items.find((i) => i.variantId === item.variantId);
        if (existing) {
          const nextQty = existing.quantity + item.quantity;
          if (nextQty > item.availableStock) return { ok: false, message: "Not enough stock" };
          set({
            items: get().items.map((i) =>
              i.variantId === item.variantId ? { ...i, quantity: nextQty, availableStock: item.availableStock } : i,
            ),
            isOpen: true,
          });
          return { ok: true };
        }

        set({ 
          items: [...get().items, item], 
          isOpen: true,
          justAddedItems: [...get().justAddedItems, item.variantId]
        });
        return { ok: true };
      },
      removeItem: (variantId) => set({ items: get().items.filter((i) => i.variantId !== variantId) }),
      updateQty: (variantId, quantity) =>
        set({
          items: get().items.map((i) =>
            i.variantId === variantId ? { ...i, quantity: Math.max(1, Math.min(quantity, i.availableStock)) } : i,
          ),
        }),
      clearCart: () => set({ items: [], justAddedItems: [] }),
      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      // Visual feedback states
      justAddedItems: [],
      setJustAdded: (variantIds) => set({ justAddedItems: variantIds }),
      clearJustAdded: () => set({ justAddedItems: [] }),
    }),
    { name: "lokus-cart" },
  ),
);
