/*
  # Initial Database Schema

  1. New Tables
    - products
      - id (uuid, primary key)
      - title (text)
      - description (text)
      - price (decimal)
      - image (text)
      - stock (integer)
      - category (text)
      - created_at (timestamp)
    
    - orders
      - id (uuid, primary key)
      - user_id (references auth.users)
      - total_price (decimal)
      - status (text)
      - created_at (timestamp)
    
    - order_items
      - id (uuid, primary key)
      - order_id (references orders)
      - product_id (references products)
      - quantity (integer)
      - price (decimal)
    
    - cart_items
      - id (uuid, primary key)
      - user_id (references auth.users)
      - product_id (references products)
      - quantity (integer)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  image text,
  stock integer NOT NULL DEFAULT 0,
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  total_price decimal(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products ON DELETE RESTRICT NOT NULL,
  quantity integer NOT NULL,
  price decimal(10,2) NOT NULL
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products ON DELETE CASCADE NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  UNIQUE(user_id, product_id)
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

CREATE POLICY "Products are insertable by admin users only" ON products
  FOR INSERT WITH CHECK ((auth.jwt() ->> 'email')::text IN (
    SELECT email FROM auth.users
    WHERE raw_user_meta_data->>'isAdmin' = 'true'
  ));

CREATE POLICY "Products are updatable by admin users only" ON products
  FOR UPDATE USING ((auth.jwt() ->> 'email')::text IN (
    SELECT email FROM auth.users
    WHERE raw_user_meta_data->>'isAdmin' = 'true'
  ));

CREATE POLICY "Products are deletable by admin users only" ON products
  FOR DELETE USING ((auth.jwt() ->> 'email')::text IN (
    SELECT email FROM auth.users
    WHERE raw_user_meta_data->>'isAdmin' = 'true'
  ));

-- Orders policies
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin users can view all orders" ON orders
  FOR SELECT USING ((auth.jwt() ->> 'email')::text IN (
    SELECT email FROM auth.users
    WHERE raw_user_meta_data->>'isAdmin' = 'true'
  ));

CREATE POLICY "Users can create their own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order items policies
CREATE POLICY "Users can view their own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin users can view all order items" ON order_items
  FOR SELECT USING ((auth.jwt() ->> 'email')::text IN (
    SELECT email FROM auth.users
    WHERE raw_user_meta_data->>'isAdmin' = 'true'
  ));

CREATE POLICY "Users can create their own order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Cart items policies
CREATE POLICY "Users can view their own cart items" ON cart_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items" ON cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items" ON cart_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items" ON cart_items
  FOR DELETE USING (auth.uid() = user_id);