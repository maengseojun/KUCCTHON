create table public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_id uuid not null references public.targets(id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  event_date date not null,
  category text not null check (category in ('birthday', 'anniversary', 'memorial', 'custom')),
  recurs_yearly boolean not null default true,
  notify_days_before integer not null default 3 check (
    notify_days_before >= 0 and notify_days_before <= 30
  ),
  memo text,
  created_at timestamptz not null default now()
);

create index idx_events_user_id on public.events(user_id);
create index idx_events_target_id on public.events(target_id);
create index idx_events_user_date on public.events(user_id, event_date);
create index idx_events_user_category on public.events(user_id, category);

alter table public.events enable row level security;

create policy "Users can read own events"
  on public.events
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own events"
  on public.events
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.targets
      where targets.id = events.target_id
        and targets.user_id = (select auth.uid())
    )
  );

create policy "Users can update own events"
  on public.events
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.targets
      where targets.id = events.target_id
        and targets.user_id = (select auth.uid())
    )
  );

create policy "Users can delete own events"
  on public.events
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
