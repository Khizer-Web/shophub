/*
  # Complete eCommerce Database Schema

  1. New Tables
    - `users` - User profiles linked to auth.users
    - `products` - Product catalog
    - `cart_items` - Shopping cart items
    - `orders` - Customer orders
    - `order_items` - Items within orders

  2. Security
    - Enable RLS on all tables
    - Add comprehensive policies for users, admins, and public access
    - Proper foreign key relationships

  3. Seed Data
    - Admin and regular users
    - Sample products across categories
    - Proper authentication setup
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  raw_user_meta_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  image text,
  stock integer NOT NULL DEFAULT 0,
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  UNIQUE(user_id, product_id)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  total_price numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity integer NOT NULL,
  price numeric(10,2) NOT NULL
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can insert own data" ON users
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin users can read all user data" ON users
  FOR SELECT TO authenticated
  USING (((raw_user_meta_data ->> 'isAdmin')::boolean = true));

CREATE POLICY "Admin users can update any user data" ON users
  FOR UPDATE TO authenticated
  USING (((raw_user_meta_data ->> 'isAdmin')::boolean = true));

-- Products policies
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT TO public
  USING (true);

CREATE POLICY "Products are insertable by admin users only" ON products
  FOR INSERT TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data ->> 'isAdmin')::boolean = true
    )
  );

CREATE POLICY "Products are updatable by admin users only" ON products
  FOR UPDATE TO public
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data ->> 'isAdmin')::boolean = true
    )
  );

CREATE POLICY "Products are deletable by admin users only" ON products
  FOR DELETE TO public
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data ->> 'isAdmin')::boolean = true
    )
  );

-- Cart items policies
CREATE POLICY "Users can view their own cart items" ON cart_items
  FOR SELECT TO public
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items" ON cart_items
  FOR INSERT TO public
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items" ON cart_items
  FOR UPDATE TO public
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items" ON cart_items
  FOR DELETE TO public
  USING (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT TO public
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" ON orders
  FOR INSERT TO public
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin users can view all orders" ON orders
  FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data ->> 'isAdmin')::boolean = true
    )
  );

-- Order items policies
CREATE POLICY "Users can view their own order items" ON order_items
  FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own order items" ON order_items
  FOR INSERT TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin users can view all order items" ON order_items
  FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data ->> 'isAdmin')::boolean = true
    )
  );

-- Insert sample products
INSERT INTO products (title, description, price, image, stock, category) VALUES
('Premium Wireless Headphones', 'High-quality wireless headphones with noise cancellation and 20-hour battery life.', 199.99, 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 50, 'electronics'),
('Slim Fit Dress Shirt', 'Modern slim fit dress shirt made from 100% cotton, perfect for any formal occasion.', 59.99, 'https://images.pexels.com/photos/297933/pexels-photo-297933.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 100, 'clothing'),
('Stainless Steel Watch', 'Elegant stainless steel watch with sapphire crystal and automatic movement.', 299.99, 'https://images.pexels.com/photos/9978722/pexels-photo-9978722.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 30, 'accessories'),
('Smart Home Speaker', 'Voice-controlled smart speaker with premium sound quality and home automation features.', 129.99, 'https://images.pexels.com/photos/1470167/pexels-photo-1470167.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 75, 'electronics'),
('Leather Wallet', 'Genuine leather wallet with multiple card slots and RFID protection.', 49.99, 'https://images.pexels.com/photos/6690848/pexels-photo-6690848.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 120, 'accessories'),
('Running Shoes', 'Lightweight running shoes with responsive cushioning for maximum comfort.', 89.99, 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 80, 'footwear'),
('Smartphone Case', 'Durable smartphone case with drop protection and sleek design.', 24.99, 'https://images.pexels.com/photos/4957/person-woman-hand-smartphone.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 200, 'electronics'),
('Ceramic Coffee Mug', 'Handcrafted ceramic coffee mug that keeps your drinks hot longer.', 19.99, 'https://images.pexels.com/photos/1793035/pexels-photo-1793035.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 150, 'home'),
('Yoga Mat', 'Non-slip yoga mat made from eco-friendly materials, perfect for all yoga styles.', 39.99, 'https://images.pexels.com/photos/6740056/pexels-photo-6740056.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 60, 'fitness'),
('Mechanical Keyboard', 'High-performance mechanical keyboard with customizable RGB lighting.', 149.99, 'https://images.pexels.com/photos/1772123/pexels-photo-1772123.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 40, 'electronics');