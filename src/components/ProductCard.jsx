import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MoreVertical, Star, Edit2, Trash2, XCircle, ShoppingCart } from 'lucide-react';

// Import Shadcn UI Dialog component
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "./Dialog";

const ProductCard = ({
    product,
    onEdit,
    onDelete,
    editingProduct,
    editedData,
    handleChange,
    handleImageUpload,
    handleUpdate,
    handleCancelEdit,
    categories,
    onAddToCart
}) => {
    const [showEditModal, setShowEditModal] = useState(false);
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    const actionsMenuRef = useRef(null);
    const navigate = useNavigate();

    // New state to manage screen size for inline editing
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    // Effect to detect screen size
    useEffect(() => {
        const checkScreenSize = () => {
            setIsSmallScreen(window.innerWidth < 768);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => {
            window.removeEventListener('resize', checkScreenSize);
        };
    }, []);

    // Memoize the renderStars helper function.
    const memoizedRenderStars = useCallback((rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <Star key={`full-${i}`} size={16} fill="currentColor" stroke="none" className="text-yellow-400 inline-block" />
            );
        }

        if (hasHalfStar) {
            stars.push(
                <div key="half" className="relative inline-block overflow-hidden">
                    <Star size={16} fill="currentColor" stroke="none" className="text-yellow-400 absolute top-0 left-0 w-1/2" />
                    <Star size={16} fill="currentColor" stroke="none" className="text-gray-300 dark:text-gray-600 w-full" />
                </div>
            );
        }

        const remainingStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < remainingStars; i++) {
            stars.push(
                <Star key={`empty-${i}`} size={16} fill="currentColor" stroke="none" className="text-gray-300 dark:text-gray-600 inline-block" />
            );
        }
        return stars;
    }, []);

    // Memoize the onError handler for the image
    const handleImageError = useCallback((e) => {
        e.target.onerror = null;
        e.target.src = `https://placehold.co/200x200/cccccc/333333?text=No+Image`;
    }, []);

    const isThisProductBeingEditedGlobally = editingProduct === product.id;
    const isClickable = useMemo(() => !product.isLocal, [product.isLocal]);


    const handleOpenEdit = useCallback((e) => {
        e.stopPropagation();
        onEdit(product);
        setShowActionsMenu(false);

        if (!isSmallScreen) {
            setShowEditModal(true);
        }
    }, [onEdit, product, isSmallScreen]);


    const handleSaveEdit = useCallback(async (e) => {
        e.preventDefault();
        const success = await handleUpdate();
        if (success) {
            setShowEditModal(false);
        }
    }, [handleUpdate]);

    const handleCancelEditInternal = useCallback(() => {
        handleCancelEdit();
        setShowEditModal(false);
    }, [handleCancelEdit]);

    const toggleActionsMenu = useCallback((e) => {
        e.stopPropagation();
        setShowActionsMenu(prev => !prev);
    }, []);

    const handleAddToCartClick = useCallback((e) => {
        e.stopPropagation();
        onAddToCart(product);
        navigate('/CartPage');
    }, [onAddToCart, product, navigate]);


    const cardDisplayContent = useMemo(() => {
        const displayProduct = isThisProductBeingEditedGlobally ? editedData : product;

        return (
            <div className="flex flex-col h-full text-left p-4">
                {/* Product Image */}
                <div className="flex-shrink-0 flex items-center justify-center h-48 mb-4">
                    <img
                        src={displayProduct.image}
                        alt={displayProduct.title}
                        className="h-full w-full object-contain mx-auto mix-blend-multiply dark:mix-blend-normal
                                transform transition-transform duration-300 group-hover:scale-105 bg-white"
                        onError={handleImageError}
                    />
                </div>

                {/* Product Details - Added min-h to ensure consistent vertical space for text content */}
                <div className="flex-grow flex flex-col justify-start text-left min-h-[120px]">
                    {/* Title container with fixed height for consistent alignment */}
                    <div className="h-[56px] overflow-hidden mb-2"> {/* Adjusted height for 2 lines of text */}
                        <h2
                            className="text-lg font-semibold line-clamp-2 text-gray-900 dark:text-white leading-tight"
                            title={displayProduct.title}
                        >
                            {displayProduct.title}
                        </h2>
                    </div>

                    {/* Rating container with fixed height for consistent alignment */}
                    <div className="h-[28px] flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2"> {/* Adjusted height */}
                        {displayProduct.rating && typeof displayProduct.rating.rate === 'number' ? (
                            <>
                                <div className="flex items-center mr-1">
                                    {memoizedRenderStars(displayProduct.rating.rate)}
                                </div>
                                <span className="font-semibold text-gray-900 dark:text-white text-base">
                                    {Number(displayProduct.rating.rate).toFixed(1)}
                                </span>
                                <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">({displayProduct.rating.count} reviews)</span>
                            </>
                        ) : (
                            <span className="text-gray-500 dark:text-gray-400 text-xs italic">No reviews yet</span>
                        )}
                    </div>

                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-50 text-left">
                        ${Number(displayProduct.price || 0).toFixed(2)}
                    </p>
                </div>
            </div>
        );
    }, [product, editedData, isThisProductBeingEditedGlobally, memoizedRenderStars, handleImageError]);


    // Conditional render: If this product is being edited AND it's a small screen, show inline form
    if (isThisProductBeingEditedGlobally && isSmallScreen) {
        return (
            <div className="bg-white rounded-2xl p-4 mb-6 font-inter border-blue-500 shadow-none"> {/* Added shadow-none here */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Product</h3>
                    <button
                        onClick={handleCancelEditInternal}
                        className="p-1 rounded-full text-gray-600 dark:text-gray-300"
                    >
                        <XCircle size={24} />
                    </button>
                </div>
                <form className="space-y-4" onSubmit={handleSaveEdit}>
                    {editedData.error && (
                        <div className="text-red-600 text-sm text-center bg-red-100 p-2 rounded-md">
                            {editedData.error}
                        </div>
                    )}
                    <div>
                        <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                        <input
                            type="text"
                            id="edit-title"
                            name="title"
                            value={editedData.title || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-none py-2 px-3
                                    bg-white text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price</label>
                        <input
                            type="number"
                            id="edit-price"
                            name="price"
                            value={editedData.price || ''}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-none py-2 px-3
                                    bg-white text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                        <textarea
                            id="edit-description"
                            name="description"
                            value={editedData.description || ''}
                            onChange={handleChange}
                            rows="3"
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-none py-2 px-3
                                    bg-white text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                        ></textarea>
                    </div>
                    <div>
                        <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                        <select
                            id="edit-category"
                            name="category"
                            value={editedData.category || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-none py-2 px-3
                                    bg-white text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                        <label htmlFor="edit-image" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product Image</label>
                        <input
                            type="file"
                            id="edit-image"
                            name="image"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleImageUpload}
                            className="mt-1 block w-full text-sm text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4
                                    file:rounded-md file:border-0 file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {editedData.image && (
                            <div className="mt-2">
                                <img src={editedData.image} alt="Product Preview" className="h-24 w-24 object-contain rounded-md border border-gray-200 dark:border-gray-600" />
                            </div>
                        )}
                    </div>
                    <DialogFooter className="flex justify-end space-x-4 pt-4">
                        <button
                            type="button"
                            onClick={handleCancelEditInternal}
                            className="bg-white text-gray-800 font-semibold py-2.5 px-6 rounded-lg shadow-none
                                    hover:bg-gray-100 transition duration-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white font-semibold py-2.5 px-6 rounded-lg shadow-none
                                    hover:bg-blue-700 transition duration-300"
                        >
                            Save Changes
                        </button>
                    </DialogFooter>
                </form>
            </div>
        );
    }

    // Default rendering for product card (if not editing or if it's not a small screen)
    return (
        <div className={`bg-white rounded-2xl p-2 shadow-none border-none
                        flex flex-col h-full overflow-hidden group font-inter relative`}>

            {/* Three dots button and its menu */}
            <div className="absolute top-2 right-2 z-20">
                <button
                    onClick={toggleActionsMenu}
                    className="p-2 rounded-full transition-colors"
                    aria-label="Product actions menu"
                >
                    <MoreVertical size={20} className="text-gray-600 dark:text-gray-300" />
                </button>

                {/* Actions Menu (always show if toggled) */}
                {showActionsMenu && (
                    <div
                        ref={actionsMenuRef}
                        // The shadow-lg here is intentional for the dropdown menu visibility
                        className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5 focus:outline-none"
                        tabIndex={-1}
                    >
                        <button
                            onClick={handleOpenEdit}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-200 cursor-pointer flex items-center gap-2"
                        >
                            <Edit2 size={16} /> Edit
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(product.id);
                                setShowActionsMenu(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-100 cursor-pointer flex items-center gap-2"
                        >
                            <Trash2 size={16} /> Delete
                        </button>
                    </div>
                )}
            </div>

            {/* The clickable area for the product details */}
            {isClickable ? (
                <Link
                    to={`/product/${product.id}`}
                    className="block flex-grow flex flex-col overflow-hidden"
                >
                    {cardDisplayContent}
                </Link>
            ) : (
                <div className="flex-grow flex flex-col overflow-hidden">
                    {cardDisplayContent}
                </div>
            )}

            {/* Add to Cart Button - Placed outside the Link */}
            <div className="p-4 pt-0">
                <button
                    onClick={handleAddToCartClick}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 px-4 rounded-xl
                                shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-300
                                flex items-center justify-center space-x-2 transform hover:scale-105 active:scale-95
                                focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-800
                                group relative overflow-hidden"
                >
                    <span className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></span>
                    <ShoppingCart size={20} className="mr-2" />
                    <span>Add to Cart</span>
                </button>
            </div>


            {/* Edit Product Dialog (Modal) - Only renders if NOT a small screen AND editing */}
            {!isSmallScreen && isThisProductBeingEditedGlobally && (
                <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                    <DialogContent
                        className="w-[95%] sm:max-w-[400px] font-inter max-h-[90vh] md:max-h-[70vh] overflow-y-auto
                                p-4 sm:p-6 top-[5%] md:top-1/2 transform-none md:-translate-y-1/2 bg-white shadow-none" // Added shadow-none here
                    >
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Edit Product</DialogTitle>
                        </DialogHeader>
                        <form className="space-y-4" onSubmit={handleSaveEdit}>
                            {editedData.error && (
                                <div className="text-red-600 text-sm text-center bg-red-100 p-2 rounded-md">
                                    {editedData.error}
                                </div>
                            )}
                            <div>
                                <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                                <input
                                    type="text"
                                    id="edit-title"
                                    name="title"
                                    value={editedData.title || ''}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-none py-2 px-3
                                            bg-white text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price</label>
                                <input
                                    type="number"
                                    id="edit-price"
                                    name="price"
                                    value={editedData.price || ''}
                                    onChange={handleChange}
                                    step="0.01"
                                    min="0"
                                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-none py-2 px-3
                                            bg-white text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                                <textarea
                                    id="edit-description"
                                    name="description"
                                    value={editedData.description || ''}
                                    onChange={handleChange}
                                    rows="3"
                                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-none py-2 px-3
                                            bg-white text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    required
                                ></textarea>
                            </div>
                            <div>
                                <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                                <select
                                    id="edit-category"
                                    name="category"
                                    value={editedData.category || ''}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-none py-2 px-3
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
                                <label htmlFor="edit-image" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product Image</label>
                                <input
                                    type="file"
                                    id="edit-image"
                                    name="image"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleImageUpload}
                                    className="mt-1 block w-full text-sm text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4
                                            file:rounded-md file:border-0 file:text-sm file:font-semibold
                                            file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                {editedData.image && (
                                    <div className="mt-2">
                                        <img src={editedData.image} alt="Product Preview" className="h-24 w-24 object-contain rounded-md border border-gray-200 dark:border-gray-600" />
                                    </div>
                                )}
                            </div>
                            <DialogFooter className="flex justify-end space-x-4 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCancelEditInternal}
                                    className="bg-white text-gray-800 font-semibold py-2.5 px-6 rounded-lg shadow-none
                                            hover:bg-gray-100 transition duration-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white font-semibold py-2.5 px-6 rounded-lg shadow-none
                                            hover:bg-blue-700 transition duration-300"
                                >
                                    Save Changes
                                </button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default React.memo(ProductCard);