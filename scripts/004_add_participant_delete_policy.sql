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
