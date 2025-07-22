import React from "react";
import { useCartStore } from "../Store/cartStore";

const Cart = () => {
  const { cartItems, removeFromCart } = useCartStore();

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (cartItems.length === 0) {
    return <p className="text-center text-gray-500">Your cart is empty.</p>;
  }

  return (
    <div className="space-y-6">
      {cartItems.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-4 p-4 bg-white  rounded-xl shadow"
        >
          <img
            src={item.image}
            alt={item.title}
            className="w-16 h-16 object-contain"
          />
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800 dark:text-gray-100">
              {item.title}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Quantity: {item.quantity}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Price: ${item.price}
            </p>
          </div>
          <button
            onClick={() => removeFromCart(item.id)}
            className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg"
          >
            Remove
          </button>
        </div>
      ))}
      <div className="text-right font-bold text-lg text-blue-600">
        Total: ${total.toFixed(2)}
      </div>
    </div>
  );
};

export default Cart;
