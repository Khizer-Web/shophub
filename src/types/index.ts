export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  category: string;
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface Order {
  id: number;
  userId: number;
  totalPrice: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  product?: Product;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}