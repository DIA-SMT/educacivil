-- ============================================================
-- Supabase Keepalive - Script completo
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Limpiar versión anterior (schema api) si existía
DROP FUNCTION IF EXISTS api.keepalive();
DROP TABLE IF EXISTS api.supabase_keepalive;
DROP SCHEMA IF EXISTS api CASCADE;

-- 2. Crear la tabla de keepalive en schema api
CREATE SCHEMA IF NOT EXISTS api;
GRANT USAGE ON SCHEMA api TO anon, authenticated, service_role;

CREATE TABLE IF NOT EXISTS api.supabase_keepalive (
  id integer PRIMARY KEY,
  last_heartbeat timestamp with time zone NOT NULL DEFAULT now()
);

-- 3. Insertar la fila única de estado
INSERT INTO api.supabase_keepalive (id, last_heartbeat)
VALUES (1, now())
ON CONFLICT (id) DO NOTHING;

-- 4. Habilitar RLS
ALTER TABLE api.supabase_keepalive ENABLE ROW LEVEL SECURITY;

-- Revocar acceso por defecto a PUBLIC (todos los roles)
REVOKE ALL ON api.supabase_keepalive FROM PUBLIC;

-- Dar permisos necesarios
GRANT SELECT, UPDATE ON api.supabase_keepalive TO anon, authenticated, service_role;

-- Policy: permitir SELECT
CREATE POLICY "keepalive_select"
  ON api.supabase_keepalive
  FOR SELECT
  TO anon, authenticated, service_role
  USING (true);

-- Policy: permitir UPDATE solo en la fila id=1
CREATE POLICY "keepalive_update"
  ON api.supabase_keepalive
  FOR UPDATE
  TO anon, authenticated, service_role
  USING (id = 1)
  WITH CHECK (id = 1);

-- 5. Crear la función keepalive
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

-- 6. Permitir que sea llamada vía RPC
GRANT EXECUTE ON FUNCTION api.keepalive() TO anon, authenticated, service_role;
