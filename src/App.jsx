// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar"; // Your Navbar component
import Footer from "./components/Footer"; // Your new Footer component
import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailsPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import AddProductPage from "./pages/AddProductPage";
import UserProductsPage from "./pages/UserProductsPage";

console.log("✅ App.jsx rendered");

function App() {
  return (
    <Router>
      {/* The Navbar is rendered directly here.
          Since it's 'fixed', it will position itself relative to the viewport,
          independent of the document flow and any parent's stacking context. */}
      <Navbar />

      {/*
        This 'div' now handles the main content and footer layout.
        'flex flex-col' for vertical stacking.
        'min-h-screen' ensures it always takes at least the full viewport height.
        'pt-20' is moved here to provide padding at the top for the fixed Navbar.
        This ensures your content starts below the fixed header.
      */}
      <div className="flex flex-col min-h-screen pt-20"> {/* Added pt-20 here */}

        {/*
          This 'main' element wraps all your page content.
          'flex-grow' ensures it expands to fill available vertical space,
          pushing the footer down.
          'pt-20' is REMOVED from here as it's now on the parent div.
          'bg-gray-50 dark:bg-gray-900' sets a default background for pages.
        */}
        <main className="flex-grow bg-gray-50 dark:bg-gray-900">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/CartPage" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/add-product" element={<AddProductPage />} />
            <Route path="/user-products" element={<UserProductsPage />} />
            {/* You might want a catch-all route for 404 pages */}
            {/* <Route path="*" element={<NotFoundPage />} /> */}
          </Routes>
        </main>

        <Footer /> {/* Your Footer component, pushed to the bottom by flex-grow */}
      </div>
    </Router>
  );
}

export default App;