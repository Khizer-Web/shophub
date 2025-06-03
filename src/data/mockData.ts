import { Product, User, Order } from '../types';

// Mock Products
export const mockProducts: Product[] = [
  {
    id: 1,
    title: "Premium Wireless Headphones",
    description: "High-quality wireless headphones with noise cancellation and 20-hour battery life.",
    price: 199.99,
    image: "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    stock: 50,
    category: "electronics"
  },
  {
    id: 2,
    title: "Slim Fit Dress Shirt",
    description: "Modern slim fit dress shirt made from 100% cotton, perfect for any formal occasion.",
    price: 59.99,
    image: "https://images.pexels.com/photos/297933/pexels-photo-297933.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    stock: 100,
    category: "clothing"
  },
  {
    id: 3,
    title: "Stainless Steel Watch",
    description: "Elegant stainless steel watch with sapphire crystal and automatic movement.",
    price: 299.99,
    image: "https://images.pexels.com/photos/9978722/pexels-photo-9978722.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    stock: 30,
    category: "accessories"
  },
  {
    id: 4,
    title: "Smart Home Speaker",
    description: "Voice-controlled smart speaker with premium sound quality and home automation features.",
    price: 129.99,
    image: "https://images.pexels.com/photos/1470167/pexels-photo-1470167.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    stock: 75,
    category: "electronics"
  },
  {
    id: 5,
    title: "Leather Wallet",
    description: "Genuine leather wallet with multiple card slots and RFID protection.",
    price: 49.99,
    image: "https://images.pexels.com/photos/6690848/pexels-photo-6690848.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    stock: 120,
    category: "accessories"
  },
  {
    id: 6,
    title: "Running Shoes",
    description: "Lightweight running shoes with responsive cushioning for maximum comfort.",
    price: 89.99,
    image: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    stock: 80,
    category: "footwear"
  },
  {
    id: 7,
    title: "Smartphone Case",
    description: "Durable smartphone case with drop protection and sleek design.",
    price: 24.99,
    image: "https://images.pexels.com/photos/4957/person-woman-hand-smartphone.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    stock: 200,
    category: "electronics"
  },
  {
    id: 8,
    title: "Ceramic Coffee Mug",
    description: "Handcrafted ceramic coffee mug that keeps your drinks hot longer.",
    price: 19.99,
    image: "https://images.pexels.com/photos/1793035/pexels-photo-1793035.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    stock: 150,
    category: "home"
  },
  {
    id: 9,
    title: "Yoga Mat",
    description: "Non-slip yoga mat made from eco-friendly materials, perfect for all yoga styles.",
    price: 39.99,
    image: "https://images.pexels.com/photos/6740056/pexels-photo-6740056.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    stock: 60,
    category: "fitness"
  },
  {
    id: 10,
    title: "Mechanical Keyboard",
    description: "High-performance mechanical keyboard with customizable RGB lighting.",
    price: 149.99,
    image: "https://images.pexels.com/photos/1772123/pexels-photo-1772123.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    stock: 40,
    category: "electronics"
  }
];

// Mock Users
export const mockUsers: User[] = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@example.com",
    isAdmin: true
  },
  {
    id: 2,
    name: "John Doe",
    email: "john@example.com",
    isAdmin: false
  },
  {
    id: 3,
    name: "Jane Smith",
    email: "jane@example.com",
    isAdmin: false
  }
];

// Mock Orders
export const mockOrders: Order[] = [
  {
    id: 1,
    userId: 2,
    totalPrice: 289.98,
    status: "delivered",
    createdAt: "2023-09-15T10:30:00Z",
    items: [
      {
        id: 101,
        orderId: 1,
        productId: 1,
        quantity: 1,
        price: 199.99,
        product: mockProducts[0]
      },
      {
        id: 102,
        orderId: 1,
        productId: 5,
        quantity: 1,
        price: 49.99,
        product: mockProducts[4]
      }
    ]
  },
  {
    id: 2,
    userId: 2,
    totalPrice: 109.98,
    status: "shipped",
    createdAt: "2023-10-20T14:45:00Z",
    items: [
      {
        id: 103,
        orderId: 2,
        productId: 8,
        quantity: 2,
        price: 19.99,
        product: mockProducts[7]
      },
      {
        id: 104,
        orderId: 2,
        productId: 5,
        quantity: 1,
        price: 49.99,
        product: mockProducts[4]
      }
    ]
  },
  {
    id: 3,
    userId: 3,
    totalPrice: 379.98,
    status: "pending",
    createdAt: "2023-11-05T09:15:00Z",
    items: [
      {
        id: 105,
        orderId: 3,
        productId: 3,
        quantity: 1,
        price: 299.99,
        product: mockProducts[2]
      },
      {
        id: 106,
        orderId: 3,
        productId: 9,
        quantity: 1,
        price: 39.99,
        product: mockProducts[8]
      }
    ]
  }
];

export const categories = [
  { id: "all", name: "All Products" },
  { id: "electronics", name: "Electronics" },
  { id: "clothing", name: "Clothing" },
  { id: "accessories", name: "Accessories" },
  { id: "footwear", name: "Footwear" },
  { id: "home", name: "Home" },
  { id: "fitness", name: "Fitness" }
];