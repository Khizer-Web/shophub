import { supabase } from '../lib/supabase';
import { Order, ApiResponse } from '../types';
import { getCart, clearCart } from './cartApi';

export const createOrder = async (shippingAddress: string, paymentMethod: string): Promise<ApiResponse<Order>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Get the current cart
    const cartResponse = await getCart();
    
    if (!cartResponse.success || !cartResponse.data || cartResponse.data.length === 0) {
      return { success: false, error: 'Cannot create order with empty cart' };
    }
    
    // Calculate the total price
    const totalPrice = cartResponse.data.reduce(
      (total, item) => total + item.product.price * item.quantity, 
      0
    );
    
    // Create the order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id: user.id,
        total_price: totalPrice,
        status: 'pending'
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = cartResponse.data.map(item => ({
      order_id: orderData.id,
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.product.price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Clear the cart after order creation
    await clearCart();

    // Get the complete order with items
    const orderResponse = await getOrderById(orderData.id);
    
    if (orderResponse.success && orderResponse.data) {
      return { success: true, data: orderResponse.data };
    }

    return { success: false, error: 'Failed to retrieve created order' };
  } catch (error) {
    return { success: false, error: 'Failed to create order' };
  }
};

export const getUserOrders = async (): Promise<ApiResponse<Order[]>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        user_id,
        total_price,
        status,
        created_at,
        order_items (
          id,
          product_id,
          quantity,
          price,
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
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const orders: Order[] = data.map((order: any) => ({
      id: order.id,
      userId: order.user_id,
      totalPrice: order.total_price,
      status: order.status,
      createdAt: order.created_at,
      items: order.order_items.map((item: any) => ({
        id: item.id,
        orderId: order.id,
        productId: item.product_id,
        quantity: item.quantity,
        price: item.price,
        product: item.products
      }))
    }));

    return { success: true, data: orders };
  } catch (error) {
    return { success: false, error: 'Failed to fetch user orders' };
  }
};

export const getOrderById = async (orderId: string): Promise<ApiResponse<Order>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        user_id,
        total_price,
        status,
        created_at,
        order_items (
          id,
          product_id,
          quantity,
          price,
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
        )
      `)
      .eq('id', orderId)
      .single();

    if (error) throw error;

    if (!data) {
      return { success: false, error: 'Order not found' };
    }

    // Check if user owns this order or is admin
    const { data: userProfile } = await supabase
      .from('users')
      .select('raw_user_meta_data')
      .eq('id', user.id)
      .single();

    const isAdmin = userProfile?.raw_user_meta_data?.isAdmin || false;
    
    if (data.user_id !== user.id && !isAdmin) {
      return { success: false, error: 'Access denied' };
    }

    const order: Order = {
      id: data.id,
      userId: data.user_id,
      totalPrice: data.total_price,
      status: data.status,
      createdAt: data.created_at,
      items: data.order_items.map((item: any) => ({
        id: item.id,
        orderId: data.id,
        productId: item.product_id,
        quantity: item.quantity,
        price: item.price,
        product: item.products
      }))
    };

    return { success: true, data: order };
  } catch (error) {
    return { success: false, error: 'Failed to fetch order details' };
  }
};