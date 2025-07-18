import React, { useState } from "react";
import { createProduct } from "../services/productService"; // Assuming this service handles API calls
import { useNavigate } from "react-router-dom";
import { PlusCircle, UploadCloud, CheckCircle } from 'lucide-react'; // Importing icons
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/Dialog"; // Assuming you place the Dialog components here

const AddProductPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    description: "",
    category: "",
    image: null, // Stores the File object
  });
  const [preview, setPreview] = useState(null); // Stores the URL for image preview
  const [loading, setLoading] = useState(false); // State for loading indicator
  const [error, setError] = useState(null); // State for error messages
  const [showSuccessPopup, setShowSuccessPopup] = useState(false); // State for shadcn success dialog

  const categories = [
    "electronics", // Use lowercase for consistency with API typically
    "jewelery",
    "men's clothing",
    "women's clothing"
  ]; // Updated categories to match FakeStoreAPI

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setError(null); // Clear previous errors
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please upload a valid image file (e.g., JPG, PNG, GIF).");
        setFormData((prev) => ({ ...prev, image: null }));
        setPreview(null);
        return;
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setError("Image size exceeds 2MB. Please choose a smaller image.");
        setFormData((prev) => ({ ...prev, image: null }));
        setPreview(null);
        return;
      }

      setFormData((prev) => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    } else {
      setFormData((prev) => ({ ...prev, image: null }));
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, price, description, category, image } = formData;

    if (!title || !price || !description || !category || !image) {
      setError("Please fill in all fields and upload an image.");
      return;
    }

    setLoading(true);
    setError(null); // Clear previous errors

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;

        const newProduct = {
          title,
          price: parseFloat(price), // Ensure price is a number
          description,
          category,
          image: base64Image, // Only base64 image, not the File object
        };

        await createProduct(newProduct); // Assuming your createProduct handles FakeStoreAPI structure
        setShowSuccessPopup(true); // Show shadcn success dialog

        // Automatically close modal and navigate after 3 seconds
        setTimeout(() => {
          setShowSuccessPopup(false);
          navigate("/user-products"); // Redirect to user products page
        }, 3000);
      };

      reader.readAsDataURL(image);
    } catch (err) {
      console.error("Error adding product:", err);
      setError("❌ Failed to add product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container px-4 py-8 max-w-2xl mt-2 font-inter"> {/* Removed mx-auto here */}
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 text-left flex items-center space-x-3"> {/* Changed to text-left */}
          <PlusCircle size={32} className="text-blue-600 dark:text-blue-400" />
          <span>Add New Product</span>
        </h2>

        {error && (
          <div className="bg-red-100 dark:bg-red-800 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded relative mb-4 text-left" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Title and Price in one row on larger screens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Title */}
            <div className="text-left"> {/* Ensure div aligns content left */}
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Title</label>
              <input
                type="text"
                id="title"
                name="title"
                placeholder="e.g., Wireless Bluetooth Earbuds"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm
                           bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           transition duration-200"
                required
              />
            </div>

            {/* Price */}
            <div className="text-left"> {/* Ensure div aligns content left */}
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price ($)</label>
              <input
                type="number"
                id="price"
                name="price"
                placeholder="e.g., 99.99"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm
                           bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           transition duration-200"
                required
                min="0"
                step="0.01" // Allow decimal prices
              />
            </div>
          </div>

          {/* Category Dropdown and Image Upload Area in one row on larger screens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Dropdown */}
            <div className="text-left"> {/* Ensure div aligns content left */}
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm
                           bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 appearance-none cursor-pointer
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           transition duration-200"
                required
              >
                <option value="">Select a Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="capitalize">
                    {cat.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            {/* Image Upload Area */}
            <div className="text-left"> {/* Ensure div aligns content left */}
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Image</label>
              <div
                className="relative w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg
                           flex flex-col items-center justify-center cursor-pointer h-40 md:h-auto
                           bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600
                           transition duration-200 group"
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  aria-label="Upload product image"
                />
                {preview ? (
                  <div className="flex flex-col items-center space-y-2">
                    <img src={preview} alt="Image Preview" className="w-24 h-24 object-contain rounded-lg shadow-md" />
                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">Image selected! Click to change.</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    <UploadCloud size={40} className="transition-transform duration-200 group-hover:scale-110" />
                    <p className="text-sm font-medium text-center">Drag & drop an image or <span className="text-blue-600 dark:text-blue-400 font-semibold">Browse</span></p>
                    <p className="text-xs">PNG, JPG, GIF up to 2MB</p>
                  </div>
                )}
              </div>
              {/* Display validation message for image if any */}
              {formData.image === null && !preview && (
                <p className="text-red-500 text-xs mt-1">Please upload an image for your product.</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="text-left"> {/* Ensure div aligns content left */}
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Description</label>
            <textarea
              id="description"
              name="description"
              placeholder="Describe your product in detail..."
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm
                         bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         transition duration-200 resize-y"
              rows={5}
              required
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md
                       hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50
                       transition-all duration-300 transform hover:scale-105"
            disabled={loading} // Disable button when loading
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Adding Product...</span>
              </>
            ) : (
              <>
                <PlusCircle size={20} />
                <span>Add Product</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Shadcn Success Dialog */}
      <Dialog open={showSuccessPopup} onOpenChange={setShowSuccessPopup}>
        <DialogContent className="sm:max-w-[425px] font-inter">
          <DialogHeader className="text-center">
            <CheckCircle size={60} className="text-green-500 mx-auto mb-4 animate-bounce" />
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">Product Added Successfully!</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300 text-base">
              Your product has been added to the store. You will be redirected shortly.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-4">
            <button
              onClick={() => {
                setShowSuccessPopup(false);
                navigate("/user-products");
              }}
              className="bg-blue-600 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md
                         hover:bg-blue-700 transition duration-300"
            >
              View My Products
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddProductPage;
