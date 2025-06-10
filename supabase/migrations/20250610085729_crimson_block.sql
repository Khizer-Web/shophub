/*
  # Fix RLS policies for admin access

  1. Changes
    - Drop and recreate admin-related policies with proper type casting
    - Ensure admin users can properly manage products

  2. Security
    - Maintain existing RLS setup
    - Fix admin user identification in policies
*/

-- Drop existing admin policies for products
DROP POLICY IF EXISTS "Products are insertable by admin users only" ON products;
DROP POLICY IF EXISTS "Products are updatable by admin users only" ON products;
DROP POLICY IF EXISTS "Products are deletable by admin users only" ON products;

-- Drop existing admin policies for orders
DROP POLICY IF EXISTS "Admin users can view all orders" ON orders;

-- Drop existing admin policies for order_items
DROP POLICY IF EXISTS "Admin users can view all order items" ON order_items;

-- Recreate products admin policies with proper type casting
CREATE POLICY "Products are insertable by admin users only" ON products
  FOR INSERT WITH CHECK (
    (auth.jwt() ->> 'email') IN (
      SELECT email FROM auth.users
      WHERE (raw_user_meta_data ->> 'isAdmin') = 'true'
    )
  );

CREATE POLICY "Products are updatable by admin users only" ON products
  FOR UPDATE USING (
    (auth.jwt() ->> 'email') IN (
      SELECT email FROM auth.users
      WHERE (raw_user_meta_data ->> 'isAdmin') = 'true'
    )
  );

CREATE POLICY "Products are deletable by admin users only" ON products
  FOR DELETE USING (
    (auth.jwt() ->> 'email') IN (
      SELECT email FROM auth.users
      WHERE (raw_user_meta_data ->> 'isAdmin') = 'true'
    )
  );

-- Recreate orders admin policies
CREATE POLICY "Admin users can view all orders" ON orders
  FOR SELECT USING (
    (auth.jwt() ->> 'email') IN (
      SELECT email FROM auth.users
      WHERE (raw_user_meta_data ->> 'isAdmin') = 'true'
    )
  );

-- Recreate order_items admin policies
CREATE POLICY "Admin users can view all order items" ON order_items
  FOR SELECT USING (
    (auth.jwt() ->> 'email') IN (
      SELECT email FROM auth.users
      WHERE (raw_user_meta_data ->> 'isAdmin') = 'true'
    )
  );