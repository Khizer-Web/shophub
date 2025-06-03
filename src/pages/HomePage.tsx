import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getProducts } from '../api/productApi';
import ProductCard from '../components/ui/ProductCard';
import Loader from '../components/ui/Loader';
import { Product } from '../types';
import { categories } from '../data/mockData';

const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      const response = await getProducts();
      
      if (response.success && response.data) {
        // Simulate featured products (first 4)
        setFeaturedProducts(response.data.slice(0, 4));
        
        // Simulate new arrivals (last 3)
        setNewArrivals(response.data.slice(-3));
      }
      
      setIsLoading(false);
    };
    
    fetchProducts();
  }, []);
  
  if (isLoading) {
    return <Loader fullScreen text="Loading products..." />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-blue-600 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Shop the Latest Trends</h1>
            <p className="text-lg md:text-xl mb-8">Discover our curated collection of premium products at unbeatable prices.</p>
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/products" 
                className="bg-white text-blue-600 px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition"
              >
                Shop Now
              </Link>
              <Link 
                to="/about" 
                className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-md font-semibold hover:bg-white/10 transition"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-16 bg-gray-50 clip-hero"></div>
      </section>
      
      {/* Categories Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Shop by Category</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.filter(cat => cat.id !== "all").map((category) => (
              <Link 
                key={category.id}
                to={`/products?category=${category.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition group"
              >
                <div className="p-6 text-center">
                  <h3 className="text-lg font-medium text-gray-800 group-hover:text-blue-600 transition">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured Products */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Featured Products</h2>
            <Link 
              to="/products" 
              className="flex items-center text-blue-600 hover:text-blue-800 transition"
            >
              View All <ArrowRight size={18} className="ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
      
      {/* New Arrivals Banner */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">New Arrivals</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-12 md:py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Newsletter</h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Stay updated with the latest products and exclusive deals by subscribing to our newsletter.
          </p>
          <form className="max-w-md mx-auto flex">
            <input 
              type="email" 
              placeholder="Your email address"
              className="flex-1 px-4 py-3 rounded-l-md text-gray-800 focus:outline-none"
            />
            <button 
              type="submit"
              className="bg-gray-800 text-white px-6 py-3 rounded-r-md font-semibold hover:bg-gray-700 transition"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default HomePage;