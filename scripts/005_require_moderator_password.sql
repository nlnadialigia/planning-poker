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
