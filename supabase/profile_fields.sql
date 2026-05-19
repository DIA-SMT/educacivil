-- Agrega campos legales del usuario para el certificado.
-- El bloqueo "una sola edicion" se hace en el server action,
-- no en RLS, para no romper el update existente de full_name.
-- Correr una sola vez en el SQL Editor de Supabase.

alter table public.profiles
  add column if not exists first_name        text,
  add column if not exists last_name         text,
  add column if not exists dni               text,
  add column if not exists profile_locked_at timestamptz;

-- DNI unico cuando esta presente (permite multiples NULLs).
create unique index if not exists profiles_dni_unique
  on public.profiles (dni)
  where dni is not null;
