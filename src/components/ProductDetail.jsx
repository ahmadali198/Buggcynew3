import React from "react";

const ProductDetail = ({ product }) => {
  if (!product) return <p className="text-center text-gray-500">Loading...</p>;

  return (
    <div className="flex flex-col lg:flex-row gap-10 bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md">
      <div className="flex-1 flex justify-center items-center">
        <img
          src={product.image}
          alt={product.title}
          className="w-60 h-60 object-contain"
        />
      </div>
      <div className="flex-1 space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {product.title}
        </h2>
        <p className="text-gray-700 dark:text-gray-300">{product.description}</p>
        <p className="text-lg font-bold text-blue-600">${product.price}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Category: {product.category}
        </p>
      </div>
    </div>
  );
};

export default ProductDetail;
