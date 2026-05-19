-- Rate limit diario de mensajes de chat por usuario y asistente.
-- Correr una sola vez en el SQL Editor de Supabase.

create table if not exists public.chat_rate_limit (
  user_id  uuid not null references auth.users(id) on delete cascade,
  guide_id uuid not null references public.ai_guides(id) on delete cascade,
  day      date not null default current_date,
  count    int  not null default 0,
  primary key (user_id, guide_id, day)
);

alter table public.chat_rate_limit enable row level security;

-- Los usuarios solo pueden leer sus propios contadores (opcional, útil si lo querés mostrar en UI).
drop policy if exists "users read own rate limit" on public.chat_rate_limit;
create policy "users read own rate limit"
  on public.chat_rate_limit
  for select
  using (auth.uid() = user_id);

-- RPC atómica: incrementa el contador del día y devuelve el nuevo valor.
-- Falla con SQLSTATE 'P0001' si se supera el límite.
create or replace function public.increment_chat_usage(p_guide_id uuid, p_limit int)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user  uuid := auth.uid();
  v_count int;
begin
  if v_user is null then
    raise exception 'unauthorized' using errcode = '42501';
  end if;

  insert into public.chat_rate_limit (user_id, guide_id, day, count)
  values (v_user, p_guide_id, current_date, 1)
  on conflict (user_id, guide_id, day)
  do update set count = chat_rate_limit.count + 1
  returning count into v_count;

  if v_count > p_limit then
    raise exception 'rate_limit_exceeded' using errcode = 'P0001';
  end if;

  return v_count;
end;
$$;

revoke all on function public.increment_chat_usage(uuid, int) from public;
grant execute on function public.increment_chat_usage(uuid, int) to authenticated;
