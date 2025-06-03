import apiClient from './apiClient';
import { User, ApiResponse } from '../types';
import { mockUsers } from '../data/mockData';

// In a real app, these would make actual API calls to the PHP backend
// For demo purposes, we'll simulate with localStorage

export const login = async (email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Find user in mock data
    const user = mockUsers.find(u => u.email === email);
    
    // Simulate authentication
    if (!user || password !== 'password123') { // Demo password is 'password123' for all users
      return { success: false, error: 'Invalid email or password' };
    }
    
    // Generate a fake token
    const token = `fake-jwt-token-${Date.now()}`;
    
    // Store in localStorage
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { 
      success: true, 
      data: {
        user,
        token
      }
    };
    
    // In production:
    // const response = await apiClient.post('/user/login', { email, password });
    // return response.data;
  } catch (error) {
    return { success: false, error: 'Login failed' };
  }
};

export const register = async (name: string, email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists
    if (mockUsers.some(u => u.email === email)) {
      return { success: false, error: 'Email already in use' };
    }
    
    // Create new user (in a real app, this would be done on the server)
    const newUser: User = {
      id: mockUsers.length + 1,
      name,
      email,
      isAdmin: false
    };
    
    // Generate a fake token
    const token = `fake-jwt-token-${Date.now()}`;
    
    // Store in localStorage
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(newUser));
    
    return { 
      success: true, 
      data: {
        user: newUser,
        token
      }
    };
    
    // In production:
    // const response = await apiClient.post('/user/register', { name, email, password });
    // return response.data;
  } catch (error) {
    return { success: false, error: 'Registration failed' };
  }
};

export const logout = async (): Promise<ApiResponse<null>> => {
  try {
    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return { success: true };
    
    // In production:
    // const response = await apiClient.post('/user/logout');
    // return response.data;
  } catch (error) {
    return { success: false, error: 'Logout failed' };
  }
};

export const getCurrentUser = async (): Promise<ApiResponse<User>> => {
  try {
    // Get from localStorage
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}') : null;
    
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return { success: true, data: user };
    
    // In production:
    // const response = await apiClient.get('/user/profile');
    // return response.data;
  } catch (error) {
    return { success: false, error: 'Failed to fetch user profile' };
  }
};