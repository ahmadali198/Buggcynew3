import React, { useState, useEffect } from "react";
import { useCartStore } from "../store/cartStore";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import {
  ShoppingCart,
  MapPin,
  Mail,
  User,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  DollarSign // For total price icon
} from "lucide-react"; // Importing icons

const CheckoutPage = () => {
  const { cartItems, clearCart } = useCartStore();
  const [formData, setFormData] = useState({ name: "", address: "", email: "" });
  const [showPopup, setShowPopup] = useState(false);
  const [showError, setShowError] = useState(false); // State for form validation error
  const navigate = useNavigate();

  // Calculate total price
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * (item.quantity || 1),
    0
  );

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setShowError(false); // Hide error on input change
  };

  const handleOrderSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.address || !formData.email) {
      setShowError(true); // Show error for missing fields
      return;
    }

    if (cartItems.length === 0) {
      // Using a custom modal/message box instead of alert()
      // This scenario should ideally be prevented by the early exit, but as a fallback
      // For a real application, you'd show a user-friendly message here.
      console.warn("Cart is empty. Cannot place order.");
      navigate("/");
      return;
    }

    // Simulate order processing (e.g., sending data to a backend)
    console.log("Order submitted:", { formData, items: cartItems });

    clearCart(); // Clear cart after successful submission
    setShowPopup(true); // Show success modal

    // Automatically close modal and navigate after 3 seconds
    setTimeout(() => {
      setShowPopup(false);
      navigate("/");
    }, 3000);
  };

  // --- Early Exit for Empty Cart ---
  if (cartItems.length === 0 && !showPopup) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4 font-inter"> {/* Ensured font-inter */}
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 max-w-md w-full">
          <ShoppingCart size={60} className="mx-auto text-gray-400 dark:text-gray-500 mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your Cart is Empty</h2> {/* Adjusted font size */}
          <p className="mb-8 text-gray-600 dark:text-gray-300">
            It looks like you haven't added any products to your cart yet. Browse our amazing selection!
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md
                         transition duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <ArrowLeft size={20} />
            <span>Start Shopping</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4 sm:px-6 lg:px-8 font-inter"> {/* Applied font-inter */}
      <div className="container mx-auto max-w-5xl"> {/* Adjusted max-width for overall layout */}
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-left flex items-center space-x-3"> {/* Adjusted font size, weight, and text-left */}
          <CreditCard size={32} className="text-blue-600 dark:text-blue-400" /> {/* Adjusted icon size */}
          <span>Checkout</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"> {/* Adjusted gap */}
          {/* Shipping Information Section */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 text-left"> {/* Adjusted padding, added text-left */}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-5 flex items-center space-x-3"> {/* Adjusted font size, margins */}
              <MapPin size={20} className="text-purple-600 dark:text-purple-400" /> {/* Adjusted icon size */}
              <span>Shipping Information</span>
            </h3>
            <form onSubmit={handleOrderSubmit} className="space-y-4"> {/* Adjusted space-y */}
              {/* Full Name */}
              <div>
                <label htmlFor="name" className="sr-only">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} /> {/* Adjusted icon size */}
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Full Name"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm
                               bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-base
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                               transition duration-200" // Adjusted padding, font size
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className="sr-only">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} /> {/* Adjusted icon size */}
                  <input
                    type="text"
                    id="address"
                    name="address"
                    placeholder="Shipping Address"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm
                               bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-base
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                               transition duration-200" // Adjusted padding, font size
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="sr-only">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} /> {/* Adjusted icon size */}
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Email Address"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm
                               bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-base
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                               transition duration-200" // Adjusted padding, font size
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {showError && (
                <div className="bg-red-100 dark:bg-red-800 border border-red-400 text-red-700 dark:text-red-200 px-4 py-2 rounded relative text-sm" role="alert"> {/* Adjusted padding */}
                  <strong className="font-semibold">Heads up!</strong> {/* Adjusted font weight */}
                  <span className="block sm:inline ml-2">Please fill in all the required fields.</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md
                               transition duration-300 transform hover:scale-105 flex items-center justify-center space-x-3 mt-5" // Adjusted margin-top
              >
                <CreditCard size={20} /> {/* Adjusted icon size */}
                <span>Place Order (${totalPrice.toFixed(2)})</span>
              </button>
            </form>
          </div>

          {/* Order Summary Section */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col text-left"> {/* Adjusted padding, added text-left */}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-5 flex items-center space-x-3"> {/* Adjusted font size, margins */}
              <ShoppingCart size={20} className="text-indigo-600 dark:text-indigo-400" /> {/* Adjusted icon size */}
              <span>Order Summary</span>
            </h3>
            <ul className="space-y-3 flex-grow overflow-y-auto max-h-80 pr-2"> {/* Adjusted space-y, max-h */}
              {cartItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2 last:border-b-0 last:pb-0" // Adjusted padding
                >
                  <div className="flex items-center space-x-3"> {/* Adjusted space-x */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-14 h-14 object-contain rounded-md border border-gray-200 dark:border-gray-600" // Adjusted size
                      onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/56x56/cccccc/333333?text=No+Image`; }} // Placeholder
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">{item.title}</p> {/* Adjusted font size */}
                      <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p> {/* Quantity is now left-aligned */}
                    </div>
                  </div>
                  <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm"> {/* Adjusted font size */}
                    ${(item.price * (item.quantity || 1)).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-5 mt-5 flex justify-between items-center text-lg font-bold text-gray-900 dark:text-white"> {/* Decreased font size to text-lg */}
              <span className="flex items-center space-x-2">
                  <DollarSign size={20} className="text-green-600 dark:text-green-400" /> {/* Adjusted icon size */}
                  <span>Total:</span>
              </span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* 🎉 Success Modal */}
        <Modal isOpen={showPopup} onClose={() => setShowPopup(false)}>
          <div className="text-center p-6 font-inter"> {/* Applied font-inter */}
            <CheckCircle size={70} className="text-green-500 mx-auto mb-5 animate-bounce" /> {/* Adjusted icon size, margin */}
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Order Placed Successfully!</h3> {/* Adjusted font size */}
            <p className="text-base text-gray-600 dark:text-gray-300 mb-6"> {/* Adjusted font size */}
              Thank you for your order. We've received it and will start processing soon!
            </p>
            <button
              onClick={() => {
                setShowPopup(false);
                navigate("/");
              }}
              className="bg-blue-600 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md
                         hover:bg-blue-700 transition duration-300"
            >
              Close & Return Home
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default CheckoutPage;
