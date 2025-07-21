// src/store/cartStore.js
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export const useCartStore = create(
  devtools( // Enables Redux DevTools for easier debugging
    persist( // Persists the store state to localStorage
      (set, get) => ({
        cartItems: [],
        totalItems: 0,
        totalPrice: 0, // <--- ADDED: Initialize totalPrice here

        // Helper function to calculate total price and total items
        // This makes the update logic DRY (Don't Repeat Yourself)
        _updateTotals: () => {
          const currentCartItems = get().cartItems;
          let newTotalItems = 0;
          let newTotalPrice = 0;

          currentCartItems.forEach(item => {
            // Defensive checks for price and quantity
            const price = typeof item.price === 'number' ? item.price : 0;
            const quantity = typeof item.quantity === 'number' ? item.quantity : 0;

            newTotalItems += quantity;
            newTotalPrice += (price * quantity);
          });

          set({ totalItems: newTotalItems, totalPrice: newTotalPrice });
        },

        addToCart: (product) => {
          set((state) => {
            const existingItemIndex = state.cartItems.findIndex(
              (item) => item.id === product.id
            );

            let updatedCartItems;

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

            // Return the updated cartItems. Totals will be updated by _updateTotals after set.
            return { cartItems: updatedCartItems };
          });
          get()._updateTotals(); // <--- CALL: Update totals after cartItems change
        },

        removeFromCart: (id) => {
          set((state) => {
            const updatedCartItems = state.cartItems.filter((item) => item.id !== id);
            // Return the updated cartItems. Totals will be updated by _updateTotals after set.
            return { cartItems: updatedCartItems };
          });
          get()._updateTotals(); // <--- CALL: Update totals after cartItems change
        },

        decreaseQuantity: (id) => {
          set((state) => {
            const existingItemIndex = state.cartItems.findIndex(
              (item) => item.id === id
            );

            if (existingItemIndex === -1) return state; // Item not found

            const itemToUpdate = state.cartItems[existingItemIndex];
            let updatedCartItems;

            if (itemToUpdate.quantity > 1) {
              // Decrease quantity if greater than 1
              updatedCartItems = state.cartItems.map((item, index) =>
                index === existingItemIndex
                  ? { ...item, quantity: item.quantity - 1 }
                  : item
              );
            } else {
              // If quantity is 1, remove the item from the cart
              updatedCartItems = state.cartItems.filter((item) => item.id !== id);
            }

            // Return the updated cartItems. Totals will be updated by _updateTotals after set.
            return { cartItems: updatedCartItems };
          });
          get()._updateTotals(); // <--- CALL: Update totals after cartItems change
        },

        updateQuantity: (id, quantity) => {
          set((state) => {
            const updatedCartItems = state.cartItems.map((item) =>
              item.id === id ? { ...item, quantity } : item
            );
            // Return the updated cartItems. Totals will be updated by _updateTotals after set.
            return { cartItems: updatedCartItems };
          });
          get()._updateTotals(); // <--- CALL: Update totals after cartItems change
        },

        clearCart: () => {
          set({ cartItems: [], totalItems: 0, totalPrice: 0 }); // <--- RESET: Reset totalPrice too
        },
      }),
      {
        name: "cart-storage", // Name for the localStorage key
        getStorage: () => localStorage, // (Optional) default is localStorage
      }
    )
  )
);