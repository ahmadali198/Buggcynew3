import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import useSWR from "swr";
import axios from "axios";
import { useCartStore } from "../store/cartStore"; // Assuming this path is correct

// A reusable fetcher function for SWR
const fetcher = (url) => axios.get(url).then((res) => res.data);

const ProductDetailPage = () => {
  const { id } = useParams(); // Get product ID from the URL
  const navigate = useNavigate(); // For programmatic navigation
  const { addToCart } = useCartStore(); // Access addToCart from your Zustand store

  // Helper function to render star ratings (copied from ProductCard for consistency)
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating); // Get the integer part for full stars
    const hasHalfStar = rating % 1 >= 0.5; // Check if there's a half star

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={`full-${i}`} className="text-yellow-500">
          ★
        </span>
      );
    }

    // Add half star if applicable
    if (hasHalfStar) {
      stars.push(
        <span key="half" className="text-yellow-500 relative">
          {/* Using a full star and overlaying a background to simulate half */}
          ★
          <span className="absolute top-0 left-0 w-1/2 overflow-hidden text-gray-300 dark:text-gray-600">
            ★
          </span>
        </span>
      );
    }

    // Add empty stars to complete 5 stars
    const remainingStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-gray-300 dark:text-gray-600">
          ★
        </span>
      );
    }
    return stars;
  };

  // Fetch product data using SWR
  const { data: product, error, isLoading } = useSWR(
    `https://fakestoreapi.com/products/${id}`,
    fetcher
  );

  // Handle adding product to cart and navigating
  const handleAddToCart = () => {
    if (product) { // Ensure product data is loaded before adding
      addToCart(product);
      navigate("/CartPage"); // Navigate to the cart page (ensure this route exists)
    }
  };

  // --- Loading and Error States ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-inter">
        <div className="flex flex-col items-center space-y-4">
          <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900 text-red-600 dark:text-red-400 font-inter">
        <p className="text-xl font-medium">
          <span role="img" aria-label="error">❌</span> Failed to load product details. Please try again.
        </p>
      </div>
    );
  }

  if (!product) { // This case should ideally be caught by isLoading, but as a fallback
      return (
        <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-inter">
          <p className="text-lg">Product not found.</p>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center font-inter">
      <div className="max-w-5xl w-full bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden p-8 flex flex-col md:flex-row gap-10 items-start transform transition-all duration-300 hover:scale-[1.005]">
        {/* Product Image Section */}
        <div className="md:w-1/2 w-full flex justify-center items-center bg-gray-100 dark:bg-gray-700 rounded-xl p-6 shadow-inner">
          <img
            src={product.image}
            alt={product.title}
            className="max-w-full h-96 object-contain mix-blend-multiply dark:mix-blend-normal transform transition-transform duration-300 hover:scale-105"
            onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x400/cccccc/333333?text=No+Image`; }} // Placeholder for broken images
          />
        </div>

        {/* Product Details Section */}
        <div className="md:w-1/2 w-full space-y-6 text-gray-800 dark:text-gray-200 text-left">
          <h1 className="text-3xl font-bold leading-tight text-gray-900 dark:text-white">
            {product.title}
          </h1>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Category: <span className="text-blue-600 dark:text-blue-400 capitalize">{product.category}</span>
          </p>

          {/* Star Rating Display */}
          {product.rating && (
            <div className="flex items-center space-x-2 text-base text-gray-700 dark:text-gray-300">
              <div className="flex">
                {renderStars(product.rating.rate)}
              </div>
              <span>{product.rating.rate}</span>
              <span className="text-gray-500 dark:text-gray-400">({product.rating.count} reviews)</span>
            </div>
          )}

          <p className="text-xl font-semibold text-green-700 dark:text-green-400">
            ${product.price.toFixed(2)}
          </p>

          <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700 pt-4">
            {product.description}
          </p>

          <button
            onClick={handleAddToCart}
            className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:from-blue-700 hover:to-blue-900 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
