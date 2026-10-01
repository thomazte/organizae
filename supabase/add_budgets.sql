-- Organizaê · migração para quem já rodou schema.sql antes dos orçamentos.
-- Cole no SQL Editor do Supabase e clique em Run.

create table if not exists public.budgets (
  id          text        not null,
  user_id     uuid        not null references auth.users(id) on delete cascade,
  data        jsonb       not null,
  updated_at  timestamptz not null default now(),
  primary key (user_id, id)
);

create index if not exists idx_budgets_user on public.budgets(user_id);

alter table public.budgets enable row level security;

drop policy if exists "owner_all_budgets" on public.budgets;
create policy "owner_all_budgets" on public.budgets
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
