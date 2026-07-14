-- ============================================================
-- Supabase Keepalive v2 - Script completo
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Por qué v2: la v1 (un UPDATE a una fila fija) fue detectada por
-- Supabase como "actividad insuficiente" y el proyecto se pausó igual
-- (mail del 2026-07: "have not seen sufficient activity"). Esta versión
-- genera actividad más parecida a tráfico real: inserta filas nuevas
-- con datos variables, borra las viejas y consulta agregados, de modo
-- que la base tiene escrituras, borrados y lecturas que cambian en
-- cada llamada. No toca ningún dato de la aplicación.
-- ============================================================

-- 1. Limpiar versión anterior si existía
DROP FUNCTION IF EXISTS api.keepalive();
DROP TABLE IF EXISTS api.supabase_keepalive;
DROP TABLE IF EXISTS api.keepalive_log;

-- 2. Schema api (por si no existe)
CREATE SCHEMA IF NOT EXISTS api;
GRANT USAGE ON SCHEMA api TO anon, authenticated, service_role;

-- 3. Tabla de log: crece con cada ping y se auto-limpia a 30 días
CREATE TABLE api.keepalive_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pinged_at timestamptz NOT NULL DEFAULT now(),
  payload jsonb
);

-- Nadie accede a la tabla directamente (ni siquiera con policies):
-- todo pasa por la función, que es SECURITY DEFINER.
ALTER TABLE api.keepalive_log ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON api.keepalive_log FROM PUBLIC;

-- 4. Función keepalive: insert + delete + select en cada llamada
CREATE OR REPLACE FUNCTION api.keepalive()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = api, pg_temp
AS $$
DECLARE
  last_ping timestamptz;
  total bigint;
BEGIN
  -- La función es pública vía anon key: este freno evita que un tercero
  -- la llame en loop para inflar la tabla (a lo sumo 1 insert cada 5 min).
  SELECT max(pinged_at) INTO last_ping FROM api.keepalive_log;

  IF last_ping IS NULL OR last_ping < now() - interval '5 minutes' THEN
    INSERT INTO api.keepalive_log (payload)
    VALUES (jsonb_build_object(
      'dow', extract(dow from now()),
      'hour', extract(hour from now()),
      'nonce', floor(random() * 1e9)
    ));
  END IF;

  -- Limpieza: conservar solo los últimos 30 días (~120 filas a 4 pings/día)
  DELETE FROM api.keepalive_log WHERE pinged_at < now() - interval '30 days';

  SELECT count(*) INTO total FROM api.keepalive_log;

  RETURN json_build_object(
    'ok', true,
    'timestamp', now(),
    'pings_30d', total
  );
END;
$$;

-- 5. Permitir que sea llamada vía RPC
REVOKE ALL ON FUNCTION api.keepalive() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION api.keepalive() TO anon, authenticated, service_role;
