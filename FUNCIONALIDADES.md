# Documentação da Aplicação Planning Poker

Esta documentação descreve as principais funcionalidades e os passos de configuração da aplicação Planning Poker.

## Configuração do Ambiente

Para que a aplicação funcione corretamente, especialmente as funcionalidades em tempo real, duas configurações são essenciais.

### 1. Variáveis de Ambiente (`.env.local`)

Crie um arquivo chamado `.env.local` na raiz do projeto e adicione as quatro chaves do seu projeto Supabase.

```bash
# Para o cliente (navegador)
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO_URL.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANONIMA_PUBLICA

# Para o servidor (Server Actions)
SUPABASE_URL=https://SEU_PROJETO_URL.supabase.co
SUPABASE_ANON_KEY=SUA_CHAVE_ANONIMA_PUBLICA
```
**Importante:** Após criar ou alterar este arquivo, reinicie o servidor de desenvolvimento.

### 2. Configuração do Banco de Dados

Os scripts SQL na pasta `/scripts` definem a estrutura do banco de dados. Execute-os no SQL Editor do seu projeto Supabase na ordem correta.

- **`001_create_tables.sql`**: Cria as tabelas iniciais.
- **`002_add_password_and_unique_name.sql`**: Adiciona melhorias à tabela de salas.
- **`003_enable_realtime_replication.sql`**: Habilita o serviço de Realtime.
- **`004_add_participant_delete_policy.sql`**: Permite que a aplicação delete participantes.
- **`005_require_moderator_password.sql`**: Torna a senha do moderador obrigatória.
- **`007_remove_unique_participant_constraint.sql`**: (Opcional, apenas se você executou o script 006) Remove a restrição de nome único para permitir múltiplos participantes com o mesmo nome na sala.

---

## Visão Geral

A aplicação permite que times realizem sessões de Planning Poker de forma remota, com visões distintas para **Moderadores** e **Participantes**.

## Funcionalidades Principais

### 1. Criação e Acesso a Salas

- **Nomes Duplicados Permitidos**: Múltiplos participantes podem ter o mesmo nome na mesma sala.
- **Senha de Moderador Obrigatória**: Para criar uma sala ou entrar como moderador em uma sala existente, a senha correta é necessária.
- **Acesso via URL**: A URL da sala contém um ID de participante (`pid`) para identificar cada usuário de forma única.

### 2. A Visão do Moderador

- **Controles da Votação**: Iniciar, Revelar e Limpar votos.
- **Gerenciamento de Participantes**: O moderador pode remover um participante da sala.
- **Painel de Acompanhamento**: Vê em tempo real quem já votou.
- **Visualização de Resultados**: Ao revelar, vê uma tabela com os votos e o voto mais popular.

### 3. A Visão do Participante

- **Pirâmide de Votos**: Interface de votação visualmente agradável.
- **Feedback Instantâneo**: O card selecionado fica destacado imediatamente.
- **Avatar Pessoal**: O avatar do próprio participante é destacado na lista.
- **Sair da Sala**: Ao clicar em "Voltar", o participante é removido da sala.

---

## Como Funciona o Tempo Real? (Explicação Técnica)

A aplicação utiliza o **Supabase Realtime** (via WebSockets) para manter a interface de todos os usuários sincronizada com o banco de dados PostgreSQL. Isso é possível ativando a **Replicação Lógica** do Postgres (script `003_...`), que "anuncia" todas as mudanças de dados para o servidor do Supabase, que por sua vez as transmite para os clientes conectados.