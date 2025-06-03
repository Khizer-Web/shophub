import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Package, Truck } from 'lucide-react';
import { getOrderById } from '../api/orderApi';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import { Order } from '../types';

const OrderConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    const fetchOrderDetails = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      const orderId = parseInt(id);
      const response = await getOrderById(orderId);
      
      if (response.success && response.data) {
        setOrder(response.data);
      } else {
        setError(response.error || 'Failed to load order details');
      }
      
      setIsLoading(false);
    };
    
    fetchOrderDetails();
  }, [id, isAuthenticated, navigate]);
  
  if (isLoading) {
    return <Loader fullScreen text="Loading order details..." />;
  }
  
  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-6">{error || "We couldn't find the order you're looking for."}</p>
          <Link to="/orders">
            <Button variant="primary">View Your Orders</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">
            Thank you for your order. Your order number is <span className="font-semibold">{order.id}</span>.
          </p>
        </div>
        
        <div className="border-t border-gray-200 pt-6 mb-6">
          <div className="flex justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Order Summary</h2>
            <p className="text-gray-600">Placed on {orderDate}</p>
          </div>
          
          <div className="mb-6">
            <ul className="divide-y divide-gray-200">
              {order.items.map((item) => (
                <li key={item.id} className="py-4 flex">
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                    <img 
                      src={item.product?.image} 
                      alt={item.product?.title || `Product ${item.productId}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between">
                      <h3 className="text-sm font-medium text-gray-800">
                        {item.product?.title || `Product ${item.productId}`}
                      </h3>
                      <p className="text-sm font-medium text-gray-800">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex justify-between mt-1">
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="border-t border-gray-200 pt-4 pb-2">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-800">${order.totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Shipping</span>
              <span className="text-gray-800">
                {order.totalPrice > 50 ? (
                  <span className="text-green-600">Free</span>
                ) : (
                  "$5.00"
                )}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Tax</span>
              <span className="text-gray-800">${(order.totalPrice * 0.08).toFixed(2)}</span>
            </div>
            <div className="flex justify-between mt-4 pt-4 border-t font-bold">
              <span>Total</span>
              <span>${(order.totalPrice + (order.totalPrice > 50 ? 0 : 5) + order.totalPrice * 0.08).toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        {/* Order Status */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-md font-semibold text-gray-800 mb-3">Order Status</h3>
          <div className="flex items-center">
            <div className="relative flex items-center justify-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${order.status !== 'pending' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}>
                <Package size={16} />
              </div>
              <div className={`h-1 w-16 absolute right-0 top-4 transform translate-x-full ${order.status !== 'pending' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            </div>
            <div className="relative flex items-center justify-center mx-12">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${(order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered') ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                <Truck size={16} />
              </div>
              <div className={`h-1 w-16 absolute right-0 top-4 transform translate-x-full ${(order.status === 'shipped' || order.status === 'delivered') ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            </div>
            <div className="relative flex items-center justify-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${order.status === 'delivered' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                <CheckCircle size={16} />
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className="text-blue-600">Order Placed</span>
            <span className={`${(order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered') ? 'text-blue-600' : 'text-gray-500'}`}>Processing</span>
            <span className={`${(order.status === 'shipped' || order.status === 'delivered') ? 'text-blue-600' : 'text-gray-500'}`}>Shipped</span>
            <span className={`${order.status === 'delivered' ? 'text-blue-600' : 'text-gray-500'}`}>Delivered</span>
          </div>
        </div>
        
        <div className="flex justify-between flex-wrap gap-4">
          <Link to="/orders">
            <Button variant="outline">View All Orders</Button>
          </Link>
          <Link to="/products">
            <Button variant="primary" rightIcon={<ArrowRight size={16} />}>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;