import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  variantId: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  maxQuantity?: number;
}

interface CartState {
  items: CartItem[];
  hydrated: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  setHydrated: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      hydrated: false,
      addItem: (newItem) => {
        const currentItems = get().items;
        const existingItemIndex = currentItems.findIndex(
          (item) => item.variantId === newItem.variantId
        );
        if (existingItemIndex > -1) {
          const updatedItems = [...currentItems];
          const newQty = updatedItems[existingItemIndex].quantity + newItem.quantity;
          const maxQty = updatedItems[existingItemIndex].maxQuantity ?? newItem.maxQuantity;
          updatedItems[existingItemIndex].quantity = maxQty !== undefined ? Math.min(newQty, maxQty) : newQty;
          set({ items: updatedItems });
        } else {
          const maxQty = newItem.maxQuantity;
          const qty = maxQty !== undefined ? Math.min(newItem.quantity, maxQty) : newItem.quantity;
          set({ items: [...currentItems, { ...newItem, quantity: qty }] });
        }
      },
      removeItem: (variantId) => {
        set({ items: get().items.filter((item) => item.variantId !== variantId) });
      },
      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }
        set({
          items: get().items.map((item) => {
            if (item.variantId !== variantId) return item;
            const capped = item.maxQuantity !== undefined ? Math.min(quantity, item.maxQuantity) : quantity;
            return { ...item, quantity: capped };
          }),
        });
      },
      clearCart: () => set({ items: [] }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'casa-central-cart',
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => () => {
        // Mark as hydrated after rehydration completes
        useCartStore.getState().setHydrated?.();
      },
    }
  )
);

// Derived selectors
export const getTotalPrice = (items: CartItem[]) =>
  items.reduce((total, item) => total + item.price * item.quantity, 0);

export const getTotalItems = (items: CartItem[]) =>
  items.reduce((total, item) => total + item.quantity, 0);
