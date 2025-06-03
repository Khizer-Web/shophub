import apiClient from './apiClient';
import { Order, ApiResponse } from '../types';
import { mockOrders } from '../data/mockData';
import { getCart, clearCart } from './cartApi';

// In a real app, these would make actual API calls to the PHP backend
// For demo purposes, we'll simulate with localStorage

export const createOrder = async (shippingAddress: string, paymentMethod: string): Promise<ApiResponse<Order>> => {
  try {
    // Get the current cart
    const cartResponse = await getCart();
    
    if (!cartResponse.success || !cartResponse.data || cartResponse.data.length === 0) {
      return { success: false, error: 'Cannot create order with empty cart' };
    }
    
    // Calculate the total price
    const totalPrice = cartResponse.data.reduce(
      (total, item) => total + item.product.price * item.quantity, 
      0
    );
    
    // Get the current user
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}') : null;
    
    if (!user) {
      return { success: false, error: 'User not logged in' };
    }
    
    // Create the new order
    const newOrder: Order = {
      id: Date.now(),
      userId: user.id,
      totalPrice,
      status: 'pending',
      createdAt: new Date().toISOString(),
      items: cartResponse.data.map(item => ({
        id: Date.now() + item.product.id,
        orderId: Date.now(),
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
        product: item.product
      }))
    };
    
    // Store in localStorage for the demo
    const existingOrders: Order[] = localStorage.getItem('orders')
      ? JSON.parse(localStorage.getItem('orders') || '[]')
      : [];
    
    existingOrders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(existingOrders));
    
    // Clear the cart after order creation
    await clearCart();
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true, data: newOrder };
    
    // In production:
    // const response = await apiClient.post('/orders', { 
    //   shippingAddress, 
    //   paymentMethod,
    //   items: cartResponse.data.map(item => ({
    //     productId: item.product.id,
    //     quantity: item.quantity,
    //     price: item.product.price
    //   }))
    // });
    // return response.data;
  } catch (error) {
    return { success: false, error: 'Failed to create order' };
  }
};

export const getUserOrders = async (): Promise<ApiResponse<Order[]>> => {
  try {
    // Get the current user
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}') : null;
    
    if (!user) {
      return { success: false, error: 'User not logged in' };
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Get orders from localStorage or mock data
    let userOrders = localStorage.getItem('orders')
      ? JSON.parse(localStorage.getItem('orders') || '[]')
      : [];
      
    // If no orders in localStorage, use mock data
    if (userOrders.length === 0) {
      userOrders = mockOrders.filter(order => order.userId === user.id);
    } else {
      userOrders = userOrders.filter((order: Order) => order.userId === user.id);
    }
    
    return { success: true, data: userOrders };
    
    // In production:
    // const response = await apiClient.get('/orders');
    // return response.data;
  } catch (error) {
    return { success: false, error: 'Failed to fetch user orders' };
  }
};

export const getOrderById = async (orderId: number): Promise<ApiResponse<Order>> => {
  try {
    // Get the order from localStorage or mock data
    let orders = localStorage.getItem('orders')
      ? JSON.parse(localStorage.getItem('orders') || '[]')
      : mockOrders;
      
    const order = orders.find((o: Order) => o.id === orderId);
    
    if (!order) {
      return { success: false, error: 'Order not found' };
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return { success: true, data: order };
    
    // In production:
    // const response = await apiClient.get(`/orders/${orderId}`);
    // return response.data;
  } catch (error) {
    return { success: false, error: 'Failed to fetch order details' };
  }
};