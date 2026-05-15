create table public."thank-yous" (
  id uuid primary key default gen_random_uuid(),
  from_id uuid not null references auth.users(id) on delete cascade,
  to_id uuid references auth.users(id) on delete set null,
  target_id uuid references public.targets(id) on delete set null,
  date date not null,
  content text not null check (char_length(trim(content)) > 0),
  created_at timestamptz not null default now(),
  constraint thank_yous_single_recipient check ((to_id is null) <> (target_id is null))
);

create index idx_thank_yous_from_id on public."thank-yous"(from_id);
create index idx_thank_yous_to_id on public."thank-yous"(to_id);
create index idx_thank_yous_target_id on public."thank-yous"(target_id);
create index idx_thank_yous_date on public."thank-yous"(date);

alter table public."thank-yous" enable row level security;

create policy "Users can read own thank_yous"
  on public."thank-yous"
  for select
  to authenticated
  using ((select auth.uid()) = from_id);

create policy "Users can insert own thank_yous"
  on public."thank-yous"
  for insert
  to authenticated
  with check (
    (select auth.uid()) = from_id
    and (
      target_id is null
      or exists (
        select 1
        from public.targets
        where targets.id = "thank-yous".target_id
          and targets.user_id = (select auth.uid())
      )
    )
  );

create policy "Users can delete own thank_yous"
  on public."thank-yous"
  for delete
  to authenticated
  using ((select auth.uid()) = from_id);
