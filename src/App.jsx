// App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom"; // Keep Routes and Route
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailsPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import { Toaster } from 'react-hot-toast'; 

console.log("✅ App.jsx rendered");

function App() {
  return (
    <>
     
      <Toaster />

      <Navbar />

      <div className="flex flex-col min-h-screen pt-20">
        <main className="flex-grow bg-gray-50 dark:bg-gray-900">
          {/* Routes component from react-router-dom remains here */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/CartPage" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </>
  );
}

export default App;
