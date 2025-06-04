import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Users, ShoppingBag, BarChart2, Plus, Edit, Trash2, Search, Eye, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/productApi';
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

interface ProductFormData {
  title: string;
  description: string;
  price: string;
  image: string;
  stock: string;
  category: string;
}

const initialProductForm: ProductFormData = {
  title: '',
  description: '',
  price: '',
  image: '',
  stock: '',
  category: ''
};

// Add DashboardContent component
const DashboardContent: React.FC<{ products: Product[] }> = ({ products }) => {
  const totalProducts = products.length;
  const totalOrders = mockOrders.length;
  const totalUsers = mockUsers.length;
  const lowStockProducts = products.filter(p => p.stock < 10).length;

  const stats = [
    { title: 'Total Products', value: totalProducts, icon: Package, color: 'bg-blue-500' },
    { title: 'Total Orders', value: totalOrders, icon: ShoppingBag, color: 'bg-green-500' },
    { title: 'Total Users', value: totalUsers, icon: Users, color: 'bg-purple-500' },
    { title: 'Low Stock Items', value: lowStockProducts, icon: BarChart2, color: 'bg-red-500' }
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className={`inline-flex p-3 rounded-lg ${stat.color}`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mt-4">{stat.title}</h3>
            <p className="text-3xl font-bold mt-2">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Add OrdersContent component
const OrdersContent: React.FC<{
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}> = ({ searchQuery, setSearchQuery }) => {
  const filteredOrders = mockOrders.filter(order => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      order.id.toString().includes(query) ||
      order.status.toLowerCase().includes(query) ||
      order.user_email.toLowerCase().includes(query)
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
                Customer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{order.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.user_email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    order.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : order.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${order.total.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    className="text-blue-600 hover:text-blue-900"
                    title="View order details"
                  >
                    <Eye size={18} />
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

// Add UsersContent component
const UsersContent: React.FC<{
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}> = ({ searchQuery, setSearchQuery }) => {
  const filteredUsers = mockUsers.filter(user => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      user.email.toLowerCase().includes(query) ||
      user.name.toLowerCase().includes(query) ||
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
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
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
                    <div className="h-10 w-10 flex-shrink-0">
                      <img className="h-10 w-10 rounded-full" src={user.avatar} alt="" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.isAdmin
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.isAdmin ? 'Admin' : 'User'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    className="text-blue-600 hover:text-blue-900"
                    title="View user details"
                  >
                    <Eye size={18} />
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

const AdminDashboard: React.FC = () => {
  const { isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<AdminTab>(AdminTab.Dashboard);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<ProductFormData>(initialProductForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
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

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const newProduct = {
        title: productForm.title,
        description: productForm.description,
        price: parseFloat(productForm.price),
        image: productForm.image,
        stock: parseInt(productForm.stock),
        category: productForm.category
      };

      const response = await createProduct(newProduct);

      if (response.success && response.data) {
        setProducts([response.data, ...products]);
        setIsAddProductModalOpen(false);
        setProductForm(initialProductForm);
      } else {
        setError(response.error || 'Failed to create product');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const updates = {
        title: productForm.title,
        description: productForm.description,
        price: parseFloat(productForm.price),
        image: productForm.image,
        stock: parseInt(productForm.stock),
        category: productForm.category
      };

      const response = await updateProduct(selectedProduct.id, updates);

      if (response.success && response.data) {
        setProducts(products.map(p => p.id === selectedProduct.id ? response.data : p));
        setIsEditProductModalOpen(false);
        setSelectedProduct(null);
        setProductForm(initialProductForm);
      } else {
        setError(response.error || 'Failed to update product');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    setError(null);

    try {
      const response = await deleteProduct(productId);

      if (response.success) {
        setProducts(products.filter(p => p.id !== productId));
      } else {
        setError(response.error || 'Failed to delete product');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setProductForm({
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      image: product.image,
      stock: product.stock.toString(),
      category: product.category
    });
    setIsEditProductModalOpen(true);
  };

  const renderContent = () => {
    if (isLoading) {
      return <Loader text="Loading data..." />;
    }
    
    if (error) {
      return <Alert type="error" message={error} onClose={() => setError(null)} />;
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

  const ProductModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => Promise<void>;
    title: string;
  }> = ({ isOpen, onClose, onSubmit, title }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{title}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={productForm.title}
                onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                className="w-full p-2 border rounded-md"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                <input
                  type="number"
                  name="price"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                <input
                  type="number"
                  name="stock"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  min="0"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="url"
                name="image"
                value={productForm.image}
                onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="category"
                value={productForm.category}
                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Select a category</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="accessories">Accessories</option>
                <option value="footwear">Footwear</option>
                <option value="home">Home</option>
                <option value="fitness">Fitness</option>
              </select>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <Button
                variant="outline"
                onClick={onClose}
                type="button"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                isLoading={isSubmitting}
                leftIcon={<Save size={18} />}
              >
                {title === 'Add Product' ? 'Create Product' : 'Update Product'}
              </Button>
            </div>
          </form>
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Manage Products</h2>
          <Button
            variant="primary"
            leftIcon={<Plus size={18} />}
            onClick={() => {
              setProductForm(initialProductForm);
              setIsAddProductModalOpen(true);
            }}
          >
            Add Product
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
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
                    <button
                      onClick={() => openEditModal(product)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="Edit product"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete product"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Product Modal */}
        <ProductModal
          isOpen={isAddProductModalOpen}
          onClose={() => setIsAddProductModalOpen(false)}
          onSubmit={handleAddProduct}
          title="Add Product"
        />

        {/* Edit Product Modal */}
        <ProductModal
          isOpen={isEditProductModalOpen}
          onClose={() => setIsEditProductModalOpen(false)}
          onSubmit={handleEditProduct}
          title="Edit Product"
        />
      </div>
    );
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
                onClick={() => {
                  setProductForm(initialProductForm);
                  setIsAddProductModalOpen(true);
                }}
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

export default AdminDashboard;