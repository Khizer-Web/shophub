/*
  # Create users table for authentication

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - matches auth.users.id
      - `email` (text, unique, not null)
      - `name` (text, not null)
      - `raw_user_meta_data` (jsonb) - stores admin status and other metadata
      - `created_at` (timestamp with timezone, default now())

  2. Security
    - Enable RLS on `users` table
    - Add policy for users to read their own data
    - Add policy for admin users to read all user data
    - Add policy for authenticated users to insert their own data
    - Add policy for users to update their own data
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  raw_user_meta_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Admin users can read all user data
CREATE POLICY "Admin users can read all user data"
  ON users
  FOR SELECT
  TO authenticated
  USING ((raw_user_meta_data ->> 'isAdmin')::boolean = true);

-- Users can insert their own data
CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin users can update any user data
CREATE POLICY "Admin users can update any user data"
  ON users
  FOR UPDATE
  TO authenticated
  USING ((raw_user_meta_data ->> 'isAdmin')::boolean = true);