import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <Link to="/" className="text-xl font-bold flex items-center text-blue-400">
              <Package className="mr-2" />
              ShopHub
            </Link>
            <p className="mt-4 text-gray-300">
              Your one-stop shop for quality products. We provide exceptional shopping experiences with curated selections.
            </p>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-blue-400 transition">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-blue-400 transition">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-blue-400 transition">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-blue-400 transition">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-blue-400 transition">Home</Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-300 hover:text-blue-400 transition">Shop</Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-blue-400 transition">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-blue-400 transition">Contact</Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-blue-400 transition">FAQ</Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products?category=electronics" className="text-gray-300 hover:text-blue-400 transition">Electronics</Link>
              </li>
              <li>
                <Link to="/products?category=clothing" className="text-gray-300 hover:text-blue-400 transition">Clothing</Link>
              </li>
              <li>
                <Link to="/products?category=accessories" className="text-gray-300 hover:text-blue-400 transition">Accessories</Link>
              </li>
              <li>
                <Link to="/products?category=footwear" className="text-gray-300 hover:text-blue-400 transition">Footwear</Link>
              </li>
              <li>
                <Link to="/products?category=home" className="text-gray-300 hover:text-blue-400 transition">Home</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="mr-2 mt-1 flex-shrink-0" size={18} />
                <span className="text-gray-300">123 Commerce St, Market City, MC 12345</span>
              </li>
              <li className="flex items-center">
                <Phone className="mr-2 flex-shrink-0" size={18} />
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="mr-2 flex-shrink-0" size={18} />
                <a href="mailto:info@shophub.com" className="text-gray-300 hover:text-blue-400 transition">
                  info@shophub.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; {currentYear} ShopHub. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex flex-wrap space-x-4 text-sm text-gray-400">
              <Link to="/privacy" className="hover:text-blue-400 transition">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-blue-400 transition">Terms of Service</Link>
              <Link to="/shipping" className="hover:text-blue-400 transition">Shipping Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;