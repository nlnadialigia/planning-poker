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
