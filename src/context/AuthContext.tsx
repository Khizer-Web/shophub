import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

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
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        await loadUserProfile(session.user.id);
      }
      
      setIsLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        
        // If user doesn't exist in users table, create them
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (authUser) {
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert([
              {
                id: authUser.id,
                email: authUser.email || '',
                name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
                raw_user_meta_data: { isAdmin: false }
              }
            ])
            .select()
            .single();

          if (createError) {
            console.error('Error creating user profile:', createError);
            setUser(null);
            return;
          }

          const userData: User = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            isAdmin: (newUser.raw_user_meta_data as any)?.isAdmin || false
          };

          setUser(userData);
        }
        return;
      }

      if (!userProfile) {
        console.error('User profile not found');
        setUser(null);
        return;
      }

      const userData: User = {
        id: userProfile.id,
        name: userProfile.name,
        email: userProfile.email,
        isAdmin: (userProfile.raw_user_meta_data as any)?.isAdmin || false
      };

      setUser(userData);
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUser(null);
    }
  };

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
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