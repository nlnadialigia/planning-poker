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
