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
    if (!cat) return ''; // Handles empty string for "All Products"
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

  // Effect to set initial searchTerm to reflect selectedCategory
  // and update searchTerm when selectedCategory changes externally.
  useEffect(() => {
    setSearchTerm(formatCategoryName(selectedCategory));
  }, [selectedCategory, formatCategoryName]);


  // Effect to close dropdown when clicking outside the component
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        // When closing, reset searchTerm to display the currently selected category
        setSearchTerm(formatCategoryName(selectedCategory));
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedCategory, formatCategoryName]);

  // Removed the useEffect that instantly selects category based on searchTerm match.
  // This behavior will now be driven only by explicit selection via handleSelectOption.

  // Filter categories based on search term.
  const filteredCategories = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    if (isOpen && lowerCaseSearchTerm === '') {
      return categories; // Show all available categories if input is empty and dropdown is open
    }
    return categories.filter(cat =>
      formatCategoryName(cat).toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [categories, searchTerm, formatCategoryName, isOpen]);

  // Handles selecting an option from the dropdown
  const handleSelectOption = (category) => {
    onSelect(category); // Notify parent component of the selection
    setSearchTerm(formatCategoryName(category)); // Update searchTerm to show selected category
    setIsOpen(false); // Close the dropdown
  };

  // Handles changes in the input field (user typing)
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsOpen(true); // Always open dropdown when typing

    // If the input is cleared, consider it as trying to select 'All Products'
    // but only if the input has been interacted with.
    if (value === '' && selectedCategory !== '') {
        // We'll let the user explicitly click 'All Products' from the list
        // rather than auto-selecting it just by clearing the search term.
        // This makes the behavior more predictable.
    }
  };

  // Handles input field focus.
  const handleInputFocus = () => {
    setIsOpen(true);
    // When focused, clear the searchTerm to show all options initially
    // or let the user type to search.
    setSearchTerm('');
  };


  return (
    <div
      className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md w-full max-w-lg relative"
      ref={wrapperRef}
    >
      <label
        htmlFor="category-search"
        className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex-shrink-0"
      >
        Filter by Category:
      </label>

      {initialLoadComplete && error ? (
        <div className="text-red-500 dark:text-red-400">
          {error}
        </div>
      ) : (
        <div className="relative flex-grow">
          <input
            type="text"
            id="category-search"
            // Display the selected category when dropdown is closed, or searchTerm when open.
            placeholder={selectedCategory ? formatCategoryName(selectedCategory) : "Select or search category..."}
            value={isOpen ? searchTerm : formatCategoryName(selectedCategory)}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            className="block w-full px-4 py-2 text-base text-gray-700 dark:text-gray-300
                       bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600
                       rounded-lg shadow-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       transition-all duration-200 cursor-pointer
                       appearance-none pr-8"
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
                  onClick={() => handleSelectOption('')} // Explicitly select 'All Products' by passing empty string
                  className={`px-4 py-2 cursor-pointer text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 ${selectedCategory === '' ? 'bg-blue-50 dark:bg-blue-700 font-semibold' : ''}`}
                >
                  All Products
                </li>

                {filteredCategories.length > 0 ? (
                  filteredCategories.map((cat) => (
                    <li
                      key={cat}
                      onClick={() => handleSelectOption(cat)}
                      className={`px-4 py-2 cursor-pointer capitalize text-gray-800 dark:text-gray-200
                                 hover:bg-gray-100 dark:hover:bg-gray-600
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

export default React.memo(CategoryFilter);