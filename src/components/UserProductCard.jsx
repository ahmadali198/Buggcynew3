// src/components/UserProductCard.jsx
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

const UserProductCard = ({ product, onEdit, onDelete }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <img
        src={product.image}
        alt={product.title}
        className="w-full h-48 object-contain p-4 bg-gray-100 dark:bg-gray-800"
      />
      <div className="p-4 space-y-2">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white line-clamp-2">{product.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center mt-3">
          <span className="text-green-600 dark:text-green-400 font-bold text-md">${product.price}</span>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(product)}
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition"
              title="Edit"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={() => onDelete(product.id)}
              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition"
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProductCard;
