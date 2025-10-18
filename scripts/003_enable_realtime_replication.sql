-- HABILITAR SUPABASE REALTIME PARA AS TABELAS PRINCIPAIS
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
