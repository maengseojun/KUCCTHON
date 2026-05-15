-- Add thank_you_count to targets
alter table public.targets
  add column thank_you_count integer not null default 0
  constraint thank_you_count_non_negative check (thank_you_count >= 0);

-- Atomic increment function (avoids race conditions)
create or replace function public.increment_thank_you_count(target_id uuid, owner_id uuid)
returns public.targets
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.targets;
begin
  update public.targets
    set thank_you_count = thank_you_count + 1
    where id = target_id and user_id = owner_id
    returning * into result;

  if not found then
    raise exception 'Target not found or not owned by user';
  end if;

  return result;
end;
$$;

-- Atomic decrement function (floors at 0)
create or replace function public.decrement_thank_you_count(target_id uuid, owner_id uuid)
returns public.targets
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.targets;
begin
  update public.targets
    set thank_you_count = greatest(0, thank_you_count - 1)
    where id = target_id and user_id = owner_id
    returning * into result;

  if not found then
    raise exception 'Target not found or not owned by user';
  end if;

  return result;
end;
$$;
