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
-- Add moderator_password column to rooms table
ALTER TABLE public.rooms
ADD COLUMN IF NOT EXISTS moderator_password TEXT;

-- Add unique constraint to the name column in rooms table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'public.rooms'::regclass
          AND conname = 'rooms_name_unique'
          AND contype = 'u'
    )
    THEN
        ALTER TABLE public.rooms ADD CONSTRAINT rooms_name_unique UNIQUE (name);
    END IF;
END;
$$;-- HABILITAR SUPABASE REALTIME PARA AS TABELAS PRINCIPAIS
--
-- A replicação lógica do PostgreSQL é o mecanismo que permite ao Supabase
-- transmitir mudanças no banco de dados em tempo real via WebSockets.
--
-- Este script adiciona as tabelas essenciais à publicação 'supabase_realtime',
-- que é o canal que o serviço de realtime do Supabase escuta. Sem isso,
-- nenhuma atualização em tempo real funcionará.

-- Adiciona a tabela 'stories' à publicação do Supabase Realtime
-- Necessário para que os clientes saibam quando uma nova votação começa,
-- é revelada ou é limpa pelo moderador.
ALTER PUBLICATION supabase_realtime ADD TABLE stories;

-- Adiciona a tabela 'votes' à publicação do Supabase Realtime
-- Necessário para que todos os clientes vejam os votos sendo submetidos
-- e para que a lista de participantes seja atualizada com o status de "votou".
ALTER PUBLICATION supabase_realtime ADD TABLE votes;

-- Adiciona a tabela 'participants' à publicação do Supabase Realtime
-- Necessário para que a lista de participantes seja atualizada em tempo real
-- quando um novo usuário entra na sala.
ALTER PUBLICATION supabase_realtime ADD TABLE participants;
-- ADICIONAR POLÍTICA DE EXCLUSÃO PARA PARTICIPANTES
--
-- A Segurança em Nível de Linha (RLS) do Supabase bloqueia por padrão
-- qualquer ação que não seja explicitamente permitida por uma política.
--
-- Este script adiciona a política necessária para permitir que a aplicação
-- remova registros da tabela 'participants', seja quando um usuário
-- clica em "Voltar" ou quando o moderador o remove da sala.

CREATE POLICY "Anyone can remove participants"
ON public.participants
FOR DELETE
USING (true);
-- TORNAR A SENHA DO MODERADOR OBRIGATÓRIA
--
-- Esta alteração de segurança garante que toda sala criada tenha uma
-- senha de moderador associada, impedindo a criação de salas sem proteção.
--
-- ATENÇÃO: Antes de executar este script em um banco de dados existente,
-- é crucial garantir que todas as salas na tabela 'public.rooms' já
-- possuam um valor na coluna 'moderator_password'. Se houver salas com
-- a senha nula, este comando ALTER TABLE irá falhar.

ALTER TABLE public.rooms
ALTER COLUMN moderator_password SET NOT NULL;
-- ADICIONAR RESTRIÇÃO DE PARTICIPANTE ÚNICO POR SALA
--
-- Esta alteração de segurança e integridade de dados garante que não
-- possam existir dois participantes com o mesmo nome dentro da mesma sala.
--
-- Isso é implementado através de uma restrição UNIQUE na combinação das
-- colunas 'room_id' and 'name'.
--
-- Esta restrição é também um pré-requisito para o comando 'upsert' do
-- Supabase funcionar corretamente, o que corrige o bug ao tentar
-- entrar em uma sala existente como moderador.

ALTER TABLE public.participants
ADD CONSTRAINT participants_room_id_name_key UNIQUE (room_id, name);
-- REMOVER RESTRIÇÃO DE PARTICIPANTE ÚNICO POR SALA
--
-- Este script reverte a alteração introduzida no arquivo 006.
-- A restrição que impedia nomes duplicados na mesma sala está sendo
-- removida para permitir que múltiplos participantes com o mesmo nome
-- possam entrar em uma sessão, o que é um cenário de uso válido.
--
-- A lógica para lidar com múltiplos moderadores com o mesmo nome será
-- tratada na camada da aplicação, e não no banco de dados.

ALTER TABLE public.participants
DROP CONSTRAINT IF EXISTS participants_room_id_name_key;
