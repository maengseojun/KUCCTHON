create table public.targets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  type text not null check (type in ('partner', 'parent', 'friend', 'other')),
  memo text,
  created_at timestamptz not null default now()
);

create index idx_targets_user_id on public.targets(user_id);
create index idx_targets_user_type on public.targets(user_id, type);

alter table public.targets enable row level security;

create policy "Users can read own targets"
  on public.targets
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own targets"
  on public.targets
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own targets"
  on public.targets
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own targets"
  on public.targets
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
