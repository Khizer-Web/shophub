/*
  # Create demo users for testing

  1. Demo Users
    - Creates admin user (admin@example.com)
    - Creates regular user (john@example.com)
    - Both with password: password123

  2. Security
    - Users are created in auth.users table
    - Corresponding profiles created in public.users table
    - Admin user has isAdmin flag set to true
*/

-- Insert demo users into auth.users (this would normally be done through Supabase Auth API)
-- Note: In a real application, users should be created through the Supabase Auth API
-- This is just for demo purposes and may not work in all environments

-- Create corresponding user profiles in public.users table
-- These will be created automatically when users sign up, but we can pre-create them

INSERT INTO public.users (id, email, name, raw_user_meta_data) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@example.com', 'Admin User', '{"isAdmin": true}'::jsonb),
  ('00000000-0000-0000-0000-000000000002', 'john@example.com', 'John Doe', '{"isAdmin": false}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Note: The actual auth users need to be created through the Supabase dashboard or Auth API
-- with the following credentials:
-- admin@example.com / password123 (with user ID: 00000000-0000-0000-0000-000000000001)
-- john@example.com / password123 (with user ID: 00000000-0000-0000-0000-000000000002)