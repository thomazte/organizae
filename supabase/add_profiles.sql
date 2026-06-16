-- ============================================================================
-- Migração: adiciona a tabela de PERFIL (nome + avatar).
-- Rode este script no SQL Editor do Supabase caso já tenha executado o
-- schema.sql anteriormente (sem a tabela profiles).
-- ============================================================================

create table if not exists public.profiles (
  user_id     uuid        primary key references auth.users(id) on delete cascade,
  data        jsonb       not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "owner_all_profiles" on public.profiles;
create policy "owner_all_profiles" on public.profiles
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
