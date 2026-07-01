-- Trazabilidad de ingresos con CiDiTuc.
--
-- El login con CiDiTuc es una sesión paralela (cookie firmada) y NO crea un
-- usuario de Supabase Auth, por eso no aparece en la tabla `profiles`. Esta
-- tabla registra quién entra con CiDiTuc para poder verlo en el admin.
--
-- Correr en el SQL editor de Supabase.

create table if not exists public.cidituc_users (
  id_persona      bigint primary key,       -- id_persona de CiDiTuc
  dni             text,
  nombre          text,
  apellido        text,
  email           text,
  primer_ingreso  timestamptz not null default now(),
  ultimo_ingreso  timestamptz not null default now(),
  ingresos        integer     not null default 1
);

-- RLS activo sin policies: solo el service role (server) accede a esta tabla.
-- Nadie desde el browser puede leerla ni escribirla.
alter table public.cidituc_users enable row level security;

-- Registra un ingreso de forma atómica: crea la fila o, si ya existe, actualiza
-- el último ingreso, suma +1 al contador y refresca los datos si vinieron.
create or replace function public.registrar_ingreso_cidituc(
  p_id_persona bigint,
  p_dni        text,
  p_nombre     text,
  p_apellido   text,
  p_email      text
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.cidituc_users (id_persona, dni, nombre, apellido, email)
  values (p_id_persona, nullif(p_dni, ''), p_nombre, p_apellido, p_email)
  on conflict (id_persona) do update set
    ultimo_ingreso = now(),
    ingresos       = cidituc_users.ingresos + 1,
    dni      = coalesce(nullif(excluded.dni, ''), cidituc_users.dni),
    nombre   = coalesce(excluded.nombre, cidituc_users.nombre),
    apellido = coalesce(excluded.apellido, cidituc_users.apellido),
    email    = coalesce(excluded.email, cidituc_users.email);
end;
$$;
