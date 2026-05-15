create table if not exists public."thank-yous" (
  id uuid primary key default gen_random_uuid(),
  from_id uuid not null references auth.users(id) on delete cascade,
  to_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (char_length(trim(content)) > 0),
  entry_date date not null default ((timezone('Asia/Seoul', now()))::date),
  created_at timestamptz not null default now()
);

alter table public."thank-yous"
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists entry_date date not null default ((timezone('Asia/Seoul', now()))::date);

create index if not exists idx_thank_yous_from_id
  on public."thank-yous"(from_id);

create index if not exists idx_thank_yous_from_entry_date
  on public."thank-yous"(from_id, entry_date);

alter table public."thank-yous" enable row level security;

drop policy if exists "Users can read sent thank yous" on public."thank-yous";
create policy "Users can read sent thank yous"
  on public."thank-yous"
  for select
  to authenticated
  using ((select auth.uid()) = from_id);

drop policy if exists "Users can insert own thank yous" on public."thank-yous";
create policy "Users can insert own thank yous"
  on public."thank-yous"
  for insert
  to authenticated
  with check ((select auth.uid()) = from_id);

drop policy if exists "Users can update own thank yous" on public."thank-yous";
create policy "Users can update own thank yous"
  on public."thank-yous"
  for update
  to authenticated
  using ((select auth.uid()) = from_id)
  with check ((select auth.uid()) = from_id);

drop policy if exists "Users can delete own thank yous" on public."thank-yous";
create policy "Users can delete own thank yous"
  on public."thank-yous"
  for delete
  to authenticated
  using ((select auth.uid()) = from_id);
