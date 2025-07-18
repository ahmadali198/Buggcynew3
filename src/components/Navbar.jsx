import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { Menu, ShoppingCart } from "lucide-react";

const CloseIcon = ({ size = 32, color = "#FFFFFF", className = '', onClick }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height={size}
    viewBox="0 -960 960 960"
    width={size}
    className={className}
    onClick={onClick}
  >
    <path fill={color} d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"></path>
  </svg>
);

const Navbar = () => {
  const totalCartItems = useCartStore((state) => state.totalItems || 0);
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    // Close mobile menu when route changes
    setMobileOpen(false);
  }, [location.pathname]);

  // Prevent body scrolling when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Cleanup function to reset overflow when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileOpen]);

  // Consolidate navLinks for both desktop and mobile
  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Add Product", path: "/add-product" },
    { label: "My Products", path: "/user-products" },
    { label: "Cart", path: "/checkout", isCart: true }, // Ensure this path is correct for your cart page
  ];

  const toggleMobileMenu = () => setMobileOpen(!mobileOpen);

  return (
    <nav className={`fixed top-0 left-0 w-full z-[999] transition-all duration-300 transform translate-z-0 will-change-transform
                     ${scrolled ? 'bg-white dark:bg-gray-900 shadow-lg' : 'bg-white dark:bg-gray-900 shadow-md'}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Brand Logo/Title */}
        <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-gray-800 dark:text-white transition-colors hover:text-blue-600 dark:hover:text-blue-400">
          <span role="img" aria-label="shopping bags">🛍️</span>
          <span>MyStore</span>
        </Link>

        {/* Desktop Menu - Hidden on mobile */}
        <ul className="hidden md:flex items-center space-x-7 font-medium">
          {navLinks.map(({ label, path, isCart }) => (
            <li key={path}>
              <Link
                to={path}
                className={`relative px-2 py-1 text-lg group
                                 ${location.pathname === path
                                  ? "text-blue-600 dark:text-blue-400 font-semibold before:scale-x-100"
                                  : "text-gray-700 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
                                }
                                transition-colors duration-200 ease-in-out
                                before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5
                                before:bg-blue-600 before:dark:bg-blue-400 before:scale-x-0 before:origin-left
                                before:transition-transform before:duration-300 before:ease-out
                                hover:before:scale-x-100 ${isCart ? 'flex items-center' : ''}`}
              >
                {isCart && <ShoppingCart size={22} className="mr-1" />}
                {label}
                {isCart && totalCartItems > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center h-5 w-5 bg-blue-600 text-white text-xs font-bold rounded-full transform scale-90 group-hover:scale-100 transition-transform duration-200">
                    {totalCartItems}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile Toggle Button - Hidden on desktop */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden text-gray-700 dark:text-gray-200 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
          aria-label="Open menu"
        >
          <Menu size={28} /> {/* Always show Menu icon to open this modal */}
        </button>
      </div>

      {/* Full-Screen Blue Overlay with Central Modal (conditionally rendered and hidden on desktop) */}
      {mobileOpen && (
        <div
          className={`fixed inset-0 z-[998] flex flex-col items-center justify-start bg-blue-800 p-4 transition-opacity duration-300 md:hidden ${ // md:hidden to hide on desktop
            mobileOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
          // Clicking the blue background area directly also closes the modal
          onClick={toggleMobileMenu}
        >
          {/* Top Header of the Blue Overlay (contains 'Menu' and 'X' button) */}
          <div className="w-full max-w-sm md:max-w-md flex justify-between items-center px-4 py-3">
            <span className="text-2xl font-extrabold text-white">Menu</span>
            <button
              onClick={toggleMobileMenu}
              className="text-white p-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              aria-label="Close menu"
            >
              <CloseIcon size={32} color="#FFFFFF" /> {/* White X on blue background */}
            </button>
          </div>

          {/* Central White Modal/Links Container - UI IMPROVEMENTS HERE */}
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 flex flex-col items-center flex-grow mx-auto my-auto max-w-sm md:max-w-md w-full border border-gray-200 dark:border-gray-700 transform scale-95 opacity-0 animate-fadeInUp"
            // Delay rendering until `mobileOpen` is true for animation, then apply transition for fade-in/scale-up
            // The `transform scale-95 opacity-0` combined with `animate-fadeInUp` will give it a nice pop-in effect
            style={mobileOpen ? { animation: 'fadeInUp 0.3s ease-out forwards', opacity: 1, transform: 'scale(1)' } : {}}
            // Prevent clicks inside the modal from closing the modal
            onClick={(e) => e.stopPropagation()}
          >
            {/* Links Section */}
            <ul className="flex flex-col space-y-5 w-full text-center">
              {navLinks.map(({ label, path, isCart }) => ( // Using the full navLinks for modal
                <li key={path}>
                  <Link
                    to={path}
                    onClick={toggleMobileMenu} // Close modal when a link is clicked
                    className={`flex items-center justify-center py-3 text-xl font-medium group rounded-lg
                                  ${location.pathname === path
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 font-semibold" // Active link style
                                    : "text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400" // Inactive link style
                                  }
                                  transition-all duration-200 ease-in-out`}
                  >
                    {isCart && <ShoppingCart size={24} className="mr-3" />}
                    {label}
                    {isCart && totalCartItems > 0 && (
                      <span className="ml-3 inline-flex items-center justify-center h-7 w-7 bg-blue-600 text-white text-sm font-bold rounded-full border-2 border-white">
                        {totalCartItems}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>

            
          </div>
        </div>
      )}
      {/* Add a simple keyframe for the pop-in animation directly in your CSS or as a style tag */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;