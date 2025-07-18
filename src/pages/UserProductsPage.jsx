import React, { useEffect, useState } from "react";
import {
  getAllProducts,
  deleteProduct,
  updateProduct,
} from "../services/productService";
import {
  Edit2, // For Edit button
  Trash2, // For Delete button
  Save, // For Save button
  XCircle, // For Cancel button
  ListFilter, // For Page Title
  UploadCloud, // For Image Upload
  Image as ImageIcon, // For image placeholder when no image is available
  CheckCircle, // For success dialog icon
  AlertCircle, // For confirmation/warning icon
} from "lucide-react"; // Importing icons

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/Dialog"; // Importing shadcn Dialog components

const categories = [
  "electronics",
  "jewelery",
  "men's clothing",
  "women's clothing",
];

const UserProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null); // Stores the ID of the product being edited
  const [editedData, setEditedData] = useState({}); // Stores data for the product being edited
  const [loading, setLoading] = useState(true); // Loading state for initial fetch
  const [error, setError] = useState(null); // Error state for messages
  const [showUpdateSuccessPopup, setShowUpdateSuccessPopup] = useState(false); // State for shadcn update success dialog
  const [showDeleteConfirmPopup, setShowDeleteConfirmPopup] = useState(false); // State for shadcn delete confirmation dialog
  const [productToDeleteId, setProductToDeleteId] = useState(null); // Stores the ID of the product to be deleted
  const [showDeleteSuccessPopup, setShowDeleteSuccessPopup] = useState(false); // State for shadcn delete success dialog


  // --- Fetch Products on Mount ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllProducts();
        const parsedProducts = data.map((p) => ({
          ...p,
          price: parseFloat(p.price), // Important: parse price to float
        }));
        setProducts(parsedProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // --- Handlers ---
  const handleDeleteClick = (id) => {
    setProductToDeleteId(id);
    setShowDeleteConfirmPopup(true); // Open the delete confirmation dialog
  };

  const handleDeleteConfirm = async () => {
    setShowDeleteConfirmPopup(false); // Close the confirmation dialog
    if (!productToDeleteId) return;

    try {
      setLoading(true);
      setError(null);
      await deleteProduct(productToDeleteId);
      const updated = await getAllProducts();
      const parsedUpdated = updated.map((p) => ({
        ...p,
        price: parseFloat(p.price),
      }));
      setProducts(parsedUpdated);
      setShowDeleteSuccessPopup(true); // Show delete success dialog

      setTimeout(() => {
        setShowDeleteSuccessPopup(false);
      }, 3000);

    } catch (err) {
      console.error("Error deleting product:", err);
      setError("Failed to delete product. Please try again.");
    } finally {
      setLoading(false);
      setProductToDeleteId(null); // Clear the product ID after deletion attempt
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product.id);
    setEditedData({ ...product, price: String(product.price || "") });
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setError(null);
    if (!file) {
      // If user cancels file selection, revert to previous image or null
      setEditedData((prev) => ({
        ...prev,
        image: products.find(p => p.id === editingProduct)?.image || null
      }));
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!validTypes.includes(file.type)) {
      setError("Only JPEG, PNG, or WEBP images are allowed.");
      setEditedData((prev) => ({
        ...prev,
        image: products.find(p => p.id === editingProduct)?.image || null
      })); // Keep existing image or set null
      return;
    }

    if (file.size > maxSize) {
      setError("Image size should be under 2MB.");
      setEditedData((prev) => ({
        ...prev,
        image: products.find(p => p.id === editingProduct)?.image || null
      })); // Keep existing image or set null
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditedData((prev) => ({ ...prev, image: reader.result })); // Store base64
    };
    reader.readAsDataURL(file);
  };

  const handleUpdate = async () => {
    const { id, title, price, description, category, image } = editedData;

    if (!title || !price || !description || !category || !image) {
      setError("All fields are required, including an image.");
      return;
    }
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setError("Price must be a valid positive number.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const productToUpdate = {
        ...editedData,
        price: parsedPrice, // Ensure price is a number for the update
      };
      await updateProduct(productToUpdate);
      const updated = await getAllProducts();
      const parsedUpdated = updated.map((p) => ({
        ...p,
        price: parseFloat(p.price),
      }));
      setProducts(parsedUpdated);
      setEditingProduct(null);
      setShowUpdateSuccessPopup(true); // Show shadcn success dialog

      // Automatically close modal after 3 seconds
      setTimeout(() => {
        setShowUpdateSuccessPopup(false);
      }, 3000);

    } catch (err) {
      console.error("Error updating product:", err);
      setError("Failed to update product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setError(null); // Clear errors on cancel
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-2 font-inter">
      {/* Page Title */}
      <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-10 text-left flex items-center space-x-3"> {/* Changed to text-left */}
        <ListFilter size={36} className="text-blue-600 dark:text-blue-400" />
        <span>Your Added Products</span>
      </h2>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-xl text-gray-600 dark:text-gray-300">Loading products...</p>
        </div>
      )}

      {/* Error Message */}
      {error && !loading && (
        <div
          className="bg-red-100 dark:bg-red-800 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded relative mb-6 text-left" // Added text-left
          role="alert"
        >
          <strong className="font-bold">Oops!</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}

      {/* No Products Found */}
      {!loading && !error && products.length === 0 && (
        <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl shadow-md">
          <p className="text-xl text-gray-500 dark:text-gray-400 mb-4 text-left">You haven't added any products yet.</p> {/* Added text-left */}
          <p className="text-md text-gray-600 dark:text-gray-300 text-left">Start by adding your first product!</p> {/* Added text-left */}
          <button
            onClick={() => (window.location.href = "/add-product")}
            className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Add Product Now
          </button>
        </div>
      )}

      {/* Products Grid */}
      {!loading && !error && products.length > 0 && (
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 dark:border-gray-700"
            >
              {editingProduct === product.id ? (
                // --- Edit Mode ---
                <div className="p-5 space-y-4 text-left"> {/* Added text-left */}
                  {/* Image Upload Area for Edit Mode */}
                  <div
                    className="relative w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-lg
                               flex flex-col items-center justify-center cursor-pointer overflow-hidden
                               border-2 border-dashed border-gray-300 dark:border-gray-600 group"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      aria-label="Upload new product image"
                    />
                    {editedData.image ? (
                      <>
                        <img
                          src={editedData.image}
                          alt="Image Preview"
                          className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center text-sm font-medium">
                          <UploadCloud size={24} className="mr-2" /> Click or drag to change image
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center space-y-2 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        <ImageIcon size={48} className="transition-transform duration-200 group-hover:scale-110" />
                        <p className="text-sm font-medium">No image selected. Click to upload.</p>
                      </div>
                    )}
                  </div>

                  {/* Input Fields for Edit */}
                  <input
                    type="text"
                    name="title"
                    value={editedData.title || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm
                               bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Product Title"
                  />
                  <input
                    type="number"
                    name="price"
                    value={editedData.price || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm
                               bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Price"
                    min="0"
                    step="0.01"
                  />
                  <select
                    name="category"
                    value={editedData.category || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm
                               bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 appearance-none cursor-pointer
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="capitalize">
                        {cat.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </option>
                    ))}
                  </select>
                  <textarea
                    name="description"
                    value={editedData.description || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm
                               bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-y
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Description"
                  ></textarea>

                  {/* Action Buttons for Edit Mode */}
                  <div className="flex justify-end space-x-3 mt-4">
                    <button
                      onClick={handleUpdate}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg shadow-md
                                 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50
                                 transition-colors text-sm"
                      disabled={loading}
                    >
                      <Save size={18} className="mr-2" /> Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="inline-flex items-center px-4 py-2 bg-gray-500 text-white font-medium rounded-lg shadow-md
                                 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50
                                 transition-colors text-sm"
                      disabled={loading}
                    >
                      <XCircle size={18} className="mr-2" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // --- Display Mode ---
                <div className="p-5 flex flex-col h-full text-left"> {/* Added text-left */}
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-48 object-contain rounded-lg mb-4 flex-shrink-0"
                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/200x200/cccccc/333333?text=No+Image`; }} // Placeholder for broken images
                  />
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2" title={product.title}>
                      {product.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                      {product.description}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-blue-600 dark:text-blue-400 text-lg font-bold">
                      ${typeof product.price === "number" ? product.price.toFixed(2) : "N/A"}
                    </span>
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize">
                      {product.category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                  </div>
                  <div className="flex justify-between mt-4 space-x-3">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-yellow-400 rounded-lg text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors text-sm font-medium"
                      title="Edit Product"
                    >
                      <Edit2 size={16} className="mr-2" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(product.id)} // Changed to open shadcn dialog
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-red-400 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors text-sm font-medium"
                      title="Delete Product"
                    >
                      <Trash2 size={16} className="mr-2" /> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Shadcn Success Dialog for Product Update */}
      <Dialog open={showUpdateSuccessPopup} onOpenChange={setShowUpdateSuccessPopup}>
        <DialogContent className="sm:max-w-[425px] font-inter">
          <DialogHeader className="text-left"> {/* Changed to text-left */}
            <CheckCircle size={60} className="text-green-500 mx-auto mb-4 animate-bounce" />
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">Product Updated Successfully!</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300 text-base">
              Your product details have been updated.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setShowUpdateSuccessPopup(false)}
              className="bg-blue-600 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md
                         hover:bg-blue-700 transition duration-300"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Shadcn Dialog for Delete Confirmation */}
      <Dialog open={showDeleteConfirmPopup} onOpenChange={setShowDeleteConfirmPopup}>
        <DialogContent className="sm:max-w-[425px] font-inter">
          <DialogHeader className="text-left"> {/* Changed to text-left */}
            <AlertCircle size={60} className="text-red-500 mx-auto mb-4" />
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300 text-base">
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center space-x-4 mt-4">
            <button
              onClick={handleDeleteConfirm}
              className="bg-red-600 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md
                         hover:bg-red-700 transition duration-300"
            >
              Delete
            </button>
            <button
              onClick={() => setShowDeleteConfirmPopup(false)}
              className="bg-gray-300 text-gray-800 font-semibold py-2.5 px-6 rounded-lg shadow-md
                         hover:bg-gray-400 transition duration-300"
            >
              Cancel
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Shadcn Dialog for Delete Success */}
      <Dialog open={showDeleteSuccessPopup} onOpenChange={setShowDeleteSuccessPopup}>
        <DialogContent className="sm:max-w-[425px] font-inter">
          <DialogHeader className="text-left"> {/* Changed to text-left */}
            <CheckCircle size={60} className="text-green-500 mx-auto mb-4 animate-bounce" />
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">Product Deleted Successfully!</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300 text-base">
              The product has been removed from your list.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setShowDeleteSuccessPopup(false)}
              className="bg-blue-600 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md
                         hover:bg-blue-700 transition duration-300"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserProductsPage;
