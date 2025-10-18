-- Adiciona a coluna "color" à tabela de participantes para armazenar a cor do avatar.
-- A cor padrão é branca (#FFFFFF), mas será definida programaticamente na aplicação.

ALTER TABLE participants
ADD COLUMN color VARCHAR(7) NOT NULL DEFAULT '#FFFFFF';
