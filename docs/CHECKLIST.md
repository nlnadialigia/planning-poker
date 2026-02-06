# ✅ Checklist de Implementação - Planning Poker

## 🚀 Fase 1: Correções Críticas (1 semana)

### Dia 1: Segurança Básica
- [ ] Instalar dependências de segurança
  ```bash
  pnpm add bcryptjs zod
  pnpm add -D @types/bcryptjs
  ```
- [ ] Criar `lib/auth/password.ts` com funções de hash
- [ ] Criar `lib/validations/room.ts` com schemas Zod
- [ ] Testar hash de senha localmente
- [ ] Testar validação com dados inválidos

### Dia 2: Refatorar Server Actions
- [ ] Corrigir variáveis de ambiente em `lib/supabase/server.ts`
- [ ] Refatorar `app/actions/create-rooms.ts`
  - [ ] Adicionar validação Zod
  - [ ] Implementar hash de senha
  - [ ] Melhorar tratamento de erros
- [ ] Refatorar `app/actions/join-rooms.ts`
  - [ ] Adicionar validação Zod
  - [ ] Melhorar tratamento de erros
- [ ] Testar criação de sala
- [ ] Testar entrada na sala

### Dia 3: Completar Refatoração
- [ ] Refatorar `app/actions/vote.ts`
  - [ ] Adicionar validação Zod
  - [ ] Validar estado da história
- [ ] Refatorar `app/actions/leave-room.ts`
  - [ ] Adicionar validação
- [ ] Refatorar `app/actions/participant.ts`
  - [ ] Adicionar validação
- [ ] Testar todos os fluxos

### Dia 4: UI/UX Improvements
- [ ] Criar `components/ui/loading.tsx`
- [ ] Criar `components/error-boundary.tsx`
- [ ] Instalar e configurar Sonner
  ```bash
  pnpm add sonner
  ```
- [ ] Adicionar `ToastProvider` ao layout
- [ ] Adicionar toasts nos Server Actions
- [ ] Testar loading states
- [ ] Testar error boundaries

### Dia 5: Testes e Deploy
- [ ] Testar todos os fluxos em desenvolvimento
  - [ ] Criar sala
  - [ ] Entrar como participante
  - [ ] Votar
  - [ ] Revelar votos
  - [ ] Sair da sala
- [ ] Fazer backup do banco de dados
- [ ] Deploy em preview (Vercel)
- [ ] Testar em preview
- [ ] Deploy em produção
- [ ] Monitorar erros

## 🔄 Fase 2: Migração Prisma (1-2 semanas)

### Semana 1: Setup e Configuração
- [ ] Instalar Prisma
  ```bash
  pnpm add @prisma/client
  pnpm add -D prisma
  ```
- [ ] Inicializar Prisma
  ```bash
  npx prisma init
  ```
- [ ] Configurar `DATABASE_URL` no `.env.local`
- [ ] Copiar schema do arquivo `prisma/schema.prisma` (já criado)
- [ ] Gerar cliente Prisma
  ```bash
  npx prisma generate
  ```
- [ ] Criar `lib/prisma.ts` com cliente singleton
- [ ] Testar conexão com Prisma Studio
  ```bash
  npx prisma studio
  ```

### Semana 2: Migração Gradual
- [ ] Criar branch `feature/prisma-migration`
- [ ] Refatorar `create-rooms.ts` para usar Prisma
- [ ] Testar criação de sala com Prisma
- [ ] Refatorar `join-rooms.ts` para usar Prisma
- [ ] Testar entrada na sala com Prisma
- [ ] Refatorar `vote.ts` para usar Prisma
- [ ] Testar votação com Prisma
- [ ] Refatorar demais Server Actions
- [ ] Verificar se Realtime continua funcionando
- [ ] Testes completos em desenvolvimento
- [ ] Deploy em preview
- [ ] Testes em preview
- [ ] Merge para main
- [ ] Deploy em produção

## 🔒 Fase 3: Segurança Avançada (1 semana)

### Dia 1-2: Rate Limiting
- [ ] Decidir: Upstash ou implementação simples?
- [ ] Se Upstash:
  ```bash
  pnpm add @upstash/ratelimit @upstash/redis
  ```
  - [ ] Criar conta no Upstash
  - [ ] Configurar variáveis de ambiente
  - [ ] Criar `lib/rate-limit.ts`
- [ ] Se implementação simples:
  - [ ] Criar `lib/rate-limit/simple.ts`
- [ ] Adicionar rate limiting em Server Actions
- [ ] Testar com múltiplas requisições
- [ ] Ajustar limites conforme necessário

### Dia 3-4: Monitoramento
- [ ] Decidir: Sentry ou logging simples?
- [ ] Se Sentry:
  ```bash
  pnpm add @sentry/nextjs
  npx @sentry/wizard@latest -i nextjs
  ```
  - [ ] Criar conta no Sentry
  - [ ] Configurar DSN
  - [ ] Testar captura de erros
- [ ] Se logging simples:
  - [ ] Criar `lib/logger.ts`
  - [ ] Adicionar logs em pontos críticos
- [ ] Configurar Vercel Analytics (já instalado)
- [ ] Criar dashboard de métricas

### Dia 5: Sanitização e Validação Extra
- [ ] Instalar DOMPurify
  ```bash
  pnpm add dompurify
  pnpm add -D @types/dompurify
  ```
- [ ] Criar `lib/security/sanitize.ts`
- [ ] Adicionar sanitização em inputs críticos
- [ ] Revisar todas as validações
- [ ] Testar com inputs maliciosos
- [ ] Documentar práticas de segurança

## 🧪 Fase 4: Testes (1-2 semanas)

### Semana 1: Setup e Testes Unitários
- [ ] Instalar dependências de teste
  ```bash
  pnpm add -D vitest @testing-library/react @testing-library/jest-dom
  pnpm add -D @vitejs/plugin-react jsdom
  ```
- [ ] Criar `vitest.config.ts`
- [ ] Criar `vitest.setup.ts`
- [ ] Adicionar script de teste no `package.json`
  ```json
  "test": "vitest",
  "test:ui": "vitest --ui"
  ```
- [ ] Escrever testes para validações
  - [ ] `__tests__/lib/validations/room.test.ts`
- [ ] Escrever testes para componentes UI
  - [ ] `__tests__/components/voting-cards.test.tsx`
  - [ ] `__tests__/components/participants-list.test.tsx`
- [ ] Escrever testes para utils
  - [ ] `__tests__/lib/auth/password.test.ts`
- [ ] Rodar testes e corrigir falhas
- [ ] Verificar cobertura
  ```bash
  npx vitest --coverage
  ```

### Semana 2: Testes de Integração e CI/CD
- [ ] Escrever testes de integração para Server Actions
  - [ ] Mock do Supabase/Prisma
  - [ ] Testar fluxos completos
- [ ] Criar `.github/workflows/ci.yml`
- [ ] Configurar GitHub Actions
  - [ ] Lint
  - [ ] Type check
  - [ ] Tests
  - [ ] Build
- [ ] Adicionar secrets no GitHub
  - [ ] `DATABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Testar CI em PR
- [ ] Configurar branch protection rules
- [ ] Documentar processo de CI/CD

## 🎨 Fase 5: Funcionalidades Extras (Opcional)

### Histórico de Votações
- [ ] Adicionar model `VotingSession` ao Prisma
- [ ] Criar migration
- [ ] Implementar salvamento de sessões
- [ ] Criar componente de histórico
- [ ] Adicionar rota de histórico
- [ ] Testar funcionalidade

### Exportação de Resultados
- [ ] Criar `app/actions/export-results.ts`
- [ ] Implementar geração de CSV
- [ ] Adicionar botão de exportação
- [ ] Testar download
- [ ] Adicionar opção de PDF (opcional)

### Timer para Votações
- [ ] Criar `components/room/voting-timer.tsx`
- [ ] Adicionar controle de timer no moderador
- [ ] Implementar notificação de tempo esgotado
- [ ] Testar sincronização entre participantes

### Notificações Push
- [ ] Implementar Service Worker
- [ ] Adicionar permissão de notificações
- [ ] Criar `lib/notifications.ts`
- [ ] Enviar notificações em eventos importantes
- [ ] Testar em diferentes navegadores

## 📚 Documentação

### Código
- [ ] Adicionar JSDoc em funções principais
- [ ] Documentar Server Actions
- [ ] Documentar componentes complexos
- [ ] Criar `CONTRIBUTING.md`
- [ ] Atualizar `README.md` com novas features

### Usuário
- [ ] Criar guia de uso para moderadores
- [ ] Criar guia de uso para participantes
- [ ] Adicionar FAQ
- [ ] Criar vídeo tutorial (opcional)
- [ ] Adicionar tooltips na UI

## 🎯 Verificação Final

### Performance
- [ ] Rodar Lighthouse
  - [ ] Performance > 90
  - [ ] Accessibility > 90
  - [ ] Best Practices > 90
  - [ ] SEO > 90
- [ ] Verificar bundle size
  ```bash
  pnpm build
  npx @next/bundle-analyzer
  ```
- [ ] Otimizar imagens
- [ ] Adicionar lazy loading onde necessário
- [ ] Verificar Core Web Vitals

### Segurança
- [ ] Todas as senhas hasheadas ✅
- [ ] Validação em todos os inputs ✅
- [ ] Rate limiting ativo ✅
- [ ] Sanitização de dados ✅
- [ ] HTTPS em produção ✅
- [ ] Headers de segurança configurados
- [ ] Sem secrets no código

### Qualidade
- [ ] Cobertura de testes > 80%
- [ ] Zero erros no ESLint
- [ ] Zero erros no TypeScript
- [ ] Código revisado
- [ ] Documentação completa
- [ ] Changelog atualizado

### Deploy
- [ ] Backup do banco de dados
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy em produção
- [ ] Smoke tests em produção
- [ ] Monitoramento ativo
- [ ] Rollback plan documentado

## 📊 Métricas de Progresso

### Fase 1: Correções Críticas
- Progresso: [ ] 0% [ ] 25% [ ] 50% [ ] 75% [ ] 100%
- Tempo estimado: 1 semana
- Tempo real: _____

### Fase 2: Migração Prisma
- Progresso: [ ] 0% [ ] 25% [ ] 50% [ ] 75% [ ] 100%
- Tempo estimado: 1-2 semanas
- Tempo real: _____

### Fase 3: Segurança Avançada
- Progresso: [ ] 0% [ ] 25% [ ] 50% [ ] 75% [ ] 100%
- Tempo estimado: 1 semana
- Tempo real: _____

### Fase 4: Testes
- Progresso: [ ] 0% [ ] 25% [ ] 50% [ ] 75% [ ] 100%
- Tempo estimado: 1-2 semanas
- Tempo real: _____

### Fase 5: Funcionalidades Extras
- Progresso: [ ] 0% [ ] 25% [ ] 50% [ ] 75% [ ] 100%
- Tempo estimado: 1 semana
- Tempo real: _____

## 🎉 Conclusão

Quando todos os itens estiverem marcados:
- [ ] Celebrar! 🎊
- [ ] Coletar feedback dos usuários
- [ ] Planejar próximas features
- [ ] Manter monitoramento ativo
- [ ] Continuar melhorando

---

**Dica**: Use este checklist como um guia vivo. Marque os itens conforme avança e ajuste conforme necessário. Não precisa fazer tudo de uma vez!

**Prioridade**: Foque primeiro nas Fases 1 e 2. Elas trazem o maior impacto com menor esforço.
