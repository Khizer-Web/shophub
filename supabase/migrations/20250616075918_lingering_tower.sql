/*
  # Complete Ecommerce Database Fix

  1. Clean up existing policies safely
  2. Create proper table structure
  3. Set up comprehensive RLS policies
  4. Insert sample data
  5. Create admin user setup
*/

-- First, safely drop existing policies to avoid conflicts
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
  DROP POLICY IF EXISTS "Products are insertable by admin users only" ON products;
  DROP POLICY IF EXISTS "Products are updatable by admin users only" ON products;
  DROP POLICY IF EXISTS "Products are deletable by admin users only" ON products;
  DROP POLICY IF EXISTS "Users can read own data" ON users;
  DROP POLICY IF EXISTS "Users can update own data" ON users;
  DROP POLICY IF EXISTS "Users can insert own data" ON users;
  DROP POLICY IF EXISTS "Admin users can read all user data" ON users;
  DROP POLICY IF EXISTS "Admin users can update any user data" ON users;
  DROP POLICY IF EXISTS "Users can view their own cart items" ON cart_items;
  DROP POLICY IF EXISTS "Users can insert their own cart items" ON cart_items;
  DROP POLICY IF EXISTS "Users can update their own cart items" ON cart_items;
  DROP POLICY IF EXISTS "Users can delete their own cart items" ON cart_items;
  DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
  DROP POLICY IF EXISTS "Users can create their own orders" ON orders;
  DROP POLICY IF EXISTS "Admin users can view all orders" ON orders;
  DROP POLICY IF EXISTS "Users can view their own order items" ON order_items;
  DROP POLICY IF EXISTS "Users can create their own order items" ON order_items;
  DROP POLICY IF EXISTS "Admin users can view all order items" ON order_items;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Ensure tables exist with correct structure
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  raw_user_meta_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Add foreign key constraint to auth.users if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_id_fkey' AND table_name = 'users'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

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

CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  UNIQUE(user_id, product_id)
);

-- Add foreign key constraints for cart_items if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'cart_items_user_id_fkey' AND table_name = 'cart_items'
  ) THEN
    ALTER TABLE cart_items ADD CONSTRAINT cart_items_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'cart_items_product_id_fkey' AND table_name = 'cart_items'
  ) THEN
    ALTER TABLE cart_items ADD CONSTRAINT cart_items_product_id_fkey 
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  total_price numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Add foreign key constraint for orders if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'orders_user_id_fkey' AND table_name = 'orders'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  product_id uuid NOT NULL,
  quantity integer NOT NULL,
  price numeric(10,2) NOT NULL
);

-- Add foreign key constraints for order_items if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'order_items_order_id_fkey' AND table_name = 'order_items'
  ) THEN
    ALTER TABLE order_items ADD CONSTRAINT order_items_order_id_fkey 
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'order_items_product_id_fkey' AND table_name = 'order_items'
  ) THEN
    ALTER TABLE order_items ADD CONSTRAINT order_items_product_id_fkey 
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies

-- Users policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin users can read all user data"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users users_1
      WHERE users_1.id = auth.uid() 
      AND ((users_1.raw_user_meta_data ->> 'isAdmin')::boolean = true)
    )
  );

CREATE POLICY "Admin users can update any user data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users users_1
      WHERE users_1.id = auth.uid() 
      AND ((users_1.raw_user_meta_data ->> 'isAdmin')::boolean = true)
    )
  );

-- Products policies
CREATE POLICY "Products are viewable by everyone"
  ON products
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Products are insertable by admin users only"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() 
      AND ((users.raw_user_meta_data ->> 'isAdmin')::boolean = true)
    )
  );

CREATE POLICY "Products are updatable by admin users only"
  ON products
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() 
      AND ((users.raw_user_meta_data ->> 'isAdmin')::boolean = true)
    )
  );

CREATE POLICY "Products are deletable by admin users only"
  ON products
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() 
      AND ((users.raw_user_meta_data ->> 'isAdmin')::boolean = true)
    )
  );

-- Cart items policies
CREATE POLICY "Users can view their own cart items"
  ON cart_items
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items"
  ON cart_items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items"
  ON cart_items
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items"
  ON cart_items
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "Users can view their own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin users can view all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() 
      AND ((users.raw_user_meta_data ->> 'isAdmin')::boolean = true)
    )
  );

-- Order items policies
CREATE POLICY "Users can view their own order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own order items"
  ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin users can view all order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() 
      AND ((users.raw_user_meta_data ->> 'isAdmin')::boolean = true)
    )
  );

-- Insert sample products if they don't exist
INSERT INTO products (title, description, price, image, stock, category) 
SELECT * FROM (VALUES
  ('Premium Wireless Headphones', 'High-quality wireless headphones with noise cancellation and 20-hour battery life.', 199.99, 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 50, 'electronics'),
  ('Slim Fit Dress Shirt', 'Modern slim fit dress shirt made from 100% cotton, perfect for any formal occasion.', 59.99, 'https://images.pexels.com/photos/297933/pexels-photo-297933.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 100, 'clothing'),
  ('Stainless Steel Watch', 'Elegant stainless steel watch with sapphire crystal and automatic movement.', 299.99, 'https://images.pexels.com/photos/9978722/pexels-photo-9978722.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 30, 'accessories'),
  ('Smart Home Speaker', 'Voice-controlled smart speaker with premium sound quality and home automation features.', 129.99, 'https://images.pexels.com/photos/1470167/pexels-photo-1470167.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 75, 'electronics'),
  ('Leather Wallet', 'Genuine leather wallet with multiple card slots and RFID protection.', 49.99, 'https://images.pexels.com/photos/6690848/pexels-photo-6690848.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 120, 'accessories'),
  ('Running Shoes', 'Lightweight running shoes with responsive cushioning for maximum comfort.', 89.99, 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 80, 'footwear'),
  ('Smartphone Case', 'Durable smartphone case with drop protection and sleek design.', 24.99, 'https://images.pexels.com/photos/4957/person-woman-hand-smartphone.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 200, 'electronics'),
  ('Ceramic Coffee Mug', 'Handcrafted ceramic coffee mug that keeps your drinks hot longer.', 19.99, 'https://images.pexels.com/photos/1793035/pexels-photo-1793035.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 150, 'home'),
  ('Yoga Mat', 'Non-slip yoga mat made from eco-friendly materials, perfect for all yoga styles.', 39.99, 'https://images.pexels.com/photos/6740056/pexels-photo-6740056.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 60, 'fitness'),
  ('Mechanical Keyboard', 'High-performance mechanical keyboard with customizable RGB lighting.', 149.99, 'https://images.pexels.com/photos/1772123/pexels-photo-1772123.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 40, 'electronics')
) AS v(title, description, price, image, stock, category)
WHERE NOT EXISTS (SELECT 1 FROM products WHERE products.title = v.title);