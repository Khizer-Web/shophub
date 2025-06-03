import apiClient from './apiClient';
import { CartItem, ApiResponse, Product } from '../types';

// In a real app, these would make actual API calls to the PHP backend
// For demo purposes, we'll simulate with localStorage

export const getCart = async (): Promise<ApiResponse<CartItem[]>> => {
  try {
    // Get from localStorage for the demo
    const cartItems = localStorage.getItem('cart')
      ? JSON.parse(localStorage.getItem('cart') || '[]')
      : [];
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return { success: true, data: cartItems };
    
    // In production:
    // const response = await apiClient.get('/cart');
    // return response.data;
  } catch (error) {
    return { success: false, error: 'Failed to fetch cart items' };
  }
};

export const addToCart = async (product: Product, quantity: number): Promise<ApiResponse<CartItem[]>> => {
  try {
    // Get current cart
    let cartItems: CartItem[] = localStorage.getItem('cart')
      ? JSON.parse(localStorage.getItem('cart') || '[]')
      : [];
    
    // Check if item already exists in cart
    const existingItemIndex = cartItems.findIndex(item => item.product.id === product.id);
    
    if (existingItemIndex !== -1) {
      // Update quantity if item exists
      cartItems[existingItemIndex].quantity += quantity;
    } else {
      // Add new item if it doesn't exist
      cartItems.push({
        id: Date.now(), // Temporary ID for the cart item
        product,
        quantity
      });
    }
    
    // Save to localStorage for the demo
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return { success: true, data: cartItems };
    
    // In production:
    // const response = await apiClient.post('/cart', { productId: product.id, quantity });
    // return response.data;
  } catch (error) {
    return { success: false, error: 'Failed to add item to cart' };
  }
};

export const updateCartItem = async (itemId: number, quantity: number): Promise<ApiResponse<CartItem[]>> => {
  try {
    // Get current cart
    let cartItems: CartItem[] = localStorage.getItem('cart')
      ? JSON.parse(localStorage.getItem('cart') || '[]')
      : [];
    
    // Find the item
    const itemIndex = cartItems.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      return { success: false, error: 'Item not found in cart' };
    }
    
    // Update quantity
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      cartItems = cartItems.filter(item => item.id !== itemId);
    } else {
      cartItems[itemIndex].quantity = quantity;
    }
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return { success: true, data: cartItems };
    
    // In production:
    // const response = await apiClient.put(`/cart/${itemId}`, { quantity });
    // return response.data;
  } catch (error) {
    return { success: false, error: 'Failed to update cart item' };
  }
};

export const removeFromCart = async (itemId: number): Promise<ApiResponse<CartItem[]>> => {
  try {
    // Get current cart
    let cartItems: CartItem[] = localStorage.getItem('cart')
      ? JSON.parse(localStorage.getItem('cart') || '[]')
      : [];
    
    // Remove the item
    cartItems = cartItems.filter(item => item.id !== itemId);
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return { success: true, data: cartItems };
    
    // In production:
    // const response = await apiClient.delete(`/cart/${itemId}`);
    // return response.data;
  } catch (error) {
    return { success: false, error: 'Failed to remove item from cart' };
  }
};

export const clearCart = async (): Promise<ApiResponse<CartItem[]>> => {
  try {
    // Clear cart in localStorage
    localStorage.setItem('cart', JSON.stringify([]));
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return { success: true, data: [] };
    
    // In production:
    // const response = await apiClient.delete('/cart');
    // return response.data;
  } catch (error) {
    return { success: false, error: 'Failed to clear cart' };
  }
};