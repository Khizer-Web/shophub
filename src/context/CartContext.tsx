import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CartItem, Product } from '../types';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../api/cartApi';
import toast from 'react-hot-toast';

interface CartContextType {
  cartItems: CartItem[];
  isLoading: boolean;
  addItem: (product: Product, quantity: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearItems: () => Promise<void>;
  cartTotal: number;
  cartCount: number;
}

export const CartContext = createContext<CartContextType>({
  cartItems: [],
  isLoading: true,
  addItem: async () => {},
  updateItem: async () => {},
  removeItem: async () => {},
  clearItems: async () => {},
  cartTotal: 0,
  cartCount: 0,
});

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCart = useCallback(async () => {
    setIsLoading(true);
    const response = await getCart();
    if (response.success && response.data) {
      setCartItems(response.data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = async (product: Product, quantity: number): Promise<void> => {
    if (quantity <= 0) return;
    
    // Check if adding this quantity would exceed available stock
    const existingItem = cartItems.find(item => item.product.id === product.id);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    
    if (currentQuantity + quantity > product.stock) {
      toast.error(`Only ${product.stock} items available in stock`);
      return;
    }
    
    const response = await addToCart(product, quantity);
    if (response.success && response.data) {
      setCartItems(response.data);
      toast.success(`Added ${quantity} ${product.title} to cart`);
    } else {
      toast.error('Failed to add item to cart');
    }
  };

  const updateItem = async (itemId: string, quantity: number): Promise<void> => {
    const item = cartItems.find(item => item.id === itemId);
    
    if (!item) return;
    
    // Check if updating this quantity would exceed available stock
    if (quantity > item.product.stock) {
      toast.error(`Only ${item.product.stock} items available in stock`);
      return;
    }
    
    const response = await updateCartItem(itemId, quantity);
    if (response.success && response.data) {
      setCartItems(response.data);
      if (quantity === 0) {
        toast.success(`Removed ${item.product.title} from cart`);
      }
    } else {
      toast.error('Failed to update cart');
    }
  };

  const removeItem = async (itemId: string): Promise<void> => {
    const item = cartItems.find(item => item.id === itemId);
    const response = await removeFromCart(itemId);
    if (response.success && response.data) {
      setCartItems(response.data);
      if (item) {
        toast.success(`Removed ${item.product.title} from cart`);
      }
    } else {
      toast.error('Failed to remove item from cart');
    }
  };

  const clearItems = async (): Promise<void> => {
    const response = await clearCart();
    if (response.success) {
      setCartItems([]);
      toast.success('Cart cleared');
    } else {
      toast.error('Failed to clear cart');
    }
  };

  const cartTotal = cartItems.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isLoading,
        addItem,
        updateItem,
        removeItem,
        clearItems,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => React.useContext(CartContext);