import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../api/orderApi';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import Alert from '../components/ui/Alert';

interface CheckoutForm {
  fullName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  paymentMethod: 'creditCard' | 'paypal';
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
}

const initialFormState: CheckoutForm = {
  fullName: '',
  email: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
  paymentMethod: 'creditCard',
  cardNumber: '',
  cardExpiry: '',
  cardCvc: ''
};

const CheckoutPage: React.FC = () => {
  const { cartItems, cartTotal, clearItems, isLoading: cartLoading } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const [form, setForm] = useState<CheckoutForm>(initialFormState);
  const [errors, setErrors] = useState<Partial<CheckoutForm>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If cart is empty, redirect to cart page
    if (!cartLoading && cartItems.length === 0) {
      navigate('/cart');
    }
    
    // If user is not authenticated, redirect to login
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
    }
    
    // Pre-fill email if user is logged in
    if (user) {
      setForm(prev => ({
        ...prev,
        email: user.email,
        fullName: user.name
      }));
    }
  }, [cartItems, cartLoading, isAuthenticated, navigate, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is changed
    if (errors[name as keyof CheckoutForm]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CheckoutForm> = {};
    
    // Required fields validation
    const requiredFields = [
      'fullName', 'email', 'address', 'city', 'state', 'zipCode', 'country'
    ] as const;
    
    requiredFields.forEach(field => {
      if (!form[field]) {
        newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`;
      }
    });
    
    // Email validation
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Credit card validation (only if credit card is selected)
    if (form.paymentMethod === 'creditCard') {
      if (!form.cardNumber) {
        newErrors.cardNumber = 'Card number is required';
      } else if (!/^\d{16}$/.test(form.cardNumber.replace(/\s/g, ''))) {
        newErrors.cardNumber = 'Please enter a valid 16-digit card number';
      }
      
      if (!form.cardExpiry) {
        newErrors.cardExpiry = 'Expiry date is required';
      } else if (!/^\d{2}\/\d{2}$/.test(form.cardExpiry)) {
        newErrors.cardExpiry = 'Please use MM/YY format';
      }
      
      if (!form.cardCvc) {
        newErrors.cardCvc = 'CVC is required';
      } else if (!/^\d{3,4}$/.test(form.cardCvc)) {
        newErrors.cardCvc = 'Please enter a valid CVC';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please correct the errors in the form');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const shippingAddress = `${form.address}, ${form.city}, ${form.state} ${form.zipCode}, ${form.country}`;
      const paymentMethod = form.paymentMethod;
      
      const response = await createOrder(shippingAddress, paymentMethod);
      
      if (response.success && response.data) {
        // Clear cart after successful order
        await clearItems();
        
        // Redirect to order confirmation page
        navigate(`/order-confirmation/${response.data.id}`);
      } else {
        setError(response.error || 'Failed to process your order');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const shippingCost = cartTotal > 50 ? 0 : 5;
  const taxAmount = cartTotal * 0.08;
  const totalAmount = cartTotal + shippingCost + taxAmount;

  if (cartLoading) {
    return <Loader fullScreen text="Loading checkout..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Checkout</h1>
        
        {error && (
          <Alert 
            type="error" 
            message={error} 
            onClose={() => setError(null)}
          />
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shipping & Customer Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Customer Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      className={`w-full p-2 border rounded-md ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className={`w-full p-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                </div>
              </div>
              
              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Shipping Address</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      className={`w-full p-2 border rounded-md ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      className={`w-full p-2 border rounded-md ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State / Province
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      className={`w-full p-2 border rounded-md ${errors.state ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP / Postal Code
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={form.zipCode}
                      onChange={handleChange}
                      className={`w-full p-2 border rounded-md ${errors.zipCode ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <select
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      className={`w-full p-2 border rounded-md ${errors.country ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      <option value="">Select a country</option>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="GB">United Kingdom</option>
                      <option value="AU">Australia</option>
                      {/* More countries would be added in a real app */}
                    </select>
                    {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                  </div>
                </div>
              </div>
              
              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Method</h2>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center mb-4">
                      <input
                        id="credit-card"
                        name="paymentMethod"
                        type="radio"
                        value="creditCard"
                        checked={form.paymentMethod === 'creditCard'}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="credit-card" className="ml-3 flex items-center text-gray-700">
                        <CreditCard className="mr-2" size={20} />
                        <span>Credit / Debit Card</span>
                      </label>
                    </div>
                    
                    {form.paymentMethod === 'creditCard' && (
                      <div className="pl-7 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Card Number
                          </label>
                          <input
                            type="text"
                            name="cardNumber"
                            placeholder="1234 5678 9012 3456"
                            value={form.cardNumber}
                            onChange={handleChange}
                            maxLength={19}
                            className={`w-full p-2 border rounded-md ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'}`}
                          />
                          {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Expiry Date (MM/YY)
                            </label>
                            <input
                              type="text"
                              name="cardExpiry"
                              placeholder="MM/YY"
                              value={form.cardExpiry}
                              onChange={handleChange}
                              maxLength={5}
                              className={`w-full p-2 border rounded-md ${errors.cardExpiry ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors.cardExpiry && <p className="text-red-500 text-xs mt-1">{errors.cardExpiry}</p>}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              CVC
                            </label>
                            <input
                              type="text"
                              name="cardCvc"
                              placeholder="123"
                              value={form.cardCvc}
                              onChange={handleChange}
                              maxLength={4}
                              className={`w-full p-2 border rounded-md ${errors.cardCvc ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors.cardCvc && <p className="text-red-500 text-xs mt-1">{errors.cardCvc}</p>}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center">
                      <input
                        id="paypal"
                        name="paymentMethod"
                        type="radio"
                        value="paypal"
                        checked={form.paymentMethod === 'paypal'}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="paypal" className="ml-3 flex items-center text-gray-700">
                        <span className="font-bold text-blue-800">Pay</span><span className="font-bold text-blue-500">Pal</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
                
                <div className="max-h-80 overflow-y-auto mb-4">
                  <ul className="divide-y divide-gray-200">
                    {cartItems.map((item) => (
                      <li key={item.id} className="py-3 flex justify-between">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                            <img 
                              src={item.product.image} 
                              alt={item.product.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.product.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-gray-800">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-800 font-medium">${cartTotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-800 font-medium">
                      {cartTotal > 50 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        `$${shippingCost.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (8%)</span>
                    <span className="text-gray-800 font-medium">
                      ${taxAmount.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="border-t pt-4 mt-4 flex justify-between font-bold">
                    <span className="text-gray-800">Total</span>
                    <span className="text-gray-900">
                      ${totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button 
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    isLoading={isProcessing}
                  >
                    Complete Order
                  </Button>
                </div>
                
                <div className="mt-4 flex items-center justify-center text-xs text-gray-500">
                  <AlertCircle size={14} className="mr-1" />
                  <span>This is a demo checkout. No real payments will be processed.</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;