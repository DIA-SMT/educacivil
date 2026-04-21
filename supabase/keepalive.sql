-- 1. Create schema api if it does not exist
CREATE SCHEMA IF NOT EXISTS api;

-- Ensure that roles can access the schema (Supabase default roles)
GRANT USAGE ON SCHEMA api TO anon, authenticated, service_role;

-- 2. Create the keepalive table
CREATE TABLE IF NOT EXISTS api.supabase_keepalive (
  id integer PRIMARY KEY,
  last_heartbeat timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for security
ALTER TABLE api.supabase_keepalive ENABLE ROW LEVEL SECURITY;

-- Insert exactly one state row
INSERT INTO api.supabase_keepalive (id, last_heartbeat) 
VALUES (1, now())
ON CONFLICT (id) DO NOTHING;

-- Revoke all by default to be safe
REVOKE ALL ON api.supabase_keepalive FROM PUBLIC;
REVOKE ALL ON api.supabase_keepalive FROM anon, authenticated;

-- Allow update and select to normal roles so the RPC can work
GRANT UPDATE, SELECT ON api.supabase_keepalive TO anon, authenticated, service_role;

-- RLS Policy: Allow update only for the specific single row
CREATE POLICY "Allow update for keepalive row" 
ON api.supabase_keepalive 
FOR UPDATE 
TO anon, authenticated, service_role 
USING (id = 1) 
WITH CHECK (id = 1);

-- RLS Policy: Allow reading the heartbeat state
CREATE POLICY "Allow select on keepalive" 
ON api.supabase_keepalive 
FOR SELECT 
TO anon, authenticated, service_role 
USING (true);

-- 3. Create the keepalive function
-- This uses SECURITY INVOKER which means the caller (e.g. anon) needs the table permissions
CREATE OR REPLACE FUNCTION api.keepalive()
RETURNS json
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  result json;
BEGIN
  UPDATE api.supabase_keepalive
  SET last_heartbeat = now()
  WHERE id = 1;

  SELECT json_build_object(
    'ok', true,
    'timestamp', now()
  ) INTO result;

  RETURN result;
END;
$$;

-- Allow the function to be called via Supabase RPC
GRANT EXECUTE ON FUNCTION api.keepalive() TO anon, authenticated, service_role;
