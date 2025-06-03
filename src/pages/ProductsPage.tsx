import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, getProductsByCategory } from '../api/productApi';
import ProductCard from '../components/ui/ProductCard';
import Loader from '../components/ui/Loader';
import { Product } from '../types';
import { categories } from '../data/mockData';
import { SlidersHorizontal, ChevronDown, Search } from 'lucide-react';

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 500 });
  const [sortBy, setSortBy] = useState<string>('default');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('q') || '');

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      
      // Get the category from URL parameters
      const categoryParam = searchParams.get('category');
      const queryParam = searchParams.get('q');
      
      if (categoryParam) {
        setSelectedCategory(categoryParam);
      }
      
      if (queryParam) {
        setSearchQuery(queryParam);
      }
      
      let response;
      
      if (categoryParam && categoryParam !== 'all') {
        response = await getProductsByCategory(categoryParam);
      } else {
        response = await getProducts();
      }
      
      if (response.success && response.data) {
        setProducts(response.data);
      }
      
      setIsLoading(false);
    };
    
    fetchProducts();
  }, [searchParams]);

  // Filter products based on search query, price range, and sort
  const filteredProducts = products
    .filter(product => {
      // Apply search filter if search query exists
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          product.title.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .filter(product => {
      // Apply price range filter
      return product.price >= priceRange.min && product.price <= priceRange.max;
    })
    .sort((a, b) => {
      // Apply sorting
      switch (sortBy) {
        case 'price-low-high':
          return a.price - b.price;
        case 'price-high-low':
          return b.price - a.price;
        case 'name-a-z':
          return a.title.localeCompare(b.title);
        case 'name-z-a':
          return b.title.localeCompare(a.title);
        default:
          return 0; // No sorting (default)
      }
    });

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    
    if (category === 'all') {
      // Remove category from URL if "All" is selected
      searchParams.delete('category');
    } else {
      // Update URL with selected category
      searchParams.set('category', category);
    }
    
    setSearchParams(searchParams);
  };

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const numValue = parseInt(value) || 0;
    setPriceRange(prev => ({
      ...prev,
      [type]: numValue
    }));
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchQuery) {
      searchParams.set('q', searchQuery);
    } else {
      searchParams.delete('q');
    }
    
    setSearchParams(searchParams);
  };

  if (isLoading) {
    return <Loader fullScreen text="Loading products..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters - Desktop */}
        <aside className="w-full md:w-64 hidden md:block">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold mb-4">Filters</h2>
            
            {/* Search - Desktop */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Search</h3>
              <form onSubmit={handleSearch}>
                <div className="flex items-center border rounded-md overflow-hidden">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 p-2 text-sm focus:outline-none"
                    placeholder="Search products..."
                  />
                  <button type="submit" className="bg-gray-100 p-2">
                    <Search size={18} />
                  </button>
                </div>
              </form>
            </div>
            
            {/* Categories */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === category.id}
                      onChange={() => handleCategoryChange(category.id)}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2 text-gray-700">{category.name}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Price Range */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Price Range</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500">Min ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={priceRange.min}
                    onChange={(e) => handlePriceChange('min', e.target.value)}
                    className="w-full p-2 border rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Max ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={priceRange.max}
                    onChange={(e) => handlePriceChange('max', e.target.value)}
                    className="w-full p-2 border rounded-md text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Mobile Filters Toggle & Search */}
          <div className="md:hidden mb-4">
            <div className="flex flex-col space-y-4">
              <form onSubmit={handleSearch} className="flex items-center border rounded-md overflow-hidden">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 p-2 text-sm focus:outline-none"
                  placeholder="Search products..."
                />
                <button type="submit" className="bg-gray-100 p-2">
                  <Search size={18} />
                </button>
              </form>
              
              <button
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className="flex items-center justify-between w-full bg-white rounded-md shadow-sm p-3"
              >
                <div className="flex items-center">
                  <SlidersHorizontal size={18} className="mr-2" />
                  <span>Filters & Sort</span>
                </div>
                <ChevronDown size={18} className={mobileFiltersOpen ? "transform rotate-180" : ""} />
              </button>
            </div>
            
            {/* Mobile Filters Panel */}
            {mobileFiltersOpen && (
              <div className="bg-white rounded-lg shadow-md p-4 mt-2">
                {/* Categories */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2">Categories</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <label key={category.id} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          checked={selectedCategory === category.id}
                          onChange={() => handleCategoryChange(category.id)}
                          className="form-radio h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2 text-gray-700">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Price Range */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2">Price Range</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500">Min ($)</label>
                      <input
                        type="number"
                        min="0"
                        value={priceRange.min}
                        onChange={(e) => handlePriceChange('min', e.target.value)}
                        className="w-full p-2 border rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Max ($)</label>
                      <input
                        type="number"
                        min="0"
                        value={priceRange.max}
                        onChange={(e) => handlePriceChange('max', e.target.value)}
                        className="w-full p-2 border rounded-md text-sm"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Sort By */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Sort By</h3>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="w-full p-2 border rounded-md text-sm"
                  >
                    <option value="default">Default</option>
                    <option value="price-low-high">Price: Low to High</option>
                    <option value="price-high-low">Price: High to Low</option>
                    <option value="name-a-z">Name: A to Z</option>
                    <option value="name-z-a">Name: Z to A</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Products Section */}
          <div>
            {/* Header with results count and sorting */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-2 sm:mb-0">
                {searchQuery 
                  ? `Search Results for "${searchQuery}"` 
                  : selectedCategory !== 'all' 
                    ? `${categories.find(c => c.id === selectedCategory)?.name}` 
                    : 'All Products'}
              </h1>
              
              <div className="flex items-center">
                <span className="text-gray-600 mr-2 hidden md:inline">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="border rounded-md p-2 text-sm hidden md:block"
                >
                  <option value="default">Default</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                  <option value="name-a-z">Name: A to Z</option>
                  <option value="name-z-a">Name: Z to A</option>
                </select>
              </div>
            </div>
            
            {/* Results count */}
            <p className="text-sm text-gray-500 mb-4">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
            </p>
            
            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-xl font-medium text-gray-700 mb-2">No products found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;