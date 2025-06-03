import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { getCurrentUser as fetchCurrentUser } from '../api/authApi';
import { isAuthenticated as checkAuth, getCurrentUser as getLocalUser } from '../utils/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,
  setUser: () => {},
  logout: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadUser = async () => {
      if (checkAuth()) {
        // Try to get user from localStorage first for immediate UI update
        const localUser = getLocalUser();
        if (localUser) {
          setUser(localUser);
        }
        
        // Then verify with API
        const response = await fetchCurrentUser();
        if (response.success && response.data) {
          setUser(response.data);
        } else {
          // If API call fails, clear user state
          setUser(null);
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const logout = async (): Promise<void> => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin || false,
        isLoading,
        setUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);