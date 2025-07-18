import React, { createContext, useContext } from "react";
import { useCartStore } from "../store/cartStore";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const cart = useCartStore((state) => state);

  return (
    <CartContext.Provider value={cart}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
