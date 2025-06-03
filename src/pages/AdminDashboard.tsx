import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Users, ShoppingBag, BarChart2, Plus, Edit, Trash2, Search, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getProducts } from '../api/productApi';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import Alert from '../components/ui/Alert';
import { Product } from '../types';
import { mockOrders, mockUsers } from '../data/mockData';

enum AdminTab {
  Dashboard = 'dashboard',
  Products = 'products',
  Orders = 'orders',
  Users = 'users'
}

const AdminDashboard: React.FC = () => {
  const { isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<AdminTab>(AdminTab.Dashboard);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    // Redirect if not authenticated or not an admin
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!isAdmin) {
      navigate('/');
      return;
    }
    
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const productsResponse = await getProducts();
        
        if (productsResponse.success && productsResponse.data) {
          setProducts(productsResponse.data);
        } else {
          setError(productsResponse.error || 'Failed to load products');
        }
      } catch (err) {
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [isAdmin, isAuthenticated, navigate]);
  
  const renderContent = () => {
    if (isLoading) {
      return <Loader text="Loading data..." />;
    }
    
    if (error) {
      return <Alert type="error\" message={error} onClose={() => setError(null)} />;
    }
    
    switch (activeTab) {
      case AdminTab.Dashboard:
        return <DashboardContent products={products} />;
      case AdminTab.Products:
        return <ProductsContent products={products} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />;
      case AdminTab.Orders:
        return <OrdersContent searchQuery={searchQuery} setSearchQuery={setSearchQuery} />;
      case AdminTab.Users:
        return <UsersContent searchQuery={searchQuery} setSearchQuery={setSearchQuery} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
        
        {/* Tabs */}
        <div className="bg-white rounded-t-lg shadow-sm mb-6">
          <div className="flex overflow-x-auto">
            <button
              className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === AdminTab.Dashboard
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab(AdminTab.Dashboard)}
            >
              <BarChart2 className="h-5 w-5 mr-2" />
              Dashboard
            </button>
            
            <button
              className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === AdminTab.Products
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab(AdminTab.Products)}
            >
              <Package className="h-5 w-5 mr-2" />
              Products
            </button>
            
            <button
              className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === AdminTab.Orders
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab(AdminTab.Orders)}
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              Orders
            </button>
            
            <button
              className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === AdminTab.Users
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab(AdminTab.Users)}
            >
              <Users className="h-5 w-5 mr-2" />
              Users
            </button>
          </div>
        </div>
        
        {/* Search Bar for Products, Orders and Users tabs */}
        {activeTab !== AdminTab.Dashboard && (
          <div className="mb-6 flex justify-between items-center">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 pl-10 border border-gray-300 rounded-md"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            
            {activeTab === AdminTab.Products && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus size={16} />}
              >
                Add Product
              </Button>
            )}
          </div>
        )}
        
        {/* Content Area */}
        <div className="bg-white rounded-b-lg shadow-md p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

const DashboardContent: React.FC<{ products: Product[] }> = ({ products }) => {
  const totalProducts = products.length;
  const totalOrders = mockOrders.length;
  const totalUsers = mockUsers.length;
  const totalRevenue = mockOrders.reduce((sum, order) => sum + order.totalPrice, 0);
  
  const stats = [
    { name: 'Total Products', value: totalProducts, icon: <Package className="h-6 w-6 text-blue-500" /> },
    { name: 'Total Orders', value: totalOrders, icon: <ShoppingBag className="h-6 w-6 text-green-500" /> },
    { name: 'Total Users', value: totalUsers, icon: <Users className="h-6 w-6 text-purple-500" /> },
    { name: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: <BarChart2 className="h-6 w-6 text-orange-500" /> },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Overview</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gray-50">
                {stat.icon}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Recent Orders */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockOrders.slice(0, 5).map((order) => {
                const date = new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                });
                
                const customer = mockUsers.find(user => user.id === order.userId)?.name || 'Unknown';
                
                const statusClasses = {
                  pending: 'bg-yellow-100 text-yellow-800',
                  processing: 'bg-blue-100 text-blue-800',
                  shipped: 'bg-purple-100 text-purple-800',
                  delivered: 'bg-green-100 text-green-800'
                }[order.status];
                
                return (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${order.totalPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Low Stock Products */}
      <div>
        <h3 className="text-lg font-medium mb-4">Low Stock Products</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products
                .filter(product => product.stock < 20)
                .sort((a, b) => a.stock - b.stock)
                .slice(0, 5)
                .map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img className="h-10 w-10 rounded-md object-cover" src={product.image} alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 line-clamp-1">{product.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      #{product.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.stock === 0
                          ? 'bg-red-100 text-red-800'
                          : product.stock < 10
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ProductsContent: React.FC<{ 
  products: Product[]; 
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}> = ({ products, searchQuery, setSearchQuery }) => {
  const filteredProducts = products.filter(product => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      product.title.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.id.toString().includes(query)
    );
  });

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Manage Products</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <img className="h-10 w-10 rounded-md object-cover" src={product.image} alt="" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{product.title}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  #{product.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${product.price.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    product.stock === 0
                      ? 'bg-red-100 text-red-800'
                      : product.stock < 10
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">
                    <Edit size={18} />
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const OrdersContent: React.FC<{ 
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}> = ({ searchQuery, setSearchQuery }) => {
  // Filter orders based on search query
  const filteredOrders = mockOrders.filter(order => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      order.id.toString().includes(query) ||
      order.status.toLowerCase().includes(query) ||
      order.totalPrice.toString().includes(query)
    );
  });

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Manage Orders</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map((order) => {
              const date = new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });
              
              const customer = mockUsers.find(user => user.id === order.userId)?.name || 'Unknown';
              
              const statusClasses = {
                pending: 'bg-yellow-100 text-yellow-800',
                processing: 'bg-blue-100 text-blue-800',
                shipped: 'bg-purple-100 text-purple-800',
                delivered: 'bg-green-100 text-green-800'
              }[order.status];
              
              return (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${order.totalPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      <Edit size={18} />
                    </button>
                    <button className="text-blue-600 hover:text-blue-900">
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const UsersContent: React.FC<{ 
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}> = ({ searchQuery, setSearchQuery }) => {
  // Filter users based on search query
  const filteredUsers = mockUsers.filter(user => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.id.toString().includes(query)
    );
  });

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Manage Users</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="font-medium text-gray-600">{user.name.charAt(0)}</span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  #{user.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.isAdmin 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user.isAdmin ? 'Admin' : 'Customer'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">
                    <Edit size={18} />
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;