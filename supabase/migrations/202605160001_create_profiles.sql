create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  birthday date,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Authenticated users can read profiles"
  on public.profiles
  for select
  to authenticated
  using (true);

create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name, birthday)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), '사용자'),
    nullif(new.raw_user_meta_data ->> 'birthday', '')::date
  );

  return new;
end;
$$;

insert into public.profiles (id, name, birthday)
select
  auth_users.id,
  coalesce(nullif(trim(auth_users.raw_user_meta_data ->> 'name'), ''), '사용자'),
  nullif(auth_users.raw_user_meta_data ->> 'birthday', '')::date
from auth.users as auth_users
on conflict (id) do nothing;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
