import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Minus, Plus, ArrowLeft, Star, Truck, Shield } from 'lucide-react';
import { getProductById } from '../api/productApi';
import { useCart } from '../context/CartContext';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import Alert from '../components/ui/Alert';
import { Product } from '../types';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      const productId = parseInt(id);
      const response = await getProductById(productId);
      
      if (response.success && response.data) {
        setProduct(response.data);
      } else {
        setError(response.error || 'Failed to load product details');
      }
      
      setIsLoading(false);
    };
    
    fetchProduct();
  }, [id]);

  const handleQuantityChange = (value: number) => {
    if (value >= 1 && product && value <= product.stock) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      setQuantity(1); // Reset quantity after adding
    }
  };

  if (isLoading) {
    return <Loader fullScreen text="Loading product details..." />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert type="error" message={error} />
        <div className="mt-4">
          <Link 
            to="/products"
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert type="error" message="Product not found" />
        <div className="mt-4">
          <Link 
            to="/products"
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          to="/products"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Products
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 p-4 md:p-8">
          {/* Product Image - 2 columns on large screens */}
          <div className="lg:col-span-2">
            <div className="rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
              <img 
                src={product.image} 
                alt={product.title}
                className="w-full h-auto object-contain max-h-96"
              />
            </div>
          </div>
          
          {/* Product Details - 3 columns on large screens */}
          <div className="lg:col-span-3 flex flex-col">
            <div>
              <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded mb-2">
                {product.category}
              </span>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.title}</h1>
              
              {/* Ratings - Placeholder (would be dynamic in a real app) */}
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  <Star fill="currentColor" size={18} />
                  <Star fill="currentColor" size={18} />
                  <Star fill="currentColor" size={18} />
                  <Star fill="currentColor" size={18} />
                  <Star size={18} className="text-gray-300" />
                </div>
                <span className="ml-2 text-gray-600 text-sm">(24 reviews)</span>
              </div>
              
              <div className="text-2xl font-bold text-gray-800 mb-4">
                ${product.price.toFixed(2)}
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700">{product.description}</p>
              </div>
              
              {/* Stock Status */}
              <div className="mb-6">
                {product.stock > 10 ? (
                  <span className="text-green-600 font-semibold">In Stock ({product.stock} available)</span>
                ) : product.stock > 0 ? (
                  <span className="text-orange-500 font-semibold">Low Stock (Only {product.stock} left)</span>
                ) : (
                  <span className="text-red-500 font-semibold">Out of Stock</span>
                )}
              </div>
            </div>
            
            {/* Add to Cart Section */}
            {product.stock > 0 && (
              <div className="mt-auto">
                <div className="flex items-center mb-6">
                  <span className="mr-4 text-gray-700">Quantity:</span>
                  <div className="flex items-center border rounded-md">
                    <button 
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="px-3 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-12 text-center">{quantity}</span>
                    <button 
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.stock}
                      className="px-3 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <Button 
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleAddToCart}
                    leftIcon={<ShoppingCart size={18} />}
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            )}
            
            {/* Additional Info */}
            <div className="border-t border-gray-200 mt-8 pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <div className="mr-3 text-blue-600">
                  <Truck size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Free Delivery</h3>
                  <p className="text-sm text-gray-500">Free shipping on all orders over $50</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="mr-3 text-blue-600">
                  <Shield size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Warranty</h3>
                  <p className="text-sm text-gray-500">1 year warranty on all products</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;