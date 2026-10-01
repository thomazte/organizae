-- ============================================================================
-- Organizaê · Planner Financeiro — Esquema do banco (Supabase / PostgreSQL)
-- ----------------------------------------------------------------------------
-- Como usar:
--   1. Crie um projeto gratuito em https://supabase.com
--   2. Abra "SQL Editor" no painel do projeto
--   3. Cole TODO este arquivo e clique em "Run"
--   4. Copie a Project URL e a anon key (Project Settings > API) para o .env
--
-- Modelo: cada entidade é guardada como JSONB, com chave composta (user_id,id).
-- O Row Level Security garante que cada usuário só acessa os próprios dados.
-- ============================================================================

-- Tabela genérica reaproveitada para as entidades do app.
create table if not exists public.categories (
  id          text        not null,
  user_id     uuid        not null references auth.users(id) on delete cascade,
  data        jsonb       not null,
  updated_at  timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists public.payment_methods (
  id          text        not null,
  user_id     uuid        not null references auth.users(id) on delete cascade,
  data        jsonb       not null,
  updated_at  timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists public.transactions (
  id          text        not null,
  user_id     uuid        not null references auth.users(id) on delete cascade,
  data        jsonb       not null,
  updated_at  timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists public.goals (
  id          text        not null,
  user_id     uuid        not null references auth.users(id) on delete cascade,
  data        jsonb       not null,
  updated_at  timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists public.budgets (
  id          text        not null,
  user_id     uuid        not null references auth.users(id) on delete cascade,
  data        jsonb       not null,
  updated_at  timestamptz not null default now(),
  primary key (user_id, id)
);

-- Perfil do usuário (nome + avatar). Uma linha por usuário.
create table if not exists public.profiles (
  user_id     uuid        primary key references auth.users(id) on delete cascade,
  data        jsonb       not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

-- Índices por usuário (consultas de leitura).
create index if not exists idx_categories_user      on public.categories(user_id);
create index if not exists idx_payment_methods_user on public.payment_methods(user_id);
create index if not exists idx_transactions_user    on public.transactions(user_id);
create index if not exists idx_goals_user           on public.goals(user_id);
create index if not exists idx_budgets_user         on public.budgets(user_id);

-- ----------------------------------------------------------------------------
-- Row Level Security: cada usuário só acessa as próprias linhas.
-- ----------------------------------------------------------------------------
alter table public.categories      enable row level security;
alter table public.payment_methods enable row level security;
alter table public.transactions    enable row level security;
alter table public.goals           enable row level security;
alter table public.budgets         enable row level security;
alter table public.profiles        enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['categories', 'payment_methods', 'transactions', 'goals', 'budgets', 'profiles']
  loop
    execute format($f$
      drop policy if exists "owner_all_%1$s" on public.%1$s;
      create policy "owner_all_%1$s" on public.%1$s
        for all
        using (auth.uid() = user_id)
        with check (auth.uid() = user_id);
    $f$, t);
  end loop;
end $$;
