-- Planning Poker - Schema sem autenticação
-- Qualquer pessoa pode criar salas e participar

-- Create rooms table
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  code text unique not null,
  moderator_password text,
  created_at timestamp with time zone default now() not null,
  is_active boolean default true not null
);

-- Create participants table (sem auth, apenas nome)
create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.rooms(id) on delete cascade not null,
  name text not null,
  is_moderator boolean default false not null,
  joined_at timestamp with time zone default now() not null
);

-- Create stories table
create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.rooms(id) on delete cascade not null,
  title text not null,
  description text,
  is_revealed boolean default false not null,
  created_at timestamp with time zone default now() not null
);

-- Create votes table
create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  story_id uuid references public.stories(id) on delete cascade not null,
  participant_id uuid references public.participants(id) on delete cascade not null,
  value text not null,
  created_at timestamp with time zone default now() not null,
  unique(story_id, participant_id)
);

-- Enable Row Level Security (mas permitir acesso público)
alter table public.rooms enable row level security;
alter table public.participants enable row level security;
alter table public.stories enable row level security;
alter table public.votes enable row level security;

-- RLS Policies - Permitir acesso público para leitura e escrita
create policy "Anyone can view rooms"
  on public.rooms for select
  using (true);

create policy "Anyone can create rooms"
  on public.rooms for insert
  with check (true);

create policy "Anyone can update rooms"
  on public.rooms for update
  using (true);

create policy "Anyone can view participants"
  on public.participants for select
  using (true);

create policy "Anyone can join as participant"
  on public.participants for insert
  with check (true);

create policy "Anyone can view stories"
  on public.stories for select
  using (true);

create policy "Anyone can create stories"
  on public.stories for insert
  with check (true);

create policy "Anyone can update stories"
  on public.stories for update
  using (true);

create policy "Anyone can view votes"
  on public.votes for select
  using (true);

create policy "Anyone can create votes"
  on public.votes for insert
  with check (true);

create policy "Anyone can update votes"
  on public.votes for update
  using (true);

create policy "Anyone can delete votes"
  on public.votes for delete
  using (true);

-- Create indexes for better performance
create index if not exists idx_rooms_code on public.rooms(code);
create index if not exists idx_participants_room_id on public.participants(room_id);
create index if not exists idx_stories_room_id on public.stories(room_id);
create index if not exists idx_votes_story_id on public.votes(story_id);
