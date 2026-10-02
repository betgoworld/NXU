-- NXU — NEXT YOU · Waitlist
-- Modelo de segurança:
--   • public.nxu_waitlist tem RLS ligado e NENHUMA policy para anon → o público não lê nem escreve direto.
--   • Inserção só via public.nxu_join_waitlist(), que exige um segredo conhecido apenas pelo
--     servidor Next.js (WAITLIST_API_SECRET). Assim o RPC não pode ser chamado do navegador.
--   • Leitura só para usuários autenticados cadastrados em nxu_private.admins.
--   • Nenhuma service role key é necessária.

create extension if not exists pgcrypto with schema extensions;

-- ─────────────────────────────────────────────────────────────
-- Schema privado (não exposto pela API do Supabase)
-- ─────────────────────────────────────────────────────────────
create schema if not exists nxu_private;
revoke all on schema nxu_private from public, anon, authenticated;

create table if not exists nxu_private.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists nxu_private.settings (
  key   text primary key,
  value text not null
);

create table if not exists nxu_private.attempts (
  id         bigint generated always as identity primary key,
  ip_hash    text not null,
  created_at timestamptz not null default now()
);
create index if not exists attempts_ip_created_idx on nxu_private.attempts (ip_hash, created_at desc);
create index if not exists attempts_created_idx on nxu_private.attempts (created_at desc);

-- ─────────────────────────────────────────────────────────────
-- Tabela principal
-- ─────────────────────────────────────────────────────────────
create table if not exists public.nxu_waitlist (
  id              uuid primary key default gen_random_uuid(),
  name            text not null check (char_length(name) between 2 and 80),
  phone           text not null unique check (phone ~ '^\+[1-9][0-9]{7,14}$'),
  country_code    text not null default '+55' check (country_code ~ '^\+[1-9][0-9]{0,3}$'),
  source          text,
  utm_source      text,
  utm_medium      text,
  utm_campaign    text,
  utm_content     text,
  utm_term        text,
  landing_variant text,
  device_type     text check (device_type in ('mobile', 'tablet', 'desktop', 'unknown')),
  referrer        text,
  consent_at      timestamptz not null default now(),
  consent_version text not null default '2026-10',
  created_at      timestamptz not null default now()
);

create index if not exists nxu_waitlist_created_idx on public.nxu_waitlist (created_at desc);
create index if not exists nxu_waitlist_utm_source_idx on public.nxu_waitlist (utm_source);
create index if not exists nxu_waitlist_utm_campaign_idx on public.nxu_waitlist (utm_campaign);

alter table public.nxu_waitlist enable row level security;

revoke all on public.nxu_waitlist from anon;
revoke insert, update, delete, truncate on public.nxu_waitlist from authenticated;
grant select on public.nxu_waitlist to authenticated;

-- ─────────────────────────────────────────────────────────────
-- Admin check
-- ─────────────────────────────────────────────────────────────
create or replace function public.nxu_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from nxu_private.admins a where a.user_id = (select auth.uid())
  );
$$;

revoke all on function public.nxu_is_admin() from public;
grant execute on function public.nxu_is_admin() to authenticated;

drop policy if exists "admins read waitlist" on public.nxu_waitlist;
create policy "admins read waitlist"
  on public.nxu_waitlist
  for select
  to authenticated
  using ((select public.nxu_is_admin()));

-- Admins podem apagar um lead (pedido de exclusão LGPD).
grant delete on public.nxu_waitlist to authenticated;
drop policy if exists "admins delete waitlist" on public.nxu_waitlist;
create policy "admins delete waitlist"
  on public.nxu_waitlist
  for delete
  to authenticated
  using ((select public.nxu_is_admin()));

-- ─────────────────────────────────────────────────────────────
-- Cadastro (chamado apenas pelo servidor)
-- Retorna: 'created' | 'exists' | 'rate_limited' | 'invalid' | 'forbidden'
-- ─────────────────────────────────────────────────────────────
create or replace function public.nxu_join_waitlist(
  p_secret          text,
  p_ip_hash         text,
  p_name            text,
  p_phone           text,
  p_country_code    text default '+55',
  p_source          text default null,
  p_utm_source      text default null,
  p_utm_medium      text default null,
  p_utm_campaign    text default null,
  p_utm_content     text default null,
  p_utm_term        text default null,
  p_landing_variant text default null,
  p_device_type     text default 'unknown',
  p_referrer        text default null
)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_expected text;
  v_name     text := btrim(regexp_replace(coalesce(p_name, ''), '\s+', ' ', 'g'));
  v_phone    text := '+' || regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  v_id       uuid;
begin
  select s.value into v_expected from nxu_private.settings s where s.key = 'api_secret_sha256';
  if v_expected is null
     or encode(extensions.digest(coalesce(p_secret, ''), 'sha256'), 'hex') <> v_expected then
    return 'forbidden';
  end if;

  if char_length(v_name) < 2 or char_length(v_name) > 80 or v_phone !~ '^\+[1-9][0-9]{7,14}$' then
    return 'invalid';
  end if;

  -- Rate limiting: por IP (5 em 10 min, 20 em 24 h) e global (300 por minuto).
  if p_ip_hash is not null then
    if (select count(*) from nxu_private.attempts a
          where a.ip_hash = p_ip_hash and a.created_at > now() - interval '10 minutes') >= 5
       or (select count(*) from nxu_private.attempts a
          where a.ip_hash = p_ip_hash and a.created_at > now() - interval '24 hours') >= 20 then
      return 'rate_limited';
    end if;
  end if;
  if (select count(*) from nxu_private.attempts a where a.created_at > now() - interval '1 minute') >= 300 then
    return 'rate_limited';
  end if;

  insert into nxu_private.attempts (ip_hash) values (coalesce(p_ip_hash, 'unknown'));
  delete from nxu_private.attempts a where a.created_at < now() - interval '2 days';

  insert into public.nxu_waitlist (
    name, phone, country_code, source,
    utm_source, utm_medium, utm_campaign, utm_content, utm_term,
    landing_variant, device_type, referrer
  ) values (
    v_name, v_phone, coalesce(nullif(p_country_code, ''), '+55'), left(p_source, 120),
    left(p_utm_source, 120), left(p_utm_medium, 120), left(p_utm_campaign, 200),
    left(p_utm_content, 200), left(p_utm_term, 200),
    left(p_landing_variant, 40),
    case when p_device_type in ('mobile', 'tablet', 'desktop') then p_device_type else 'unknown' end,
    left(p_referrer, 500)
  )
  on conflict (phone) do nothing
  returning id into v_id;

  return case when v_id is null then 'exists' else 'created' end;
end;
$$;

revoke all on function public.nxu_join_waitlist(text, text, text, text, text, text, text, text, text, text, text, text, text, text) from public;
grant execute on function public.nxu_join_waitlist(text, text, text, text, text, text, text, text, text, text, text, text, text, text) to anon, authenticated;

-- ─────────────────────────────────────────────────────────────
-- Contagem pública (só o número; usada pela prova social quando habilitada)
-- ─────────────────────────────────────────────────────────────
create or replace function public.nxu_waitlist_count()
returns bigint
language sql
stable
security definer
set search_path = ''
as $$
  select count(*) from public.nxu_waitlist;
$$;

revoke all on function public.nxu_waitlist_count() from public;
grant execute on function public.nxu_waitlist_count() to anon, authenticated;

-- ─────────────────────────────────────────────────────────────
-- Estatísticas do painel (apenas admins)
-- ─────────────────────────────────────────────────────────────
create or replace function public.nxu_admin_stats(p_tz text default 'America/Sao_Paulo')
returns json
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_today timestamptz := date_trunc('day', now() at time zone p_tz) at time zone p_tz;
begin
  if not public.nxu_is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  return json_build_object(
    'total',  (select count(*) from public.nxu_waitlist),
    'today',  (select count(*) from public.nxu_waitlist w where w.created_at >= v_today),
    'last_7', (select count(*) from public.nxu_waitlist w where w.created_at >= v_today - interval '6 days'),
    'by_source', coalesce((select json_agg(t) from (
        select coalesce(w.source, '—') as label, count(*) as total
        from public.nxu_waitlist w group by 1 order by 2 desc limit 12) t), '[]'::json),
    'by_utm_source', coalesce((select json_agg(t) from (
        select coalesce(w.utm_source, '—') as label, count(*) as total
        from public.nxu_waitlist w group by 1 order by 2 desc limit 12) t), '[]'::json),
    'by_utm_campaign', coalesce((select json_agg(t) from (
        select coalesce(w.utm_campaign, '—') as label, count(*) as total
        from public.nxu_waitlist w group by 1 order by 2 desc limit 12) t), '[]'::json)
  );
end;
$$;

revoke all on function public.nxu_admin_stats(text) from public;
grant execute on function public.nxu_admin_stats(text) to authenticated;

-- ─────────────────────────────────────────────────────────────
-- SETUP MANUAL (rodar uma vez no SQL Editor, trocando os valores):
--
--   insert into nxu_private.settings (key, value)
--   values ('api_secret_sha256', encode(extensions.digest('<WAITLIST_API_SECRET>', 'sha256'), 'hex'))
--   on conflict (key) do update set value = excluded.value;
--
--   -- depois de criar o usuário admin em Authentication → Users:
--   insert into nxu_private.admins (user_id)
--   select id from auth.users where email = 'admin@seudominio.com';
-- ─────────────────────────────────────────────────────────────
