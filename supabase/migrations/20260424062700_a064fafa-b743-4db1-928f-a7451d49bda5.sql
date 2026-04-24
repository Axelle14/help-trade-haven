-- =========================================================
-- PROFILES
-- =========================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- CONVERSATIONS  (1-on-1; participant_a < participant_b enforced)
-- =========================================================
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  participant_a uuid not null references auth.users(id) on delete cascade,
  participant_b uuid not null references auth.users(id) on delete cascade,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint participants_ordered check (participant_a < participant_b),
  constraint participants_distinct check (participant_a <> participant_b),
  unique (participant_a, participant_b)
);

alter table public.conversations enable row level security;

-- Security definer helper to avoid recursive RLS lookups
create or replace function public.is_conversation_participant(_conversation_id uuid, _user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.conversations
    where id = _conversation_id
      and (_user_id = participant_a or _user_id = participant_b)
  )
$$;

create policy "Participants can view their conversations"
  on public.conversations for select
  using (auth.uid() = participant_a or auth.uid() = participant_b);

create policy "Users can create conversations they are part of"
  on public.conversations for insert
  with check (auth.uid() = participant_a or auth.uid() = participant_b);

create policy "Participants can update last_message_at"
  on public.conversations for update
  using (auth.uid() = participant_a or auth.uid() = participant_b);

create index conversations_participant_a_idx on public.conversations(participant_a, last_message_at desc);
create index conversations_participant_b_idx on public.conversations(participant_b, last_message_at desc);

-- =========================================================
-- MESSAGES
-- =========================================================
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 4000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "Participants can read messages"
  on public.messages for select
  using (public.is_conversation_participant(conversation_id, auth.uid()));

create policy "Sender can post messages in their conversation"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and public.is_conversation_participant(conversation_id, auth.uid())
  );

-- Recipient can mark a message as read (sender cannot edit their own read state)
create policy "Recipient can mark messages as read"
  on public.messages for update
  using (
    public.is_conversation_participant(conversation_id, auth.uid())
    and auth.uid() <> sender_id
  )
  with check (
    public.is_conversation_participant(conversation_id, auth.uid())
    and auth.uid() <> sender_id
  );

create index messages_conversation_idx on public.messages(conversation_id, created_at desc);
create index messages_unread_idx on public.messages(conversation_id, read_at) where read_at is null;

-- Bump conversations.last_message_at when a message is inserted
create or replace function public.bump_conversation_last_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
  set last_message_at = new.created_at
  where id = new.conversation_id;
  return new;
end;
$$;

create trigger on_message_inserted
  after insert on public.messages
  for each row execute function public.bump_conversation_last_message();

-- =========================================================
-- REALTIME
-- =========================================================
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversations;