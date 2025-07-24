import React, { useMemo, useCallback } from "react";
import { useCartStore } from "../Store/cartStore";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const { cartItems, totalItems, removeFromCart, decreaseQuantity, addToCart, clearCart } = useCartStore();
  const navigate = useNavigate();

  const totalPrice = useMemo(
    () =>
      cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems]
  );

  const handleImageError = useCallback((e) => {
    e.target.onerror = null;
    e.target.src = `https://placehold.co/64x64/cccccc/333333?text=No+Image`;
  }, []);

  return (
    // Main container: min-h-screen to ensure it takes full height.
    // Use `py-8` for reduced top/bottom padding.
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8 font-inter flex flex-col">
      <div className="max-w-screen-xl mx-auto flex flex-col gap-8 flex-grow">
        <h1 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white mb-4 sm:mb-6">
          Your Shopping Cart ({totalItems} {totalItems === 1 ? 'Item' : 'Items'})
        </h1>

        {cartItems.length === 0 ? (
          // Empty Cart State
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl shadow-xl px-4 text-center">
            <svg
              className="w-24 h-24 text-gray-400 dark:text-gray-600 mb-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.769.746 1.769H19a2 2 0 002-2v-3.293m-7.707 3.707l-2.293 2.293c-.63.63-.184 1.769.746 1.769H19a2 2 0 002-2v-3.293m-7.707 3.707L17 10"
              />
            </svg>
            <p className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Your cart is feeling a bit light...
            </p>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-md">
              Looks like you haven't added anything yet. Explore our products and fill it up!
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-8 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 font-semibold text-lg"
            >
              Start Shopping!
            </button>
          </div>
        ) : (
          // Cart Items Display - Main flex container for items and summary
          <div className="flex flex-col lg:flex-row gap-8 flex-grow lg:items-start">
            {/* Left Section: Cart Items List */}
            <div className="w-full lg:w-2/3 flex flex-col">
              {/* Scrollable Cart Items List */}
              <div className="flex-grow space-y-4 pr-2 overflow-y-auto max-h-[calc(100vh - 280px)] lg:max-h-[calc(100vh - 200px)]">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-center justify-between bg-white p-5 rounded-2xl shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto mb-4 sm:mb-0 text-left">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-20 h-20 object-contain rounded-lg border border-gray-300 dark:border-gray-600 p-1 flex-shrink-0"
                        onError={handleImageError}
                      />
                      <div className="flex-grow">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {item.title}
                        </h3>
                        <p className="text-base font-bold text-blue-600 dark:text-blue-400">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 flex-shrink-0">
                      {/* Decrease Quantity Button */}
                      <button
                        onClick={() => decreaseQuantity(item.id)}
                        className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 w-7 h-7 flex items-center justify-center rounded-full text-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="font-semibold text-lg text-gray-800 dark:text-gray-200 w-8 text-center">
                        {item.quantity}
                      </span>
                      {/* Increase Quantity Button */}
                      <button
                        onClick={() => addToCart(item)}
                        className="bg-blue-500 dark:bg-blue-600 text-white w-7 h-7 flex items-center justify-center rounded-full text-xl font-bold hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                      {/* Remove Item Button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors ml-4 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-400"
                        title="Remove item from cart"
                        aria-label="Remove item"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {/* Clear Cart Button below the cart items list */}
              <div className="mt-4 text-left">
                <button
                  onClick={clearCart}
                  className="inline-flex items-center text-blue-600 hover:underline hover:bg-blue-50 dark:hover:bg-blue-900 dark:text-blue-400 font-semibold text-base py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Clear Cart
                </button>
              </div>
            </div>

            {/* Right Section: Order Summary */}
            <div className="w-full lg:w-1/3 bg-white rounded-2xl shadow-md p-6 border border-gray-200 dark:border-gray-700 flex-shrink-0">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-5 border-b border-gray-200 dark:border-gray-700 pb-4">
                Order Summary
              </h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-700 dark:text-gray-300 text-lg sm:text-base">
                  <span>Subtotal ({totalItems} items):</span>
                  <span className="font-semibold">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700 dark:text-gray-300 text-lg sm:text-base">
                  <span>Shipping:</span>
                  <span className="font-semibold">${5.00.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-2xl font-bold text-gray-900 dark:text-white pt-4 border-t border-gray-200 dark:border-gray-700 sm:text-xl">
                  <span>Total:</span>
                  <span>${(totalPrice + 5).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <button
                  onClick={() => navigate("/checkout")}
                  className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-full w-full hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 text-lg shadow-lg"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(CartPage);

