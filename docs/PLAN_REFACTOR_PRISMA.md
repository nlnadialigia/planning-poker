# Plano de Implementação - Migração para Prisma e Melhorias Funcionais

Este plano descreve as etapas para migrar a lógica de banco de dados das Server Actions (atualmente usando Supabase direto) para o Prisma ORM, utilizando uma arquitetura de Camada de Serviço (Service Layer) e validação robusta com Zod.

## Mudanças Propostas

### Camada de Serviços (Service Layer)
Criaremos uma camada intermediária para isolar a lógica de negócio do Prisma.

#### [NEW] [room.service.ts](file:///home/nlnadialigia/www/planning-poker/lib/services/room.service.ts)
- Gerenciamento de salas (criação, busca, verificação de senha).
#### [NEW] [participant.service.ts](file:///home/nlnadialigia/www/planning-poker/lib/services/participant.service.ts)
- Gerenciamento de participantes (entrada, saída, busca).
#### [NEW] [story.service.ts](file:///home/nlnadialigia/www/planning-poker/lib/services/story.service.ts)
- Gerenciamento de histórias/tarefas (criação, revelação de votos).
#### [NEW] [vote.service.ts](file:///home/nlnadialigia/www/planning-poker/lib/services/vote.service.ts)
- Registro e limpeza de votos.

---

### Server Actions
Refatoração das ações existentes para utilizar os serviços e Zod.

#### [MODIFY] [create-rooms.ts](file:///home/nlnadialigia/www/planning-poker/app/actions/create-rooms.ts)
- Utilizar `RoomService` e `ParticipantService`.
- Validar inputs com Zod.
#### [MODIFY] [join-rooms.ts](file:///home/nlnadialigia/www/planning-poker/app/actions/join-rooms.ts)
- Utilizar `ParticipantService`.
- Corrigir a geração de cores (gerar no servidor se necessário ou usar default).
#### [MODIFY] [vote.ts](file:///home/nlnadialigia/www/planning-poker/app/actions/vote.ts)
- Utilizar `StoryService` e `VoteService`.
- Validar valores dos votos.
#### [MODIFY] [leave-room.ts](file:///home/nlnadialigia/www/planning-poker/app/actions/leave-room.ts)
- Utilizar `ParticipantService`.

---

### Segurança e Validação
- Implementar schemas Zod em `lib/validations/`.
- Adicionar tratamento de erros centralizado.

## Plano de Verificação

### Testes Manuais
1. **Criação de Sala**:
   - Acessar `/`.
   - Preencher nome da sala, seu nome e senha do moderador.
   - Verificar se a sala é criada no banco (via Prisma Studio: `pnpm studio`).
   - Verificar se o redirecionamento ocorre corretamente.
2. **Entrada na Sala**:
   - Compartilhar o link ou entrar em uma sala existente.
   - Verificar se o participante é adicionado.
   - Testar validação de nome duplicado.
3. **Votação**:
   - Realizar um voto como participante.
   - Revelar votos como moderador.
   - Verificar se os dados persistem e resetam corretamente.

### Comandos de Verificação
- `pnpm dev`: Rodar o servidor local.
- `pnpm prisma studio`: Verificar dados no banco.
- `pnpm lint`: Garantir integridade do código.
