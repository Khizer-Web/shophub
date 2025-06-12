import { supabase } from '../lib/supabase';
import { Product, ApiResponse } from '../types';

export const getProducts = async (): Promise<ApiResponse<Product[]>> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Failed to fetch products' };
  }
};

export const getProductById = async (id: string): Promise<ApiResponse<Product>> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return { success: false, error: 'Product not found' };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Failed to fetch product details' };
  }
};

export const getProductsByCategory = async (category: string): Promise<ApiResponse<Product[]>> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Failed to fetch products by category' };
  }
};

export const createProduct = async (product: Omit<Product, 'id' | 'created_at'>): Promise<ApiResponse<Product>> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Failed to create product' };
  }
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<ApiResponse<Product>> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Failed to update product' };
  }
};

export const deleteProduct = async (id: string): Promise<ApiResponse<null>> => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete product' };
  }
};