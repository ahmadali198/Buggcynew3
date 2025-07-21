// components/ProductList.jsx
import React from 'react';
import ProductCard from './ProductCard';

const ProductList = ({
  products,
  onEdit,
  onDelete,
  editingProduct,
  editedData,
  handleChange,
  handleImageUpload,
  handleUpdate,
  handleCancelEdit,
  categories,
  onAddToCart // <--- IMPORTANT: This prop must be accepted here
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
          editingProduct={editingProduct}
          editedData={editedData}
          handleChange={handleChange}
          handleImageUpload={handleImageUpload}
          handleUpdate={handleUpdate}
          handleCancelEdit={handleCancelEdit}
          categories={categories}
          onAddToCart={onAddToCart} // <--- And passed down to ProductCard
        />
      ))}
    </div>
  );
};

export default ProductList;