// src/store/cartStore.js
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export const useCartStore = create(
  devtools( // Enables Redux DevTools for easier debugging
    persist( // Persists the store state to localStorage
      (set, get) => ({
        cartItems: [],
        totalItems: 0, // New state to track total number of items (sum of quantities)

        addToCart: (product) =>
          set((state) => {
            const existingItemIndex = state.cartItems.findIndex(
              (item) => item.id === product.id
            );

            let updatedCartItems;
            let newTotalItems = state.totalItems + 1;

            if (existingItemIndex > -1) {
              // Item exists, increment quantity
              updatedCartItems = state.cartItems.map((item, index) =>
                index === existingItemIndex
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              );
            } else {
              // Item does not exist, add new with quantity 1
              updatedCartItems = [...state.cartItems, { ...product, quantity: 1 }];
            }

            return {
              cartItems: updatedCartItems,
              totalItems: newTotalItems,
            };
          }),

        removeFromCart: (id) =>
          set((state) => {
            const itemToRemove = state.cartItems.find((item) => item.id === id);
            if (!itemToRemove) return state; // Should not happen, but a safeguard

            const updatedCartItems = state.cartItems.filter((item) => item.id !== id);
            return {
              cartItems: updatedCartItems,
              totalItems: state.totalItems - itemToRemove.quantity, // Subtract the full quantity of the removed item
            };
          }),

        // New action: Decrease quantity of an item
        decreaseQuantity: (id) =>
          set((state) => {
            const existingItemIndex = state.cartItems.findIndex(
              (item) => item.id === id
            );

            if (existingItemIndex === -1) return state; // Item not found

            const itemToUpdate = state.cartItems[existingItemIndex];

            if (itemToUpdate.quantity > 1) {
              // Decrease quantity if greater than 1
              const updatedCartItems = state.cartItems.map((item, index) =>
                index === existingItemIndex
                  ? { ...item, quantity: item.quantity - 1 }
                  : item
              );
              return {
                cartItems: updatedCartItems,
                totalItems: state.totalItems - 1,
              };
            } else {
              // If quantity is 1, remove the item from the cart
              const updatedCartItems = state.cartItems.filter((item) => item.id !== id);
              return {
                cartItems: updatedCartItems,
                totalItems: state.totalItems - 1,
              };
            }
          }),

        // Existing updateQuantity (can be used for direct quantity setting if needed, but increase/decrease are more common)
        updateQuantity: (id, quantity) =>
          set((state) => {
            const oldQuantity = state.cartItems.find(item => item.id === id)?.quantity || 0;
            const quantityDifference = quantity - oldQuantity;

            return {
              cartItems: state.cartItems.map((item) =>
                item.id === id ? { ...item, quantity } : item
              ),
              totalItems: state.totalItems + quantityDifference,
            };
          }),

        clearCart: () => set({ cartItems: [], totalItems: 0 }),
      }),
      {
        name: "cart-storage", // Name for the localStorage key
        getStorage: () => localStorage, // (Optional) default is localStorage
      }
    )
  )
);