import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PackageOpen, Eye, ArrowRight, Search } from 'lucide-react';
import { getUserOrders } from '../api/orderApi';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import Alert from '../components/ui/Alert';
import { Order } from '../types';

const OrdersPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/orders' } });
      return;
    }
    
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      
      const response = await getUserOrders();
      
      if (response.success && response.data) {
        setOrders(response.data);
      } else {
        setError(response.error || 'Failed to load orders');
      }
      
      setIsLoading(false);
    };
    
    fetchOrders();
  }, [isAuthenticated, navigate]);
  
  // Filter orders based on search
  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const orderId = order.id.toString().toLowerCase();
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-US').toLowerCase();
    
    return orderId.includes(query) || orderDate.includes(query) || order.status.includes(query);
  });
  
  // Sort orders by date (newest first)
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (isLoading) {
    return <Loader fullScreen text="Loading your orders..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Orders</h1>
        
        {error && (
          <Alert 
            type="error" 
            message={error} 
            onClose={() => setError(null)}
          />
        )}
        
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="flex justify-center mb-4">
              <PackageOpen size={64} className="text-gray-300" />
            </div>
            <h2 className="text-xl font-medium text-gray-800 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">You haven't placed any orders with us yet.</p>
            <Link to="/products">
              <Button variant="primary" rightIcon={<ArrowRight size={16} />}>
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Search and Filter */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search orders by ID, date, or status..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-3 pl-10 border border-gray-300 rounded-md"
                />
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              </div>
            </div>
            
            {/* Orders List */}
            <div className="space-y-4">
              {sortedOrders.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <p className="text-gray-600">No orders match your search.</p>
                </div>
              ) : (
                sortedOrders.map((order) => {
                  // Format date
                  const date = new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  });
                  
                  // Get status color
                  const statusColor = {
                    pending: 'bg-yellow-100 text-yellow-800',
                    processing: 'bg-blue-100 text-blue-800',
                    shipped: 'bg-purple-100 text-purple-800',
                    delivered: 'bg-green-100 text-green-800'
                  }[order.status];
                  
                  return (
                    <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="p-4 md:p-6">
                        <div className="flex flex-col md:flex-row justify-between mb-4">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Order #{order.id}</p>
                            <p className="text-sm text-gray-500">Placed on {date}</p>
                          </div>
                          <div className="mt-2 md:mt-0 md:text-right">
                            <p className="font-medium text-gray-800">${order.totalPrice.toFixed(2)}</p>
                            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mt-1 ${statusColor}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-200 pt-4">
                          <h3 className="text-sm font-medium text-gray-700 mb-3">Items</h3>
                          <ul className="space-y-3">
                            {order.items.slice(0, 2).map((item) => (
                              <li key={item.id} className="flex items-center">
                                <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                                  <img 
                                    src={item.product?.image} 
                                    alt={item.product?.title || `Product ${item.productId}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="ml-3 flex-1">
                                  <h4 className="text-sm font-medium text-gray-800 line-clamp-1">
                                    {item.product?.title || `Product ${item.productId}`}
                                  </h4>
                                  <p className="text-xs text-gray-500">
                                    Qty: {item.quantity} × ${item.price.toFixed(2)}
                                  </p>
                                </div>
                              </li>
                            ))}
                            {order.items.length > 2 && (
                              <li className="text-sm text-gray-500">
                                +{order.items.length - 2} more items
                              </li>
                            )}
                          </ul>
                        </div>
                        
                        <div className="mt-4 text-right">
                          <Link to={`/order-confirmation/${order.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              rightIcon={<Eye size={16} />}
                            >
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;