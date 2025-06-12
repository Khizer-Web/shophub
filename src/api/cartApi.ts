import { supabase } from '../lib/supabase';
import { CartItem, ApiResponse, Product } from '../types';

export const getCart = async (): Promise<ApiResponse<CartItem[]>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        products:product_id (
          id,
          title,
          description,
          price,
          image,
          stock,
          category,
          created_at
        )
      `)
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    const cartItems: CartItem[] = data.map((item: any) => ({
      id: item.id,
      quantity: item.quantity,
      product: item.products
    }));

    return { success: true, data: cartItems };
  } catch (error) {
    return { success: false, error: 'Failed to fetch cart items' };
  }
};

export const addToCart = async (product: Product, quantity: number): Promise<ApiResponse<CartItem[]>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_id', product.id)
      .single();

    if (existingItem) {
      // Update quantity if item exists
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id);

      if (error) throw error;
    } else {
      // Insert new item if it doesn't exist
      const { error } = await supabase
        .from('cart_items')
        .insert([{
          user_id: user.id,
          product_id: product.id,
          quantity
        }]);

      if (error) throw error;
    }

    // Return updated cart
    return await getCart();
  } catch (error) {
    return { success: false, error: 'Failed to add item to cart' };
  }
};

export const updateCartItem = async (itemId: string, quantity: number): Promise<ApiResponse<CartItem[]>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id);

      if (error) throw error;
    } else {
      // Update quantity
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId)
        .eq('user_id', user.id);

      if (error) throw error;
    }

    // Return updated cart
    return await getCart();
  } catch (error) {
    return { success: false, error: 'Failed to update cart item' };
  }
};

export const removeFromCart = async (itemId: string): Promise<ApiResponse<CartItem[]>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', user.id);

    if (error) throw error;

    // Return updated cart
    return await getCart();
  } catch (error) {
    return { success: false, error: 'Failed to remove item from cart' };
  }
};

export const clearCart = async (): Promise<ApiResponse<CartItem[]>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;

    return { success: true, data: [] };
  } catch (error) {
    return { success: false, error: 'Failed to clear cart' };
  }
};