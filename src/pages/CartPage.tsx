import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import Alert from '../components/ui/Alert';

const CartPage: React.FC = () => {
  const { cartItems, updateItem, removeItem, cartTotal, isLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleQuantityChange = (itemId: number, quantity: number) => {
    updateItem(itemId, quantity);
  };

  const handleRemoveItem = (itemId: number) => {
    removeItem(itemId);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      setError('Please log in to continue to checkout');
      return;
    }
    
    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }
    
    navigate('/checkout');
  };

  if (isLoading) {
    return <Loader fullScreen text="Loading your cart..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          to="/products"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={18} className="mr-2" />
          Continue Shopping
        </Link>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Cart</h1>
            
            {error && (
              <Alert 
                type="error" 
                message={error} 
                onClose={() => setError(null)}
              />
            )}
            
            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <div className="flex justify-center mb-4">
                  <ShoppingBag size={64} className="text-gray-300" />
                </div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">Your cart is empty</h3>
                <p className="text-gray-500 mb-6">Looks like you haven't added any products to your cart yet.</p>
                <Link to="/products">
                  <Button variant="primary">Start Shopping</Button>
                </Link>
              </div>
            ) : (
              <div>
                {/* Cart Headers - Desktop */}
                <div className="hidden md:grid md:grid-cols-12 gap-4 pb-2 border-b text-sm font-medium text-gray-500">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>
                
                {/* Cart Items */}
                <ul className="divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <li key={item.id} className="py-6">
                      <div className="grid md:grid-cols-12 gap-4">
                        {/* Product Info */}
                        <div className="md:col-span-6 flex items-center">
                          <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                            <img 
                              src={item.product.image} 
                              alt={item.product.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="ml-4 flex-1">
                            <h3 className="text-base font-medium text-gray-800">
                              <Link to={`/product/${item.product.id}`} className="hover:text-blue-600">
                                {item.product.title}
                              </Link>
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">{item.product.category}</p>
                            
                            {/* Mobile Price */}
                            <div className="md:hidden mt-1 flex justify-between">
                              <p className="text-sm font-medium text-gray-700">
                                ${item.product.price.toFixed(2)}
                              </p>
                              <p className="text-sm font-medium text-gray-900">
                                ${(item.product.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                            
                            {/* Mobile Remove Button */}
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="md:hidden mt-2 flex items-center text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={16} className="mr-1" />
                              <span className="text-sm">Remove</span>
                            </button>
                          </div>
                        </div>
                        
                        {/* Price - Desktop */}
                        <div className="hidden md:flex md:col-span-2 md:items-center md:justify-center">
                          <p className="text-sm font-medium text-gray-700">
                            ${item.product.price.toFixed(2)}
                          </p>
                        </div>
                        
                        {/* Quantity */}
                        <div className="md:col-span-2 flex items-center md:justify-center">
                          <div className="flex items-center border rounded-md">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="px-2 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-10 text-center text-sm">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.product.stock}
                              className="px-2 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                        
                        {/* Total - Desktop */}
                        <div className="hidden md:flex md:col-span-2 md:items-center md:justify-end">
                          <p className="text-sm font-medium text-gray-900">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        
                        {/* Remove Button - Desktop */}
                        <div className="hidden md:flex md:col-span-12 md:justify-end">
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="flex items-center text-sm text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} className="mr-1" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-800 font-medium">${cartTotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-800 font-medium">
                  {cartTotal > 50 ? (
                    <span className="text-green-600">Free</span>
                  ) : cartTotal > 0 ? (
                    "$5.00"
                  ) : (
                    "$0.00"
                  )}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="text-gray-800 font-medium">
                  ${cartTotal > 0 ? (cartTotal * 0.08).toFixed(2) : "0.00"}
                </span>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between font-bold">
                  <span className="text-gray-800">Total</span>
                  <span className="text-gray-900">
                    ${cartTotal > 0 
                      ? (cartTotal + (cartTotal > 50 ? 0 : 5) + cartTotal * 0.08).toFixed(2)
                      : "0.00"}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <Button 
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleCheckout}
                disabled={cartItems.length === 0}
              >
                Proceed to Checkout
              </Button>
            </div>
            
            {!isAuthenticated && cartItems.length > 0 && (
              <div className="mt-4 flex items-start p-3 bg-blue-50 rounded-md text-sm text-blue-800">
                <AlertCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p>Please <Link to="/login" className="font-semibold underline">sign in</Link> to your account to complete your purchase.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;