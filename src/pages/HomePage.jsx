import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getAllProducts, deleteProduct, updateProduct, createProduct as addLocalProduct } from '../services/productService';
import { fetchProducts as fetchFakeStoreProducts } from '../services/fakeStoreService';
import ProductList from '../components/ProductList';
import CategoryFilter from '../components/CategoryFilter';
import Carousel from '../components/Carousel';
import { useCartStore } from '../Store/cartStore';
import toast from 'react-hot-toast'; // Import toast for notifications
import {
    AlertCircle, // Keep AlertCircle for delete confirmation dialog
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
    const [allProductsData, setAllProductsData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [editingProduct, setEditingProduct] = useState(null);
    const [editedData, setEditedData] = useState({});

    // Removed showUpdateSuccessPopup, showDeleteSuccessPopup, showAddSuccessPopup states
    const [showDeleteConfirmPopup, setShowDeleteConfirmPopup] = useState(false);
    const [productToDeleteId, setProductToDeleteId] = useState(null);
    const [showAddProductPopup, setShowAddProductPopup] = useState(false);
    const [showInlineAddForm, setShowInlineAddForm] = useState(false);

    const [newProductData, setNewProductData] = useState({
        title: '',
        price: '',
        description: '',
        category: '',
        image: '',
        error: null,
    });

    const addToCart = useCartStore((state) => state.addToCart);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [isMobileView, setIsMobileView] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobileView(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const generateRandomRating = useCallback(() => {
        const rate = parseFloat(((Math.random() * 4) + 1).toFixed(1));
        const count = Math.floor(Math.random() * 500) + 50;
        return { rate, count };
    }, []);

    const fetchAllInitialProducts = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const localProductsRaw = await getAllProducts();
            const localProducts = localProductsRaw.map(product => ({
                ...product,
                price: parseFloat(product.price),
                isLocal: true,
                rating: product.rating || generateRandomRating(),
            }));

            const fakeStoreProductsRaw = await fetchFakeStoreProducts();
            const fakeStoreProducts = fakeStoreProductsRaw.map(product => ({
                ...product,
                price: parseFloat(product.price),
                isLocal: false,
            }));

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

            combinedProducts.sort((a, b) => {
                if (a.isLocal && !b.isLocal) {
                    return -1;
                }
                if (!a.isLocal && b.isLocal) {
                    return 1;
                }
                return 0;
            });

            setAllProductsData(combinedProducts);
        } catch (err) {
            console.error("Failed to fetch products:", err);
            setError("❌ Failed to load products. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }, [generateRandomRating]);

    useEffect(() => {
        fetchAllInitialProducts();
    }, [refreshTrigger, fetchAllInitialProducts]);

    const filteredProducts = useMemo(() => {
        if (!category) {
            return allProductsData;
        }
        return allProductsData.filter(
            product => product.category && product.category.toLowerCase() === category.toLowerCase()
        );
    }, [category, allProductsData]);

    const handleCategoryChange = useCallback((selectedCategory) => {
        setCategory(selectedCategory);
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
                image: allProductsData.find(p => p.id === editingProduct)?.image || ''
            }));
            return;
        }

        const validTypes = ["image/jpeg", "image/png", "image/webp"];

        if (!validTypes.includes(file.type)) {
            setError("Only JPEG, PNG, or WEBP images are allowed.");
            setEditedData((prev) => ({
                ...prev,
                image: '',
            }));
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setEditedData(prev => ({ ...prev, image: reader.result }));
            setError(null);
        };
        reader.readAsDataURL(file);
    }, [allProductsData, editingProduct]);

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
            setError(null);

            const updatedProduct = {
                ...editedData,
                price: parsedPrice,
            };

            const originalProduct = allProductsData.find(p => p.id === id);

            if (originalProduct?.isLocal) {
                await updateProduct(updatedProduct);
                setRefreshTrigger(prev => prev + 1);
            } else {
                console.warn(`Simulating update for FakeStore product ID: ${id}. Changes will not persist on API.`);
            }

            setAllProductsData(prev =>
                prev.map(p => p.id === id ? updatedProduct : p)
            );

            setEditingProduct(null);
            setEditedData({});
            // Replaced success dialog with toast notification
            toast.success('Product updated successfully!', {
                duration: 3000,
                position: 'bottom-right',
                iconTheme: { primary: '#10B981', secondary: '#fff' },
                style: { minWidth: '250px' },
            });

            return true;
        } catch (err) {
            console.error("Update error:", err);
            setError("Failed to update product.");
            toast.error('Failed to update product. Please try again.'); // Show error toast
            return false;
        }
    }, [editedData, allProductsData, setAllProductsData, setEditingProduct, setEditedData, setRefreshTrigger]);

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
            setError(null);

            const productInfo = allProductsData.find(p => p.id === productToDeleteId);

            setAllProductsData(prevProducts =>
                prevProducts.filter(p => p.id !== productToDeleteId)
            );

            if (productInfo?.isLocal) {
                await deleteProduct(productToDeleteId);
                setRefreshTrigger(prev => prev + 1);
            } else {
                console.warn(`Simulating deletion for FakeStore product ID: ${productToDeleteId}. Changes will not persist on API.`);
            }

            // Replaced success dialog with toast notification
            toast.success('Product deleted successfully!', {
                duration: 3000,
                position: 'bottom-right',
                iconTheme: { primary: '#10B981', secondary: '#fff' },
                style: { minWidth: '250px' },
            });

        } catch (err) {
            console.error("Error deleting product:", err);
            setError("Failed to delete product. Please try again.");
            toast.error('Failed to delete product. Please try again.'); // Show error toast
        }
    }, [productToDeleteId, allProductsData, setAllProductsData, setRefreshTrigger]);

    const handleAddProductClick = useCallback(() => {
        setNewProductData({
            title: '',
            price: '',
            description: '',
            category: '',
            image: '',
            error: null,
        });

        if (isMobileView) {
            setShowInlineAddForm(true);
            setTimeout(() => {
                document.getElementById('add-product-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        } else {
            setShowAddProductPopup(true);
        }
    }, [isMobileView]);

    const handleNewProductChange = useCallback((e) => {
        const { name, value } = e.target;
        setNewProductData(prev => ({ ...prev, [name]: value, error: null }));
    }, []);

    const handleNewProductImageUpload = useCallback((e) => {
        const file = e.target.files[0];
        setNewProductData(prev => ({ ...prev, error: null }));

        if (!file) {
            setNewProductData(prev => ({ ...prev, image: '' }));
            return;
        }

        const validTypes = ["image/jpeg", "image/png", "image/webp"];

        if (!validTypes.includes(file.type)) {
            setNewProductData(prev => ({ ...prev, error: "Only JPEG, PNG, or WEBP images are allowed.", image: '' }));
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setNewProductData(prev => ({ ...prev, image: reader.result }));
        };
        reader.onerror = () => {
            setNewProductData(prev => ({ ...prev, error: "Failed to read image file.", image: '' }));
        };
        reader.readAsDataURL(file);
    }, []);

    const handleAddProduct = useCallback(async (e) => {
        e.preventDefault();

        const { title, price, description, category, image } = newProductData;

        if (!title || price === undefined || price === null || price === "" || !description || !category || !image) {
            setNewProductData(prev => ({ ...prev, error: "All fields, including image, are required." }));
            return;
        }

        const parsedPrice = parseFloat(price);
        if (isNaN(parsedPrice) || parsedPrice < 0) {
            setNewProductData(prev => ({ ...prev, error: "Price must be a valid positive number." }));
            return;
        }

        try {
            setNewProductData(prev => ({ ...prev, error: null }));

            const productWithMeta = {
                ...newProductData,
                price: parsedPrice,
                id: Date.now(), // Use Date.now() for a simple unique ID for new local products
                isLocal: true,
                rating: generateRandomRating(),
            };

            await addLocalProduct(productWithMeta);

            setAllProductsData(prev => [productWithMeta, ...prev]);

            if (isMobileView) {
                setShowInlineAddForm(false);
            } else {
                setShowAddProductPopup(false);
            }

            // Replaced success dialog with toast notification
            toast.success('Product added successfully!', {
                duration: 3000,
                position: 'top-center',
                iconTheme: { primary: '#10B981', secondary: '#fff' },
                style: { minWidth: '250px' },
            });
            setRefreshTrigger(prev => prev + 1); // Trigger refresh to ensure data consistency

        } catch (err) {
            console.error("Add product error:", err);
            setNewProductData(prev => ({ ...prev, error: "Failed to add product." }));
            toast.error('Failed to add product. Please try again.'); // Show error toast
        }
    }, [newProductData, generateRandomRating, setAllProductsData, setShowAddProductPopup, setRefreshTrigger, isMobileView]);


    const AddProductForm = ({ data, onChange, onImageUpload, onSubmit, onCancel, formError, categoriesList }) => (
        <form className="space-y-4" onSubmit={onSubmit}>
            {formError && (
                <div className="text-red-600 text-sm text-center bg-red-100 p-2 rounded-md">
                    {formError}
                </div>
            )}
            <div>
                <label htmlFor="new-title" className="block text-sm font-medium text-gray-700">Title</label>
                <input
                    type="text"
                    id="new-title"
                    name="title"
                    value={data.title}
                    onChange={onChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                />
            </div>
            <div>
                <label htmlFor="new-price" className="block text-sm font-medium text-gray-700">Price</label>
                <input
                    type="number"
                    id="new-price"
                    name="price"
                    value={data.price}
                    onChange={onChange}
                    step="0.01"
                    min="0"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                />
            </div>
            <div>
                <label htmlFor="new-description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                    id="new-description"
                    name="description"
                    value={data.description}
                    onChange={onChange}
                    rows="3"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                ></textarea>
            </div>
            <div>
                <label htmlFor="new-category" className="block text-sm font-medium text-gray-700">Category</label>
                <select
                    id="new-category"
                    name="category"
                    value={data.category}
                    onChange={onChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                >
                    <option value="">Select a category</option>
                    {categoriesList.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="new-image" className="block text-sm font-medium text-gray-700">Product Image</label>
                <input
                    type="file"
                    id="new-image"
                    name="image"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={onImageUpload}
                    className="mt-1 block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4
                                     file:rounded-md file:border-0 file:text-sm file:font-semibold
                                     file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {data.image && (
                    <div className="mt-2">
                        <img src={data.image} alt="Product Preview" className="h-24 w-24 object-contain rounded-md border border-gray-200 shadow-sm" />
                    </div>
                )}
                {!data.image && <p className="text-red-500 text-sm mt-1">Please select an image file.</p>}
            </div>
            <DialogFooter className="flex justify-end space-x-4 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="bg-white text-gray-800 font-semibold py-2.5 px-6 rounded-lg shadow-md transition duration-300 hover:bg-gray-100"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="bg-blue-600 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
                >
                    Add Product
                </button>
            </DialogFooter>
        </form>
    );


    if (error) {
        return (
            <div className="text-red-600 text-center mt-10 font-inter">
                {error}
            </div>
        );
    }

    if (isLoading && allProductsData.length === 0) {
        return (
            <div className="text-center mt-10 text-gray-500 font-inter">
                Loading products...
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-10 font-inter">
            <Carousel />

            <div className="flex flex-col items-start sm:flex-row sm:items-center sm:justify-end gap-4 mb-6 w-full">
                <CategoryFilter
                    onSelect={handleCategoryChange}
                    selectedCategory={category}
                    categories={categories}
                />
                <button
                    onClick={handleAddProductClick}
                    className="bg-blue-600 text-white font-semibold py-2.5 px-9 rounded-lg shadow-md hover:bg-blue-700 transition duration-300 flex items-center space-x-2 w-full sm:w-auto justify-center sm:ml-auto"
                >
                    <PlusCircle size={20} />
                    <span>Add New Product</span>
                </button>
            </div>

            {isMobileView && showInlineAddForm && (
                <div id="add-product-form" className="bg-white p-6 rounded-lg mb-8 mx-auto max-w-[500px] shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 text-left">Add New Product</h2>
                    <AddProductForm
                        data={newProductData}
                        onChange={handleNewProductChange}
                        onImageUpload={handleNewProductImageUpload}
                        onSubmit={handleAddProduct}
                        onCancel={() => setShowInlineAddForm(false)}
                        formError={newProductData.error}
                        categoriesList={categories}
                    />
                </div>
            )}

            <div id="products-section" className="mt-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-left px-9">
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
                    <div className="text-center text-gray-600 mt-8">
                        No products found in this category.
                    </div>
                )}
            </div>

            {/* Shadcn Dialog for Delete Confirmation (remains a dialog) */}
            <Dialog open={showDeleteConfirmPopup} onOpenChange={setShowDeleteConfirmPopup}>
                <DialogContent className="sm:max-w-[350px] font-inter max-h-[90vh] overflow-y-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg flex flex-col justify-between">
                    <div className="flex-grow">
                        <DialogHeader className="text-left"> {/* Changed from text-center to text-left */}
                            <AlertCircle size={60} className="text-red-500 mb-4" /> {/* Removed mx-auto */}
                            <DialogTitle className="text-2xl font-bold text-gray-900">Confirm Deletion</DialogTitle>
                            <DialogDescription className="text-gray-600 text-base">
                                Are you sure you want to delete this product?
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                        <button
                            onClick={() => setShowDeleteConfirmPopup(false)}
                            className="bg-white text-gray-800 px-6 py-2 rounded-lg shadow-md hover:bg-gray-100 transition duration-300"
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

            {/* Shadcn Dialog for Adding New Product (Desktop only) */}
            {!isMobileView && (
                <Dialog open={showAddProductPopup} onOpenChange={setShowAddProductPopup}>
                    <DialogContent className="w-[95%] sm:max-w-[500px] font-inter max-h-[calc(100vh-4rem)] overflow-y-auto p-4 sm:p-6 top-[15%] translate-y-0 bg-white rounded-lg shadow-lg">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-gray-900 text-left">Add New Product</DialogTitle>
                        </DialogHeader>
                        <AddProductForm
                            data={newProductData}
                            onChange={handleNewProductChange}
                            onImageUpload={handleNewProductImageUpload}
                            onSubmit={handleAddProduct}
                            onCancel={() => setShowAddProductPopup(false)}
                            formError={newProductData.error}
                            categoriesList={categories}
                        />
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default HomePage;

