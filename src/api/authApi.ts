import { supabase } from '../lib/supabase';
import { User, ApiResponse } from '../types';

export const login = async (email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: 'Login failed' };
    }

    // Get user profile from users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      // If user doesn't exist in users table, create them
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
            raw_user_meta_data: { isAdmin: false }
          }
        ])
        .select()
        .single();

      if (createError) {
        return { success: false, error: 'Failed to create user profile' };
      }

      const user: User = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        isAdmin: (newUser.raw_user_meta_data as any)?.isAdmin || false
      };

      return {
        success: true,
        data: {
          user,
          token: data.session?.access_token || ''
        }
      };
    }

    const user: User = {
      id: userProfile.id,
      name: userProfile.name,
      email: userProfile.email,
      isAdmin: (userProfile.raw_user_meta_data as any)?.isAdmin || false
    };

    return {
      success: true,
      data: {
        user,
        token: data.session?.access_token || ''
      }
    };
  } catch (error) {
    return { success: false, error: 'Login failed' };
  }
};

export const register = async (name: string, email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        }
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: 'Registration failed' };
    }

    // Create user profile in users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: data.user.id,
          email: data.user.email || '',
          name: name,
          raw_user_meta_data: { isAdmin: false }
        }
      ])
      .select()
      .single();

    if (profileError) {
      return { success: false, error: 'Failed to create user profile' };
    }

    const user: User = {
      id: userProfile.id,
      name: userProfile.name,
      email: userProfile.email,
      isAdmin: (userProfile.raw_user_meta_data as any)?.isAdmin || false
    };

    return {
      success: true,
      data: {
        user,
        token: data.session?.access_token || ''
      }
    };
  } catch (error) {
    return { success: false, error: 'Registration failed' };
  }
};

export const logout = async (): Promise<ApiResponse<null>> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Logout failed' };
  }
};

export const getCurrentUser = async (): Promise<ApiResponse<User>> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return { success: false, error: 'No user logged in' };
    }

    // Get user profile from users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return { success: false, error: 'Failed to fetch user profile' };
    }

    if (!userProfile) {
      return { success: false, error: 'User profile not found' };
    }

    const userData: User = {
      id: userProfile.id,
      name: userProfile.name,
      email: userProfile.email,
      isAdmin: (userProfile.raw_user_meta_data as any)?.isAdmin || false
    };

    return { success: true, data: userData };
  } catch (error) {
    return { success: false, error: 'Failed to fetch user profile' };
  }
};