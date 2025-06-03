import apiClient from './apiClient';
import { Product, ApiResponse } from '../types';
import { mockProducts } from '../data/mockData';

// In a real app, these would make actual API calls to the PHP backend
// For demo purposes, we'll use the mock data

export const getProducts = async (): Promise<ApiResponse<Product[]>> => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, data: mockProducts };
    
    // In production:
    // const response = await apiClient.get('/products');
    // return response.data;
  } catch (error) {
    return { success: false, error: 'Failed to fetch products' };
  }
};

export const getProductById = async (id: number): Promise<ApiResponse<Product>> => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    const product = mockProducts.find(p => p.id === id);
    
    if (!product) {
      return { success: false, error: 'Product not found' };
    }
    
    return { success: true, data: product };
    
    // In production:
    // const response = await apiClient.get(`/product/${id}`);
    // return response.data;
  } catch (error) {
    return { success: false, error: 'Failed to fetch product details' };
  }
};

export const getProductsByCategory = async (category: string): Promise<ApiResponse<Product[]>> => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 400));
    const filteredProducts = mockProducts.filter(p => p.category === category);
    
    return { success: true, data: filteredProducts };
    
    // In production:
    // const response = await apiClient.get(`/products?category=${category}`);
    // return response.data;
  } catch (error) {
    return { success: false, error: 'Failed to fetch products by category' };
  }
};