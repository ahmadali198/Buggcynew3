import React from 'react';
import { Link } from 'react-router-dom'; // Assuming react-router-dom is used for navigation

const ProductCard = ({ product }) => {
  // Helper function to render star ratings
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

  return (
    <Link
      to={`/product/${product.id}`}
      className="block bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl
                 transform transition-all duration-300
                 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl
                 flex flex-col h-full overflow-hidden group font-inter"
    >
      {/* Product Image */}
      <div className="flex-shrink-0 flex items-center justify-center h-48 mb-4">
        <img
          src={product.image}
          alt={product.title}
          className="h-full w-full object-contain mx-auto mix-blend-multiply dark:mix-blend-normal
                     transform transition-transform duration-300 group-hover:scale-105"
          onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/200x200/cccccc/333333?text=No+Image`; }} // Placeholder for broken images
        />
      </div>

      {/* Product Details */}
      <div className="flex-grow flex flex-col justify-between text-left">
        {/* Title */}
        <h2
          className="text-lg font-bold mb-2 line-clamp-2 text-gray-900 dark:text-white leading-tight text-left"
          title={product.title}
        >
          {product.title}
        </h2>

        
        {product.rating && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2 text-left">
            <div className="flex mr-1">
              {renderStars(product.rating.rate)} {/* Render stars dynamically */}
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">
              {product.rating.rate.toFixed(1)}
            </span>
            <span className="ml-1">({product.rating.count} reviews)</span>
          </div>
        )}

        
        <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-auto text-left">
          ${product.price.toFixed(2)}
        </p>
      </div>
    </Link>
  );
};

export default ProductCard;
