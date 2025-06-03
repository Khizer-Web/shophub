import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Search, LogOut, Package, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const { isDarkMode, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10 transition-colors duration-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400 flex items-center">
            <Package className="mr-2" />
            ShopHub
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition">
              Home
            </Link>
            <Link to="/products" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition">
              Shop
            </Link>
            <Link to="/about" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition">
              About
            </Link>
            <Link to="/contact" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition">
              Contact
            </Link>
          </nav>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 flex-1 mx-4 max-w-md">
            <input
              type="text"
              placeholder="Search products..."
              className="bg-transparent border-none outline-none flex-1 py-1 px-2 text-gray-700 dark:text-gray-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
              <Search size={20} />
            </button>
          </form>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>

            <Link to="/cart" className="relative text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition">
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  className="flex items-center text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span className="mr-2">{user?.name.split(' ')[0]}</span>
                  <User size={24} />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50">
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setDropdownOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link 
                      to="/orders" 
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setDropdownOpen(false)}
                    >
                      My Orders
                    </Link>
                    {isAdmin && (
                      <Link 
                        to="/admin" 
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <div className="flex items-center">
                        <LogOut size={16} className="mr-2" />
                        Sign Out
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="flex items-center text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition">
                <span className="mr-2">Sign In</span>
                <User size={24} />
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-700 dark:text-gray-200"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4">
            <form onSubmit={handleSearch} className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 mb-4">
              <input
                type="text"
                placeholder="Search products..."
                className="bg-transparent border-none outline-none flex-1 py-1 px-2 text-gray-700 dark:text-gray-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                <Search size={20} />
              </button>
            </form>

            <nav className="flex flex-col space-y-3 mb-4">
              <Link 
                to="/" 
                className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/products" 
                className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Shop
              </Link>
              <Link 
                to="/about" 
                className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
            </nav>

            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
              <Link 
                to="/cart" 
                className="relative text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition flex items-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ShoppingCart size={20} className="mr-2" />
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="ml-1 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {isAuthenticated ? (
                <div className="flex flex-col space-y-2">
                  <Link 
                    to="/profile" 
                    className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                  <Link 
                    to="/orders" 
                    className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button 
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }} 
                    className="text-left text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition flex items-center"
                  >
                    <LogOut size={16} className="mr-2" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link 
                  to="/login" 
                  className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition flex items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User size={20} className="mr-2" />
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;