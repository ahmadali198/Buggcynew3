import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { fetchCategories } from '../services/fakeStoreService';

const CategoryFilter = ({ onSelect, selectedCategory }) => {
  const [categories, setCategories] = useState([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Function to format category names for display, memoized for stability
  const formatCategoryName = useCallback((cat) => {
    if (!cat) return '';
    return cat.replace(/-/g, ' ').charAt(0).toUpperCase() + cat.replace(/-/g, ' ').slice(1);
  }, []);

  // Effect to load categories only once on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setError(null);
        const result = await fetchCategories();
        setCategories(result);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setError('Failed to load categories. Please try again.');
      } finally {
        setInitialLoadComplete(true);
      }
    };
    loadCategories();
  }, []);

  // Effect to close dropdown when clicking outside the component
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        // Reset searchTerm to the currently selected category when closing dropdown
        setSearchTerm(formatCategoryName(selectedCategory));
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedCategory, formatCategoryName]);

  // Effect to instantly select category if search term exactly matches a category
  useEffect(() => {
    if (!initialLoadComplete) return;

    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const matchedCategory = categories.find(cat => formatCategoryName(cat).toLowerCase() === lowerCaseSearchTerm);

    if (matchedCategory && selectedCategory !== matchedCategory) {
      onSelect(matchedCategory);
      setIsOpen(false);
    } else if (searchTerm === '' && selectedCategory !== '') {
      // This handles clearing the selection if the search term becomes empty
      onSelect('');
    }
  }, [searchTerm, categories, onSelect, formatCategoryName, selectedCategory, initialLoadComplete]);


  // Filter categories based on search term.
  const filteredCategories = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    // Show all categories if dropdown is open and search term is empty,
    // or if the search term is not empty but matches a category.
    if (isOpen && lowerCaseSearchTerm === '') {
      return categories;
    }
    return categories.filter(cat =>
      formatCategoryName(cat).toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [categories, searchTerm, formatCategoryName, isOpen]);

  // Handles selecting an option from the dropdown
  const handleSelectOption = (category) => {
    onSelect(category);
    setSearchTerm(formatCategoryName(category)); // Update searchTerm to show selected category
    setIsOpen(false);
  };

  // Handles changes in the input field (user typing)
  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true); // Always open dropdown when typing
  };

  // Handles input field focus.
  const handleInputFocus = () => {
    setIsOpen(true);
    // When focused, the input should reflect the currently selected category,
    // allowing the user to see or modify it.
    setSearchTerm(''); // MODIFIED: Clear searchTerm on focus to show all categories initially
  };


  return (
    <div
      className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md w-full max-w-lg mx-auto relative"
      ref={wrapperRef}
    >
      <label
        htmlFor="category-search"
        className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex-shrink-0"
      >
        Filter by Category:
      </label>

      {/* Only show error if initial load failed and it's not loading */}
      {initialLoadComplete && error ? (
        <div className="text-red-500 dark:text-red-400">
          {error}
        </div>
      ) : (
        <div className="relative flex-grow">
          <input
            type="text"
            id="category-search"
            placeholder={selectedCategory ? formatCategoryName(selectedCategory) : "Select or search category..."}
            // Display searchTerm when the dropdown is open (for active typing/filtering),
            // otherwise display the formatted selectedCategory.
            value={isOpen ? searchTerm : formatCategoryName(selectedCategory)}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            className="block w-full px-4 py-2 text-base text-gray-700 dark:text-gray-300
                       bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600
                       rounded-lg shadow-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       transition-all duration-200 cursor-pointer"
            autoComplete="off"
          />

          <div
            className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300"
          >
            <svg
              className={`fill-current h-4 w-4 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>

          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              <ul className="py-1">
                <li
                  key="all-products"
                  onClick={() => handleSelectOption('')}
                  className={`px-4 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-600 text-gray-800 dark:text-gray-200 ${selectedCategory === '' ? 'bg-blue-50 dark:bg-blue-700 font-semibold' : ''}`}
                >
                  All Products
                </li>

                {filteredCategories.length > 0 ? (
                  filteredCategories.map((cat) => (
                    <li
                      key={cat}
                      onClick={() => handleSelectOption(cat)}
                      className={`px-4 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-600 capitalize text-gray-800 dark:text-gray-200
                                  ${selectedCategory === cat ? 'bg-blue-50 dark:bg-blue-700 font-semibold' : ''}`}
                    >
                      {formatCategoryName(cat)}
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-gray-500 dark:text-gray-400 italic">
                    No matching categories
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(CategoryFilter); // Memoized for performance
