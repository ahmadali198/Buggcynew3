import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { getAllProducts, deleteProduct, updateProduct } from '../services/productService'; // Import local product service functions
import { fetchProducts as fetchFakeStoreProducts, fetchProductsByCategory as fetchFakeStoreProductsByCategory } from '../services/fakeStoreService'; // Import FakeStoreAPI service
import ProductList from '../components/ProductList';
import CategoryFilter from '../components/CategoryFilter';
import Carousel from '../components/Carousel';
import {
  CheckCircle, // For success dialog icon
  AlertCircle, // For confirmation/warning icon
} from "lucide-react"; // Importing icons for dialogs
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/Dialog"; // Importing shadcn Dialog components

const categories = [ // Define categories here for use in the edit form
  "electronics",
  "jewelery",
  "men's clothing",
  "women's clothing",
];

const HomePage = () => {
  const [category, setCategory] = useState('');
  const [allCombinedProducts, setAllCombinedProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // States for in-line editing
  const [editingProduct, setEditingProduct] = useState(null); // Stores the ID of the product being edited
  const [editedData, setEditedData] = useState({}); // Stores data for the product being edited

  // States for dialogs
  const [showUpdateSuccessPopup, setShowUpdateSuccessPopup] = useState(false);
  const [showDeleteConfirmPopup, setShowDeleteConfirmPopup] = useState(false);
  const [productToDeleteId, setProductToDeleteId] = useState(null); // Stores the ID of the product to be deleted
  const [showDeleteSuccessPopup, setShowDeleteSuccessPopup] = useState(false);

  const [refreshTrigger, setRefreshTrigger] = useState(0); // To manually trigger re-fetch

  // Function to generate random rating for new products
  const generateRandomRating = () => {
    const rate = parseFloat(((Math.random() * 4) + 1).toFixed(1)); // Random rate between 1.0 and 5.0
    const count = Math.floor(Math.random() * 500) + 50; // Random review count between 50 and 549
    return { rate, count };
  };

  // Function to fetch all data from both sources
  const fetchAllData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch from local database and mark them as local
      const localProductsRaw = await getAllProducts();
      const localProducts = localProductsRaw.map(product => ({
        ...product,
        price: parseFloat(product.price), // Ensure price is a number
        isLocal: true, // Mark as local product
        // Assign random rating if not already present
        rating: product.rating || generateRandomRating(),
      }));

      // Fetch from FakeStoreAPI
      const fakeStoreProductsRaw = category
        ? await fetchFakeStoreProductsByCategory(category)
        : await fetchFakeStoreProducts();
      const fakeStoreProducts = fakeStoreProductsRaw.map(product => ({
        ...product,
        price: parseFloat(product.price), // Ensure price is a number
        isLocal: false, // Mark as not local
      }));

      // Combine products
      const combinedProducts = [...localProducts, ...fakeStoreProducts];

      // Deduplicate if products from FakeStore and local DB might have same IDs
      // Prioritize local products if IDs overlap
      const uniqueProductsMap = new Map();
      combinedProducts.forEach(product => {
        // Use a composite key for true uniqueness if IDs might overlap across sources
        // For simplicity, if IDs are guaranteed unique per source, product.id is fine.
        // If local products should always override fake store products with same ID:
        if (product.isLocal || !uniqueProductsMap.has(product.id)) {
            uniqueProductsMap.set(product.id, product);
        }
      });
      let finalCombinedProducts = Array.from(uniqueProductsMap.values());

      // Sort products: FakeStore products first, then local products
      finalCombinedProducts.sort((a, b) => {
        if (a.isLocal && !b.isLocal) {
          return 1; // a (local) comes after b (fake store)
        }
        if (!a.isLocal && b.isLocal) {
          return -1; // a (fake store) comes before b (local)
        }
        // If both are same type, maintain their relative order or sort by ID/title if needed
        return 0; // No change in order
      });


      setAllCombinedProducts(finalCombinedProducts);
      setFilteredProducts(finalCombinedProducts); // Initially, filtered products are all combined products
    } catch (err) {
      console.error("Failed to fetch products from one or both sources:", err);
      setError("❌ Failed to load products. Please check your connection or try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to fetch products when component mounts or category/refreshTrigger changes
  useEffect(() => {
    fetchAllData();
  }, [category, refreshTrigger]); // Re-run when category or refreshTrigger changes

  // Effect to filter products whenever category or allCombinedProducts changes
  useEffect(() => {
    if (category) {
      const filtered = allCombinedProducts.filter(
        (product) => product.category && product.category.toLowerCase() === category.toLowerCase()
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(allCombinedProducts); // Show all products if no category is selected
    }
  }, [category, allCombinedProducts]);

  const handleCategoryChange = (selectedCategory) => {
    setCategory(selectedCategory);
  };

  // --- Handlers for In-line Editing ---
  const handleEditProduct = (product) => {
    setEditingProduct(product.id);
    // Ensure price is string for input field, as input type="number" expects string
    setEditedData({ ...product, price: String(product.price || "") });
    setError(null); // Clear any previous errors
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
        image: allCombinedProducts.find(p => p.id === editingProduct)?.image || null
      }));
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!validTypes.includes(file.type)) {
      setError("Only JPEG, PNG, or WEBP images are allowed.");
      setEditedData((prev) => ({
        ...prev,
        image: allCombinedProducts.find(p => p.id === editingProduct)?.image || null
      })); // Keep existing image or set null
      return;
    }

    if (file.size > maxSize) {
      setError("Image size should be under 2MB.");
      setEditedData((prev) => ({
        ...prev,
        image: allCombinedProducts.find(p => p.id === editingProduct)?.image || null
      })); // Keep existing image or set null
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditedData((prev) => ({ ...prev, image: reader.result })); // Store base64
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProduct = async () => {
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
      setIsLoading(true); // Set loading for update operation
      setError(null);
      const productToUpdate = {
        ...editedData,
        price: parsedPrice, // Ensure price is a number for the update
      };
      await updateProduct(productToUpdate);
      setEditingProduct(null); // Exit edit mode
      setShowUpdateSuccessPopup(true); // Show success dialog

      // Automatically close modal after 3 seconds
      setTimeout(() => {
        setShowUpdateSuccessPopup(false);
      }, 3000);
      setRefreshTrigger(prev => prev + 1); // Trigger re-fetch of all data
    } catch (err) {
      console.error("Error updating product:", err);
      setError("Failed to update product. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setError(null); // Clear errors on cancel
  };

  // --- Handlers for Deletion ---
  const handleDeleteClick = (id) => { // Takes ID directly
    setProductToDeleteId(id);
    setShowDeleteConfirmPopup(true); // Open the delete confirmation dialog
  };

  const handleDeleteConfirm = async () => {
    setShowDeleteConfirmPopup(false); // Close the confirmation dialog
    if (!productToDeleteId) return;

    try {
      setIsLoading(true); // Set loading for delete operation
      setError(null);
      await deleteProduct(productToDeleteId);
      setShowDeleteSuccessPopup(true); // Show delete success dialog

      setTimeout(() => {
        setShowDeleteSuccessPopup(false);
      }, 3000);
      setRefreshTrigger(prev => prev + 1); // Trigger re-fetch
    } catch (err) {
      console.error("Error deleting product:", err);
      setError("Failed to delete product. Please try again.");
    } finally {
      setIsLoading(false);
      setProductToDeleteId(null); // Clear the product ID after deletion attempt
    }
  };

  if (error)
    return (
      <div className="text-red-600 dark:text-red-400 text-center mt-10 font-inter">
        {error}
      </div>
    );

  if (isLoading)
    return (
      <div className="text-center mt-10 text-gray-500 dark:text-gray-400 font-inter">
        Loading products...
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-10 font-inter">
      {/* Carousel Section */}
      <Carousel />

      {/* Category Filter */}
      <CategoryFilter onSelect={handleCategoryChange} selectedCategory={category} />

      {/* Products */}
      <div id="products-section" className="mt-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4 text-left">
          {category ? `Category: ${category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}` : 'All Products'}
        </h2>
        {filteredProducts.length > 0 ? (
          <ProductList
            products={filteredProducts}
            onEdit={handleEditProduct} // Pass edit handler
            onDelete={handleDeleteClick} // Pass delete handler (to open dialog)
            editingProduct={editingProduct} // Pass editing state
            editedData={editedData} // Pass edited data
            handleChange={handleChange} // Pass change handler for inputs
            handleImageUpload={handleImageUpload} // Pass image upload handler
            handleUpdate={handleUpdateProduct} // Pass update handler
            handleCancelEdit={handleCancelEdit} // Pass cancel handler
            categories={categories} // Pass categories for dropdown
          />
        ) : (
          <div className="text-center text-gray-600 dark:text-gray-400 mt-8">
            No products found in this category.
          </div>
        )}
      </div>

      {/* Shadcn Success Dialog for Product Update */}
      <Dialog open={showUpdateSuccessPopup} onOpenChange={setShowUpdateSuccessPopup}>
        <DialogContent className="sm:max-w-[425px] font-inter">
          <DialogHeader className="text-center">
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
          <DialogHeader className="text-center">
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
          <DialogHeader className="text-center">
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

export default HomePage;
