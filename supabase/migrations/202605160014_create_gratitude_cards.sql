create table public.gratitude_cards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  target_id uuid not null references public.targets(id) on delete cascade,
  public_token text not null unique check (char_length(trim(public_token)) >= 16),
  snapshot jsonb not null,
  created_at timestamptz not null default now(),
  constraint gratitude_cards_snapshot_object check (jsonb_typeof(snapshot) = 'object'),
  constraint gratitude_cards_snapshot_required_fields check (
    snapshot ? 'recipient_name'
    and snapshot ? 'sender_name'
    and snapshot ? 'summary_text'
    and snapshot ? 'source_entries'
    and jsonb_typeof(snapshot -> 'recipient_name') = 'string'
    and jsonb_typeof(snapshot -> 'sender_name') = 'string'
    and jsonb_typeof(snapshot -> 'summary_text') = 'string'
    and jsonb_typeof(snapshot -> 'source_entries') = 'array'
  )
);

create index idx_gratitude_cards_owner_id on public.gratitude_cards(owner_id);
create index idx_gratitude_cards_target_id on public.gratitude_cards(target_id);

grant select, insert on public.gratitude_cards to authenticated;

alter table public.gratitude_cards enable row level security;

create policy "Users can read own gratitude cards"
  on public.gratitude_cards
  for select
  to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Users can insert own gratitude cards"
  on public.gratitude_cards
  for insert
  to authenticated
  with check (
    (select auth.uid()) = owner_id
    and exists (
      select 1
      from public.targets
      where targets.id = gratitude_cards.target_id
        and targets.user_id = (select auth.uid())
    )
  );

create or replace function public.get_public_gratitude_card_by_token(card_token text)
returns table (
  id uuid,
  public_token text,
  snapshot jsonb,
  created_at timestamptz
)
language sql
security definer
set search_path = ''
as $$
  select
    gratitude_cards.id,
    gratitude_cards.public_token,
    gratitude_cards.snapshot,
    gratitude_cards.created_at
  from public.gratitude_cards
  where gratitude_cards.public_token = card_token
  limit 1;
$$;

revoke execute on function public.get_public_gratitude_card_by_token(text) from public;
grant execute on function public.get_public_gratitude_card_by_token(text) to anon, authenticated;
