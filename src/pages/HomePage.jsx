// pages/HomePage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getAllProducts, deleteProduct, updateProduct, createProduct as addLocalProduct } from '../services/productService';
import { fetchProducts as fetchFakeStoreProducts } from '../services/fakeStoreService'; // Removed fetchProductsByCategory as it's not needed for client-side filtering
import ProductList from '../components/ProductList';
import CategoryFilter from '../components/CategoryFilter';
import Carousel from '../components/Carousel';
import { useCartStore } from '../Store/cartStore';

import {
  CheckCircle,
  AlertCircle,
  PlusCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "../components/Dialog";

const categories = [
  "electronics",
  "jewelery",
  "men's clothing",
  "women's clothing",
];

const HomePage = () => {
  const [category, setCategory] = useState('');
  // allProductsData will hold the full list of products fetched initially
  const [allProductsData, setAllProductsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Only for initial page load

  const [error, setError] = useState(null);

  // States for editing
  const [editingProduct, setEditingProduct] = useState(null);
  const [editedData, setEditedData] = useState({}); // Corrected useState initialization

  // States for dialogs
  const [showUpdateSuccessPopup, setShowUpdateSuccessPopup] = useState(false);
  const [showDeleteConfirmPopup, setShowDeleteConfirmPopup] = useState(false);
  const [productToDeleteId, setProductToDeleteId] = useState(null);
  const [showDeleteSuccessPopup, setShowDeleteSuccessPopup] = useState(false);
  const [showAddProductPopup, setShowAddProductPopup] = useState(false);
  const [showAddSuccessPopup, setShowAddSuccessPopup] = useState(false);

  // NEW STATE for the inline Add Product Form
  const [newProductData, setNewProductData] = useState({
    title: '',
    price: '',
    description: '',
    category: '',
    image: '',
    error: null,
  });

  const addToCart = useCartStore((state) => state.addToCart);

  const [refreshTrigger, setRefreshTrigger] = useState(0); // Used to trigger re-fetch of all data after CUD operations

  const generateRandomRating = useCallback(() => {
    const rate = parseFloat(((Math.random() * 4) + 1).toFixed(1));
    const count = Math.floor(Math.random() * 500) + 50;
    return { rate, count };
  }, []);

  // This function now fetches ALL products (local + fake store) once on initial load or CUD operations
  const fetchAllInitialProducts = useCallback(async () => {
    setIsLoading(true); // Show loading spinner only for this initial/full re-fetch
    setError(null);

    try {
      const localProductsRaw = await getAllProducts();
      const localProducts = localProductsRaw.map(product => ({
        ...product,
        price: parseFloat(product.price),
        isLocal: true,
        rating: product.rating || generateRandomRating(),
      }));

      // Fetch ALL FakeStore products once
      const fakeStoreProductsRaw = await fetchFakeStoreProducts();
      const fakeStoreProducts = fakeStoreProductsRaw.map(product => ({
        ...product,
        price: parseFloat(product.price),
        isLocal: false,
      }));

      // Combine and deduplicate products, prioritizing local products
      const uniqueProductsMap = new Map();
      localProducts.forEach(product => {
        uniqueProductsMap.set(product.id, product);
      });
      fakeStoreProducts.forEach(product => {
        if (!uniqueProductsMap.has(product.id)) {
          uniqueProductsMap.set(product.id, {
            ...product,
            isLocal: false,
          });
        }
      });

      let combinedProducts = Array.from(uniqueProductsMap.values());

      // Sort local products to appear first
      combinedProducts.sort((a, b) => {
        if (a.isLocal && !b.isLocal) {
          return -1;
        }
        if (!a.isLocal && b.isLocal) {
          return 1;
        }
        return 0;
      });

      setAllProductsData(combinedProducts); // Set the full, combined list of products
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("❌ Failed to load products. Please try again later.");
    } finally {
      setIsLoading(false); // Hide loading spinner after fetch completes
    }
  }, [generateRandomRating]);

  // Effect to run the initial product fetch
  useEffect(() => {
    fetchAllInitialProducts();
  }, [refreshTrigger, fetchAllInitialProducts]); // refreshTrigger will re-fetch all data after CUD operations

  // Use useMemo to filter products instantly based on the selected category
  const filteredProducts = useMemo(() => {
    if (!category) {
      return allProductsData; // If no category selected, show all products
    }
    return allProductsData.filter(
      product => product.category && product.category.toLowerCase() === category.toLowerCase()
    );
  }, [category, allProductsData]); // Re-filter only when category or the full product list changes

  const handleCategoryChange = useCallback((selectedCategory) => {
    setCategory(selectedCategory); // This will trigger the useMemo for filteredProducts instantly
  }, []);

  const handleEditProduct = useCallback((product) => {
    setEditingProduct(product.id);
    setEditedData({
      ...product,
      price: String(product.price || ""),
      category: product.category || ""
    });
    setError(null);
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    setError(null);
    if (!file) {
      setEditedData((prev) => ({
        ...prev,
        image: allProductsData.find(p => p.id === editingProduct)?.image || null // Use allProductsData here
      }));
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 2 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      setError("Only JPEG, PNG, or WEBP images are allowed.");
      setEditedData((prev) => ({
        ...prev,
        image: allProductsData.find(p => p.id === editingProduct)?.image || null
      }));
      return;
    }

    if (file.size > maxSize) {
      setError("Image size should be under 2MB.");
      setEditedData((prev) => ({
        ...prev,
        image: allProductsData.find(p => p.id === editingProduct)?.image || null
      }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditedData(prev => ({ ...prev, image: reader.result }));
      setError(null);
    };
    reader.readAsDataURL(file);
  }, [allProductsData, editingProduct]); // Dependency on allProductsData

  const handleUpdateProduct = useCallback(async () => {
    const { id, title, price, description, category, image } = editedData;

    if (!title || price === undefined || price === null || price === "" || !description || !category || !image) {
      setError("All fields are required.");
      return false;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setError("Price must be a valid positive number.");
      return false;
    }

    try {
      // Do NOT set isLoading(true) here to avoid spinner on CUD operations
      setError(null);

      const updatedProduct = {
        ...editedData,
        price: parsedPrice,
      };

      const originalProduct = allProductsData.find(p => p.id === id); // Use allProductsData

      if (originalProduct?.isLocal) {
        await updateProduct(updatedProduct);
        setRefreshTrigger(prev => prev + 1); // Trigger re-fetch of all products in background
      } else {
        console.warn(`Simulating update for FakeStore product ID: ${id}. Changes will not persist on API.`);
      }

      // Optimistic update for immediate UI feedback
      setAllProductsData(prev =>
        prev.map(p => p.id === id ? updatedProduct : p)
      );

      setEditingProduct(null);
      setEditedData({});
      setShowUpdateSuccessPopup(true);
      setTimeout(() => setShowUpdateSuccessPopup(false), 3000);

      return true;
    } catch (err) {
      console.error("Update error:", err);
      setError("Failed to update product.");
      return false;
    }
    // Do NOT set isLoading(false) here
  }, [editedData, allProductsData, setAllProductsData, setEditingProduct, setEditedData, setShowUpdateSuccessPopup, setRefreshTrigger]);

  const handleCancelEdit = useCallback(() => {
    setEditingProduct(null);
    setEditedData({});
    setError(null);
  }, []);

  const handleDeleteClick = useCallback((id) => {
    setProductToDeleteId(id);
    setShowDeleteConfirmPopup(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    setShowDeleteConfirmPopup(false);
    if (!productToDeleteId) return;

    try {
      // Do NOT set isLoading(true) here
      setError(null);

      const productInfo = allProductsData.find(p => p.id === productToDeleteId); // Use allProductsData

      // Optimistic update for immediate UI feedback
      setAllProductsData(prevProducts =>
        prevProducts.filter(p => p.id !== productToDeleteId)
      );

      if (productInfo?.isLocal) {
        await deleteProduct(productToDeleteId);
        setRefreshTrigger(prev => prev + 1); // Trigger re-fetch of all products in background
      } else {
        console.warn(`Simulating deletion for FakeStore product ID: ${productToDeleteId}. Changes will not persist on API.`);
      }

      setShowDeleteSuccessPopup(true);
      setTimeout(() => {
        setShowDeleteSuccessPopup(false);
      }, 3000);

    } catch (err) {
      console.error("Error deleting product:", err);
      setError("Failed to delete product. Please try again.");
    }
    // Do NOT set isLoading(false) here
  }, [productToDeleteId, allProductsData, setAllProductsData, setShowDeleteSuccessPopup, setRefreshTrigger]);

  // Handle opening the Add Product dialog
  const handleAddProductClick = useCallback(() => {
    setNewProductData({
      title: '',
      price: '',
      description: '',
      category: '',
      image: '',
      error: null,
    }); // Reset form data
    setShowAddProductPopup(true);
  }, []);

  // Handle changes in the new product form fields
  const handleNewProductChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewProductData(prev => ({ ...prev, [name]: value, error: null }));
  }, []);

  // Handle image upload for new product
  const handleNewProductImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    setNewProductData(prev => ({ ...prev, error: null })); // Clear previous error

    if (!file) {
      setNewProductData(prev => ({ ...prev, image: '' }));
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!validTypes.includes(file.type)) {
      setNewProductData(prev => ({ ...prev, error: "Only JPEG, PNG, or WEBP images are allowed.", image: '' }));
      return;
    }

    if (file.size > maxSize) {
      setNewProductData(prev => ({ ...prev, error: "Image size should be under 2MB.", image: '' }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewProductData(prev => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  }, []);


  // Handle adding a new product (submission of the inline form)
  const handleAddProduct = useCallback(async (e) => {
    e.preventDefault(); // Prevent default form submission

    const { title, price, description, category, image } = newProductData;

    if (!title || price === undefined || price === null || price === "" || !description || !category || !image) {
      setNewProductData(prev => ({ ...prev, error: "All fields are required." }));
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setNewProductData(prev => ({ ...prev, error: "Price must be a valid positive number." }));
      return;
    }

    try {
      // Do NOT set isLoading(true) here
      setNewProductData(prev => ({ ...prev, error: null }));

      const productWithMeta = {
        ...newProductData,
        price: parsedPrice,
        id: Date.now(), // Generate a unique ID for local products
        isLocal: true,
        rating: generateRandomRating(),
      };

      await addLocalProduct(productWithMeta); // Use your productService to add

      setAllProductsData(prev => [productWithMeta, ...prev]); // Update the full list optimistically
      setShowAddProductPopup(false);
      setShowAddSuccessPopup(true);
      setTimeout(() => setShowAddSuccessPopup(false), 3000);
      setRefreshTrigger(prev => prev + 1); // Trigger re-fetch of all products in background
    } catch (err) {
      console.error("Add product error:", err);
      setNewProductData(prev => ({ ...prev, error: "Failed to add product." }));
    }
    // Do NOT set isLoading(false) here
  }, [newProductData, generateRandomRating, setAllProductsData, setShowAddProductPopup, setShowAddSuccessPopup, setRefreshTrigger]);


  if (error) {
    return (
      <div className="text-red-600 dark:text-red-400 text-center mt-10 font-inter">
        {error}
      </div>
    );
  }

  // Only show initial loading spinner if data is not yet loaded
  if (isLoading && allProductsData.length === 0) {
    return (
      <div className="text-center mt-10 text-gray-500 dark:text-gray-400 font-inter">
        Loading products...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-10 font-inter">
      <Carousel />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <CategoryFilter
          onSelect={handleCategoryChange}
          selectedCategory={category}
        />
        <button
          onClick={handleAddProductClick}
          className="bg-blue-600 text-white font-semibold py-2.5 px-2 rounded-lg shadow-md
                      hover:bg-blue-700 transition duration-300 flex items-center space-x-2
                      w-full sm:w-auto justify-center"
        >
          <PlusCircle size={20} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Products */}
      <div id="products-section" className="mt-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4 text-left">
          {category
            ? `${category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}`
            : 'All Products'}
        </h2>

        {filteredProducts.length > 0 ? (
          <ProductList
            products={filteredProducts}
            onEdit={handleEditProduct}
            onDelete={handleDeleteClick}
            editingProduct={editingProduct}
            editedData={editedData}
            handleChange={handleChange}
            handleImageUpload={handleImageUpload}
            handleUpdate={handleUpdateProduct}
            handleCancelEdit={handleCancelEdit}
            categories={categories}
            onAddToCart={addToCart}
          />
        ) : (
          <div className="text-center text-gray-600 dark:text-gray-400 mt-8">
            No products found in this category.
          </div>
        )}
      </div>

      {/* Shadcn Success Dialog for Product Update */}
      <Dialog open={showUpdateSuccessPopup} onOpenChange={setShowUpdateSuccessPopup}>
        <DialogContent className="sm:max-w-[425px] font-inter max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="text-center">
            <CheckCircle size={60} className="text-green-500 mx-auto mb-4 animate-bounce" />
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">Product Updated Successfully!</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300 text-base">
              Your product details have been updated.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Shadcn Dialog for Delete Confirmation */}
      <Dialog open={showDeleteConfirmPopup} onOpenChange={setShowDeleteConfirmPopup}>
        <DialogContent className="sm:max-w-[425px] font-inter max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="text-center">
            <AlertCircle size={60} className="text-red-500 mx-auto mb-4" />
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300 text-base">
              Are you sure you want to delete this product?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={() => setShowDeleteConfirmPopup(false)}
              className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg shadow-md hover:bg-gray-400 transition duration-300"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="bg-red-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-red-700 transition duration-300"
            >
              Delete
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Shadcn Dialog for Delete Success */}
      <Dialog open={showDeleteSuccessPopup} onOpenChange={setShowDeleteSuccessPopup}>
        <DialogContent className="sm:max-w-[425px] font-inter max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="text-center">
            <CheckCircle size={60} className="text-green-500 mx-auto mb-4 animate-bounce" />
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">Product Deleted Successfully!</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300 text-base">
              The product has been removed from your list.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Shadcn Dialog for Adding New Product (Inline Form) */}
      <Dialog open={showAddProductPopup} onOpenChange={setShowAddProductPopup}>
        <DialogContent className="w-[95%] sm:max-w-[500px] font-inter max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl pt-0 font-bold text-gray-900 dark:text-white">Add New Product</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleAddProduct}>
            {newProductData.error && (
              <div className="text-red-600 text-sm text-center bg-red-100 p-2 rounded-md">
                {newProductData.error}
              </div>
            )}
            <div>
              <label htmlFor="new-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
              <input
                type="text"
                id="new-title"
                name="title"
                value={newProductData.title}
                onChange={handleNewProductChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="new-price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price</label>
              <input
                type="number"
                id="new-price"
                name="price"
                value={newProductData.price}
                onChange={handleNewProductChange}
                step="0.01"
                min="0"
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="new-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <textarea
                id="new-description"
                name="description"
                value={newProductData.description}
                onChange={handleNewProductChange}
                rows="3"
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              ></textarea>
            </div>
            <div>
              <label htmlFor="new-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
              <select
                id="new-category"
                name="category"
                value={newProductData.category}
                onChange={handleNewProductChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="new-image" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product Image</label>
              <input
                type="file"
                id="new-image"
                name="image"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleNewProductImageUpload}
                className="mt-1 block w-full text-sm text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4
                           file:rounded-md file:border-0 file:text-sm file:font-semibold
                           file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
              />
              {newProductData.image && (
                <div className="mt-2">
                  <img src={newProductData.image} alt="Product Preview" className="h-24 w-24 object-contain rounded-md border border-gray-200 dark:border-gray-600" />
                </div>
              )}
            </div>
            <DialogFooter className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => setShowAddProductPopup(false)}
                className="bg-gray-300 text-gray-800 font-semibold py-2.5 px-6 rounded-lg shadow-md
                           hover:bg-gray-400 transition duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md
                           hover:bg-blue-700 transition duration-300"
              >
                Add Product
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Product Success Dialog */}
      <Dialog open={showAddSuccessPopup} onOpenChange={setShowAddSuccessPopup}>
        <DialogContent className="sm:max-w-[425px] font-inter max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="text-center">
            <CheckCircle size={60} className="text-green-500 mx-auto mb-4 animate-bounce" />
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">Product Added Successfully!</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300 text-base">
              Your new product has been added to the list.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomePage;
