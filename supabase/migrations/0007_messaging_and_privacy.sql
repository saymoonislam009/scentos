-- Direct messaging between buyer and seller, tied to a listing.
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.partial_bottle_listings(id) on delete set null,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  unique(listing_id, buyer_id, seller_id)
);
create index if not exists conversations_buyer_idx on public.conversations(buyer_id, last_message_at desc);
create index if not exists conversations_seller_idx on public.conversations(seller_id, last_message_at desc);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists messages_conversation_idx on public.messages(conversation_id, created_at);

alter table public.conversations enable row level security;
drop policy if exists "participants see conversation" on public.conversations;
create policy "participants see conversation" on public.conversations for select using (auth.uid() = buyer_id or auth.uid() = seller_id);
drop policy if exists "buyer starts conversation" on public.conversations;
create policy "buyer starts conversation" on public.conversations for insert with check (auth.uid() = buyer_id and buyer_id <> seller_id);

alter table public.messages enable row level security;
drop policy if exists "participants see messages" on public.messages;
create policy "participants see messages" on public.messages for select using (
  exists (select 1 from public.conversations c where c.id = conversation_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid()))
);
drop policy if exists "participants send messages" on public.messages;
create policy "participants send messages" on public.messages for insert with check (
  auth.uid() = sender_id and exists (select 1 from public.conversations c where c.id = conversation_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid()))
);
drop policy if exists "participants mark read" on public.messages;
create policy "participants mark read" on public.messages for update using (
  exists (select 1 from public.conversations c where c.id = conversation_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid()))
);

create or replace function public.touch_conversation() returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.conversations set last_message_at = new.created_at where id = new.conversation_id;
  return new;
end; $$;
drop trigger if exists on_message_insert on public.messages;
create trigger on_message_insert after insert on public.messages
  for each row execute function public.touch_conversation();

-- Privacy: phone/contact info becomes optional and hideable. In-app
-- messaging works regardless of whether it's shown.
alter table public.partial_bottle_listings alter column contact_info drop not null;
alter table public.partial_bottle_listings add column if not exists show_contact_publicly boolean not null default true;
