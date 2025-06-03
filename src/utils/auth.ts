import { User } from '../types';

export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('authToken');
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem('user');
  return userJson ? JSON.parse(userJson) : null;
};

export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user ? user.isAdmin : false;
};