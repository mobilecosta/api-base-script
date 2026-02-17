-- Authentication API - Supabase Setup SQL Script
-- Execute this script in Supabase SQL Editor

-- ==================== CREATE USERS TABLE ====================

-- Drop existing table if needed (be careful in production!)
-- DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT email_valid CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create index for pagination/sorting by created_at
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- ==================== ROW LEVEL SECURITY ====================

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON users
  FOR SELECT
  USING (
    auth.uid()::text = id::text 
    OR 
    current_user = 'authenticated'  -- Adjust as needed
  );

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

-- Policy: Allow anyone to insert (registration)
CREATE POLICY "Allow user registration"
  ON users
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users cannot delete their own account (prevents accidental deletion)
-- Uncomment if you want to allow deletion
-- CREATE POLICY "Users can delete their own account"
--   ON users
--   FOR DELETE
--   USING (auth.uid()::text = id::text);

-- ==================== OPTIONAL: AUDIT TABLE ====================

-- Create audit log table to track changes
CREATE TABLE IF NOT EXISTS user_audit_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for audit queries
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON user_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON user_audit_log(created_at DESC);

-- ==================== OPTIONAL: SESSIONS/REFRESH TOKENS ====================

-- Create table for refresh tokens (if implementing token refresh)
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP
);

-- Create index for token lookups and cleanup
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- ==================== CLIENTES TABLE (PO UI CRUD) ====================

CREATE TABLE IF NOT EXISTS clientes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  codigo VARCHAR(40) NOT NULL UNIQUE,
  nome VARCHAR(255) NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clientes_codigo ON clientes(codigo);
CREATE INDEX IF NOT EXISTS idx_clientes_nome ON clientes(nome);
CREATE INDEX IF NOT EXISTS idx_clientes_ativo ON clientes(ativo);
CREATE INDEX IF NOT EXISTS idx_clientes_created_at ON clientes(created_at DESC);

-- ==================== HELPER FUNCTIONS ====================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clientes_updated_at ON clientes;
CREATE TRIGGER update_clientes_updated_at
  BEFORE UPDATE ON clientes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==================== VIEWS (Optional) ====================

-- Create view for public user profiles (without sensitive data)
CREATE OR REPLACE VIEW public_user_profiles AS
SELECT 
  id,
  name,
  created_at
FROM users;

-- ==================== USEFUL QUERIES ====================

-- Get all users (development only!)
-- SELECT id, email, name, created_at, updated_at FROM users;

-- Get user by email
-- SELECT * FROM users WHERE email = 'user@example.com';

-- Get user by ID
-- SELECT * FROM users WHERE id = '123e4567-e89b-12d3-a456-426614174000';

-- Update user profile
-- UPDATE users SET name = 'New Name' WHERE id = '...';

-- Count total users
-- SELECT COUNT(*) as total_users FROM users;

-- Find inactive users (not logged in for 30 days) - requires audit log
-- SELECT * FROM users 
-- WHERE id NOT IN (
--   SELECT DISTINCT user_id FROM user_audit_log 
--   WHERE action = 'login' AND created_at > NOW() - INTERVAL '30 days'
-- );

-- ==================== CLEANUP ====================

-- Remove old refresh tokens (should run periodically)
-- DELETE FROM refresh_tokens WHERE expires_at < NOW();

-- ==================== NOTES ====================

/*
1. Make sure UUID extension is enabled in Supabase
2. Adjust email validation regex if needed
3. RLS policies can be adjusted based on your authentication setup
4. For production:
   - Ensure HTTPS is used
   - Review and tighten RLS policies
   - Implement rate limiting at API level
   - Monitor audit logs regularly

5. Testing RLS policies:
   - Create a test user
   - Use authenticated client with their token
   - Verify they can only see their own data
*/
