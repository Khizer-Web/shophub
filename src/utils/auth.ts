import { User } from '../types';
import { supabase } from '../lib/supabase';

export const getAuthToken = async (): Promise<string | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
};

export const isAuthenticated = async (): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data: userProfile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) return null;

    return {
      id: userProfile.id,
      name: userProfile.name,
      email: userProfile.email,
      isAdmin: userProfile.raw_user_meta_data?.isAdmin || false
    };
  } catch (error) {
    return null;
  }
};

export const isAdmin = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return user ? user.isAdmin : false;
};

// Legacy functions for backward compatibility (now async)
export const setAuthToken = (token: string): void => {
  // No longer needed as Supabase handles token management
};

export const removeAuthToken = (): void => {
  // No longer needed as Supabase handles token management
};