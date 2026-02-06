# 📋 Documento de Upgrade - Planning Poker

## 📊 Análise do Projeto Atual

### Pontos Fortes ✅

1. **Arquitetura Moderna**
   - Next.js 16 com App Router e Server Actions
   - React 19 com automatic runtime
   - TypeScript para type safety
   - Tailwind CSS 4 para estilização

2. **Realtime Funcional**
   - Supabase Realtime configurado corretamente
   - Sincronização instantânea entre participantes
   - TanStack Query para gerenciamento de estado

3. **UX Bem Pensada**
   - Interface intuitiva para moderadores e participantes
   - Feedback visual de votação
   - Cores únicas para cada participante

4. **Segurança Básica**
   - Row Level Security (RLS) habilitado
   - Senha de moderador obrigatória
   - Validação de nomes únicos por sala

### Pontos de Melhoria 🔧

1. **Banco de Dados**
   - Uso direto do Supabase client sem ORM
   - Falta de migrations versionadas
   - Tipos não gerados automaticamente do schema

2. **Validação**
   - Validação manual nos Server Actions
   - Sem biblioteca de validação robusta
   - Falta de sanitização de inputs

3. **Tratamento de Erros**
   - Mensagens de erro genéricas
   - Falta de logging estruturado
   - Sem monitoramento de erros

4. **Performance**
   - Sem cache estratégico
   - Queries não otimizadas
   - Falta de lazy loading em componentes

5. **Testes**
   - Ausência completa de testes
   - Sem CI/CD configurado

6. **Segurança**
   - Senhas armazenadas em texto plano
   - Falta de rate limiting
   - Sem proteção contra CSRF


## 🎯 Plano de Upgrade Sugerido

### Fase 1: Migração para Prisma + PostgreSQL (Prioridade Alta)

#### Por que Prisma?

- **Type Safety**: Tipos TypeScript gerados automaticamente do schema
- **Migrations**: Versionamento e controle de mudanças no banco
- **Developer Experience**: Autocomplete e IntelliSense completo
- **Performance**: Query optimization e connection pooling
- **Manutenibilidade**: Schema centralizado e fácil de entender

#### Passos de Implementação

1. **Instalação e Configuração**
```bash
pnpm add prisma @prisma/client
pnpm add -D prisma
npx prisma init
```

2. **Criar Schema Prisma**
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Room {
  id                  String        @id @default(uuid())
  name                String        @unique
  code                String        @unique
  moderatorPassword   String        @map("moderator_password")
  isActive            Boolean       @default(true) @map("is_active")
  createdAt           DateTime      @default(now()) @map("created_at")
  
  participants        Participant[]
  stories             Story[]

  @@map("rooms")
}

model Participant {
  id           String   @id @default(uuid())
  roomId       String   @map("room_id")
  name         String
  color        String?
  isModerator  Boolean  @default(false) @map("is_moderator")
  joinedAt     DateTime @default(now()) @map("joined_at")
  
  room         Room     @relation(fields: [roomId], references: [id], onDelete: Cascade)
  votes        Vote[]

  @@map("participants")
  @@index([roomId])
}

model Story {
  id          String   @id @default(uuid())
  roomId      String   @map("room_id")
  title       String
  description String?
  isRevealed  Boolean  @default(false) @map("is_revealed")
  createdAt   DateTime @default(now()) @map("created_at")
  
  room        Room     @relation(fields: [roomId], references: [id], onDelete: Cascade)
  votes       Vote[]

  @@map("stories")
  @@index([roomId])
}

model Vote {
  id             String   @id @default(uuid())
  storyId        String   @map("story_id")
  participantId  String   @map("participant_id")
  value          String
  createdAt      DateTime @default(now()) @map("created_at")
  
  story          Story       @relation(fields: [storyId], references: [id], onDelete: Cascade)
  participant    Participant @relation(fields: [participantId], references: [id], onDelete: Cascade)

  @@unique([storyId, participantId])
  @@map("votes")
  @@index([storyId])
}
```

3. **Configurar Variáveis de Ambiente**
```bash
# .env.local
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
```

4. **Gerar Cliente e Migrations**
```bash
npx prisma db pull  # Importa schema existente do Supabase
npx prisma generate # Gera tipos TypeScript
```

5. **Criar Cliente Prisma Singleton**
```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

6. **Refatorar Server Actions**
```typescript
// app/actions/create-rooms.ts (exemplo)
"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { z } from "zod";

const createRoomSchema = z.object({
  roomName: z.string().min(3).max(50),
  userName: z.string().min(2).max(30),
  moderatorPassword: z.string().min(6),
});

export async function createRoom(formData: FormData) {
  const validated = createRoomSchema.safeParse({
    roomName: formData.get("roomName"),
    userName: formData.get("userName"),
    moderatorPassword: formData.get("moderatorPassword"),
  });

  if (!validated.success) {
    return { success: false, error: validated.error.errors[0].message };
  }

  const { roomName, userName, moderatorPassword } = validated.data;

  try {
    const room = await prisma.room.create({
      data: {
        name: roomName,
        code: generateRoomCode(),
        moderatorPassword,
        participants: {
          create: {
            name: userName,
            isModerator: true,
            color: "#000000",
          },
        },
      },
      include: {
        participants: true,
      },
    });

    redirect(`/room/${room.id}?pid=${room.participants[0].id}`);
  } catch (error) {
    return { success: false, error: "Erro ao criar sala" };
  }
}
```

#### Benefícios Imediatos

- ✅ Type safety completo em todas as queries
- ✅ Autocomplete de campos e relações
- ✅ Migrations versionadas e rastreáveis
- ✅ Melhor performance com query optimization
- ✅ Código mais limpo e manutenível


### Fase 2: Validação e Segurança (Prioridade Alta)

#### 1. Implementar Zod para Validação

```bash
pnpm add zod
```

**Criar schemas de validação centralizados:**

```typescript
// lib/validations/room.ts
import { z } from "zod";

export const createRoomSchema = z.object({
  roomName: z
    .string()
    .min(3, "Nome da sala deve ter no mínimo 3 caracteres")
    .max(50, "Nome da sala deve ter no máximo 50 caracteres")
    .regex(/^[a-zA-Z0-9\s-]+$/, "Nome da sala contém caracteres inválidos"),
  userName: z
    .string()
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(30, "Nome deve ter no máximo 30 caracteres")
    .regex(/^[a-zA-Z0-9\s]+$/, "Nome contém caracteres inválidos"),
  moderatorPassword: z
    .string()
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .max(100, "Senha muito longa"),
});

export const joinRoomSchema = z.object({
  code: z
    .string()
    .length(6, "Código deve ter 6 caracteres")
    .regex(/^[A-Z0-9]+$/, "Código inválido"),
  userName: z
    .string()
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(30, "Nome deve ter no máximo 30 caracteres"),
});

export const voteSchema = z.object({
  storyId: z.string().uuid(),
  participantId: z.string().uuid(),
  value: z.enum(["0", "1", "2", "3", "5", "8", "13", "21", "?", "☕"]),
});
```

#### 2. Hash de Senhas com bcrypt

```typescript
// lib/auth/password.ts
import bcrypt from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
```

**Atualizar Server Actions:**

```typescript
// app/actions/create-rooms.ts
import { hashPassword } from "@/lib/auth/password";

const hashedPassword = await hashPassword(moderatorPassword);

const room = await prisma.room.create({
  data: {
    name: roomName,
    code: generateRoomCode(),
    moderatorPassword: hashedPassword, // Armazenar hash
    // ...
  },
});
```

#### 3. Rate Limiting

```bash
pnpm add @upstash/ratelimit @upstash/redis
```

```typescript
// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
});

// Uso em Server Actions
const identifier = headers().get("x-forwarded-for") ?? "anonymous";
const { success } = await ratelimit.limit(identifier);

if (!success) {
  return { success: false, error: "Muitas requisições. Tente novamente." };
}
```


### Fase 3: Monitoramento e Observabilidade (Prioridade Média)

#### 1. Sentry para Error Tracking

```bash
pnpm add @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

#### 2. Logging Estruturado

```bash
pnpm add pino pino-pretty
```

```typescript
// lib/logger.ts
import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

// Uso
logger.info({ roomId, userId }, "User joined room");
logger.error({ error, roomId }, "Failed to create room");
```

#### 3. Analytics Avançado

```typescript
// lib/analytics.ts
import { track } from "@vercel/analytics";

export const trackEvent = {
  roomCreated: (roomId: string) => track("room_created", { roomId }),
  userJoined: (roomId: string, userId: string) => 
    track("user_joined", { roomId, userId }),
  voteSubmitted: (roomId: string, value: string) => 
    track("vote_submitted", { roomId, value }),
  votesRevealed: (roomId: string, participantCount: number) => 
    track("votes_revealed", { roomId, participantCount }),
};
```

### Fase 4: Performance e Otimização (Prioridade Média)

#### 1. React Query Optimizations

```typescript
// lib/hooks/use-room-query.ts
import { useQuery } from "@tanstack/react-query";

export function useRoomData(roomId: string) {
  return useQuery({
    queryKey: ["room", roomId],
    queryFn: () => fetchRoomData(roomId),
    staleTime: 30000, // 30 segundos
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: true,
    retry: 3,
  });
}
```

#### 2. Lazy Loading de Componentes

```typescript
// app/room/[id]/page.tsx
import dynamic from "next/dynamic";

const PokerTable = dynamic(() => import("@/components/room/poker-table"), {
  loading: () => <TableSkeleton />,
  ssr: false,
});

const VotingHistory = dynamic(() => import("@/components/room/voting-history"), {
  loading: () => <HistorySkeleton />,
});
```

#### 3. Database Indexes

```sql
-- Adicionar índices compostos para queries frequentes
CREATE INDEX idx_participants_room_moderator 
ON participants(room_id, is_moderator);

CREATE INDEX idx_votes_story_participant 
ON votes(story_id, participant_id);

CREATE INDEX idx_stories_room_revealed 
ON stories(room_id, is_revealed);
```

#### 4. Connection Pooling

```typescript
// lib/prisma.ts
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
}).$extends({
  query: {
    $allOperations({ operation, model, args, query }) {
      const start = performance.now();
      const result = query(args);
      const end = performance.now();
      
      if (end - start > 1000) {
        logger.warn({ operation, model, duration: end - start }, "Slow query");
      }
      
      return result;
    },
  },
});
```


### Fase 5: Testes e CI/CD (Prioridade Média)

#### 1. Setup de Testes

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom
pnpm add -D @vitejs/plugin-react jsdom
```

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
```

**Exemplos de Testes:**

```typescript
// __tests__/components/voting-cards.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { VotingCards } from "@/components/room/voting-cards";

describe("VotingCards", () => {
  it("should render all voting options", () => {
    render(<VotingCards onVote={vi.fn()} selectedValue={null} />);
    
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("should call onVote when card is clicked", () => {
    const onVote = vi.fn();
    render(<VotingCards onVote={onVote} selectedValue={null} />);
    
    fireEvent.click(screen.getByText("5"));
    expect(onVote).toHaveBeenCalledWith("5");
  });
});
```

```typescript
// __tests__/lib/validations/room.test.ts
import { createRoomSchema } from "@/lib/validations/room";

describe("Room Validation", () => {
  it("should validate correct room data", () => {
    const result = createRoomSchema.safeParse({
      roomName: "Test Room",
      userName: "John",
      moderatorPassword: "secret123",
    });
    
    expect(result.success).toBe(true);
  });

  it("should reject short room names", () => {
    const result = createRoomSchema.safeParse({
      roomName: "AB",
      userName: "John",
      moderatorPassword: "secret123",
    });
    
    expect(result.success).toBe(false);
  });
});
```

#### 2. GitHub Actions CI/CD

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Run linter
        run: pnpm lint
        
      - name: Run type check
        run: pnpm tsc --noEmit
        
      - name: Run tests
        run: pnpm test
        
      - name: Build
        run: pnpm build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
```

### Fase 6: Funcionalidades Adicionais (Prioridade Baixa)

#### 1. Histórico de Votações Persistente

```typescript
// Adicionar ao schema Prisma
model VotingSession {
  id          String   @id @default(uuid())
  storyId     String   @map("story_id")
  average     Float?
  consensus   String?
  completedAt DateTime @default(now()) @map("completed_at")
  
  story       Story    @relation(fields: [storyId], references: [id])
  
  @@map("voting_sessions")
}
```

#### 2. Exportação de Resultados

```typescript
// app/actions/export-results.ts
export async function exportResults(roomId: string) {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      stories: {
        include: {
          votes: {
            include: {
              participant: true,
            },
          },
        },
      },
    },
  });

  const csv = generateCSV(room);
  return csv;
}
```

#### 3. Timer para Votações

```typescript
// components/room/voting-timer.tsx
export function VotingTimer({ duration = 60 }) {
  const [timeLeft, setTimeLeft] = useState(duration);
  
  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft]);
  
  return (
    <div className="text-2xl font-bold">
      {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
    </div>
  );
}
```

#### 4. Notificações Push

```typescript
// lib/notifications.ts
export async function sendNotification(
  participantId: string,
  message: string
) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("Planning Poker", {
      body: message,
      icon: "/icon.png",
    });
  }
}
```


## 📅 Cronograma Sugerido

### Sprint 1 (1-2 semanas) - Fundação
- ✅ Migração para Prisma
- ✅ Implementar Zod para validação
- ✅ Hash de senhas com bcrypt
- ✅ Refatorar Server Actions

### Sprint 2 (1 semana) - Segurança e Qualidade
- ✅ Implementar rate limiting
- ✅ Adicionar Sentry para error tracking
- ✅ Implementar logging estruturado
- ✅ Melhorar tratamento de erros

### Sprint 3 (1 semana) - Performance
- ✅ Otimizar queries do Prisma
- ✅ Adicionar lazy loading
- ✅ Implementar caching estratégico
- ✅ Adicionar índices no banco

### Sprint 4 (1-2 semanas) - Testes e CI/CD
- ✅ Setup de testes com Vitest
- ✅ Escrever testes unitários
- ✅ Escrever testes de integração
- ✅ Configurar GitHub Actions

### Sprint 5 (1 semana) - Funcionalidades Extras
- ✅ Histórico de votações
- ✅ Exportação de resultados
- ✅ Timer para votações
- ✅ Notificações push

## 💰 Estimativa de Custos

### Ferramentas Gratuitas
- ✅ Prisma (open source)
- ✅ Zod (open source)
- ✅ Vitest (open source)
- ✅ GitHub Actions (2000 min/mês grátis)

### Ferramentas Pagas (Opcionais)
- Sentry: $26/mês (plano Team) ou grátis até 5k eventos/mês
- Upstash Redis: $0.20/100k requests (rate limiting)
- Vercel Pro: $20/mês (se precisar de mais recursos)

**Total estimado**: $0-50/mês dependendo do uso

## 🎯 Métricas de Sucesso

### Performance
- ⚡ Tempo de carregamento < 2s
- ⚡ Time to Interactive < 3s
- ⚡ Queries do banco < 100ms

### Qualidade
- ✅ Cobertura de testes > 80%
- ✅ Zero erros críticos no Sentry
- ✅ Lighthouse score > 90

### Segurança
- 🔒 Todas as senhas hasheadas
- 🔒 Rate limiting ativo
- 🔒 Validação em todas as entradas

## 📚 Recursos Adicionais

### Documentação
- [Prisma Docs](https://www.prisma.io/docs)
- [Zod Documentation](https://zod.dev)
- [Next.js Best Practices](https://nextjs.org/docs)
- [Supabase + Prisma](https://supabase.com/docs/guides/integrations/prisma)

### Tutoriais Recomendados
- [Prisma with Next.js](https://www.prisma.io/nextjs)
- [Testing Next.js Apps](https://nextjs.org/docs/testing)
- [Security Best Practices](https://nextjs.org/docs/app/building-your-application/security)

## 🚀 Próximos Passos Imediatos

1. **Backup do Banco de Dados**
   ```bash
   # Fazer backup antes de qualquer mudança
   pg_dump -h HOST -U USER -d DATABASE > backup.sql
   ```

2. **Criar Branch de Desenvolvimento**
   ```bash
   git checkout -b feature/prisma-migration
   ```

3. **Instalar Prisma**
   ```bash
   pnpm add prisma @prisma/client
   npx prisma init
   ```

4. **Importar Schema Existente**
   ```bash
   npx prisma db pull
   npx prisma generate
   ```

5. **Testar em Ambiente Local**
   - Criar sala
   - Entrar como participante
   - Votar
   - Revelar votos
   - Verificar realtime

6. **Deploy Gradual**
   - Deploy em preview (Vercel)
   - Testar com usuários beta
   - Monitorar erros no Sentry
   - Deploy em produção

## ⚠️ Avisos Importantes

1. **Compatibilidade com Supabase Realtime**
   - Prisma funciona perfeitamente com Supabase
   - Realtime continuará funcionando normalmente
   - Apenas as queries mudam, não o banco

2. **Migração Sem Downtime**
   - Possível fazer migração gradual
   - Manter Supabase client em paralelo temporariamente
   - Migrar rota por rota

3. **Rollback Plan**
   - Manter backup do banco
   - Manter código antigo em branch separada
   - Documentar todas as mudanças

## 📞 Suporte

Se precisar de ajuda durante a implementação:
- Abra uma issue no GitHub
- Consulte a documentação oficial
- Entre em contato com a comunidade Prisma/Next.js

---

**Última atualização**: Fevereiro 2026
**Versão do documento**: 1.0
