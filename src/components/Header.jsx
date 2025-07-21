import React from "react";
import { Link } from "react-router-dom";
import DarkToggle from "./DarkToggle";
import { useCartStore } from "../Store/cartStore";

const Header = () => {
  const cartItems = useCartStore((state) => state.cartItems);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md py-4 px-6 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-white">
        ShopZone
      </Link>

      <nav className="flex items-center gap-6 text-gray-700 dark:text-gray-100">
        <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400">
          Home
        </Link>
        <Link to="/add-product" className="hover:text-blue-600 dark:hover:text-blue-400">
          Add Product
        </Link>
        <Link to="/user-products" className="hover:text-blue-600 dark:hover:text-blue-400">
          My Products
        </Link>
        <Link to="/cart" className="relative hover:text-blue-600 dark:hover:text-blue-400">
          Cart
          {cartItems.length > 0 && (
            <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold rounded-full px-1">
              {cartItems.length}
            </span>
          )}
        </Link>
        <DarkToggle />
      </nav>
    </header>
  );
};

export default Header;
