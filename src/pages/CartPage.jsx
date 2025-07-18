import React from "react";
import { useCartStore } from "../store/cartStore";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  // Destructure state and actions from the store
  const { cartItems, totalItems, removeFromCart, decreaseQuantity, addToCart, clearCart } = useCartStore();
  const navigate = useNavigate();

  // Calculate total price of items in the cart
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4 sm:px-6 lg:px-8 font-inter">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Your Shopping Cart ({totalItems} {totalItems === 1 ? 'Item' : 'Items'})
        </h1>

        {cartItems.length === 0 ? (
          // Empty Cart State
          <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg px-4">
            <svg
              className="w-20 h-20 text-gray-400 dark:text-gray-600 mb-5"
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
            <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3 text-center">
              Your cart is feeling a bit light...
            </p>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-center">
              Looks like you haven't added anything yet.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-7 py-2.5 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Start Shopping!
            </button>
          </div>
        ) : (
          // Cart Items Display
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto mb-4 sm:mb-0 text-left">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-16 object-contain rounded-lg border border-gray-200 dark:border-gray-700 p-1 flex-shrink-0"
                      onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/64x64/cccccc/333333?text=No+Image`; }} // Placeholder
                    />
                    <div className="flex-grow">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-0.5">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Category: <span className="capitalize">{item.category}</span>
                      </p>
                      <p className="text-base font-bold text-blue-600 dark:text-blue-400 mt-1">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 flex-shrink-0"> {/* Decreased space-x to space-x-1 */}
                    {/* Decrease Quantity Button */}
                    <button
                      onClick={() => decreaseQuantity(item.id)}
                      className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 w-7 h-7 flex items-center justify-center rounded-full text-base font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="font-semibold text-base text-gray-800 dark:text-gray-200 w-6 text-center">
                      {item.quantity}
                    </span>
                    {/* Increase Quantity Button */}
                    <button
                      onClick={() => addToCart(item)} // Re-use addToCart to increment
                      className="bg-blue-500 dark:bg-blue-600 text-white w-7 h-7 flex items-center justify-center rounded-full text-base font-bold hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                    {/* Remove Item Button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 transition-colors ml-3 p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-400"
                      title="Remove item from cart"
                      aria-label="Remove item"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 h-fit sticky top-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-3">
                Order Summary
              </h2>
              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-gray-700 dark:text-gray-300 text-base">
                  <span>Subtotal ({totalItems} items):</span>
                  <span className="font-semibold">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700 dark:text-gray-300 text-base">
                  <span>Shipping:</span>
                  <span className="font-semibold">$5.00</span> {/* Example fixed shipping */}
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white pt-3 border-t border-gray-200 dark:border-gray-700">
                  <span>Total:</span>
                  <span>${(totalPrice + 5).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full bg-green-600 text-white font-semibold py-2.5 rounded-full shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50"
                >
                  Proceed to Checkout
                </button>
                <button
                  onClick={clearCart}
                  className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-md focus:outline-none focus:ring-4 focus:ring-gray-400 focus:ring-opacity-50"
                >
                  Clear Cart
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;

