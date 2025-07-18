import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, MapPin, Mail, Phone } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 dark:text-gray-400 py-12 border-t border-gray-800 dark:border-gray-700">
      <div className="container mx-auto px-4">
        {/* Main Grid for Footer Sections */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">

          {/* Company Info - Stays mostly as is, but we'll add text-center for mobile */}
          <div className="col-span-1 text-center md:text-left"> {/* Added text-center md:text-left */}
            <h3 className="text-2xl font-bold text-white mb-4">MyStore</h3>
            <p className="text-sm leading-relaxed">
              Your one-stop shop for all things amazing. Discover quality products
              at unbeatable prices, delivered right to your doorstep.
            </p>
            {/* Social icons are already flex, so justify-center them on mobile */}
            <div className="flex space-x-4 mt-6 justify-center md:justify-start"> {/* Added justify-center md:justify-start */}
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500 transition-colors duration-300">
                <Facebook size={24} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">
                <Twitter size={24} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500 transition-colors duration-300">
                <Instagram size={24} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-700 transition-colors duration-300">
                <Linkedin size={24} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1 text-center md:text-left"> {/* Added text-center md:text-left */}
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-3 list-none pl-0"> {/* Added list-none pl-0 */}
              <li><Link to="/" className="hover:text-blue-400 transition-colors duration-300 text-sm">Home</Link></li>
              <li><Link to="/products" className="hover:text-blue-400 transition-colors duration-300 text-sm">Products</Link></li>
              <li><Link to="/cart" className="hover:text-blue-400 transition-colors duration-300 text-sm">Cart</Link></li>
              <li><Link to="/about" className="hover:text-blue-400 transition-colors duration-300 text-sm">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-blue-400 transition-colors duration-300 text-sm">Contact Us</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="col-span-1 text-center md:text-left"> {/* Added text-center md:text-left */}
            <h4 className="text-lg font-semibold text-white mb-4">Customer Service</h4>
            <ul className="space-y-3 list-none pl-0"> {/* Added list-none pl-0 */}
              <li><Link to="/faq" className="hover:text-blue-400 transition-colors duration-300 text-sm">FAQ</Link></li>
              <li><Link to="/shipping" className="hover:text-blue-400 transition-colors duration-300 text-sm">Shipping & Returns</Link></li>
              <li><Link to="/privacy" className="hover:text-blue-400 transition-colors duration-300 text-sm">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-blue-400 transition-colors duration-300 text-sm">Terms & Conditions</Link></li>
              <li><Link to="/sitemap" className="hover:text-blue-400 transition-colors duration-300 text-sm">Sitemap</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          {/* Removed incorrect flex-shrink-0 w-6 text-blue-400 from this div */}
          <div className="col-span-1 text-center md:text-left"> {/* Added text-center md:text-left */}
            <h4 className="text-lg font-semibold text-white mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm list-none pl-0"> {/* Added list-none pl-0 */}
              {/* Address Item */}
              <li className="flex items-start justify-center md:justify-start space-x-1"> {/* Added justify-center md:justify-start */}
                <div className="flex-shrink-0 w-6 text-blue-400"> {/* Corrected text-white-400 to text-blue-400 */}
                    <MapPin size={20} />
                </div>
                <span>Mystore, Faisalabad, Punjab 38000, Pakistan</span>
              </li>
              {/* Email Item */}
              <li className="flex items-center justify-center md:justify-start space-x-3"> {/* Added justify-center md:justify-start */}
                <div className="flex-shrink-0 w-6 text-blue-400"> {/* Corrected text-white-400 to text-blue-400 */}
                    <Mail size={20} />
                </div>
                <a href="mailto:info@eshop.com" className="hover:text-blue-400 transition-colors duration-300">info@mystore.com</a>
              </li>
              {/* Phone Item */}
              <li className="flex items-center justify-center md:justify-start space-x-3"> {/* Added justify-center md:justify-start */}
                <div className="flex-shrink-0 w-6 text-blue-400"> {/* Corrected text-white-400 to text-blue-400 */}
                    <Phone size={20} />
                </div>
                <a href="tel:+923001234567" className="hover:text-blue-400 transition-colors duration-300">+92 300 1234567</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar - Also ensure it's centered */}
        <div className="border-t border-gray-700 dark:border-gray-600 pt-8 mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>&copy; {currentYear} MyStore. All rights reserved.</p>
          <p className="mt-2">Designed with ❤️ by Ali Ahmad</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;