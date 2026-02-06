# 🚀 Guia Rápido de Migração para Prisma

## Passo a Passo

### 1. Instalação

```bash
pnpm add @prisma/client
pnpm add -D prisma
```

### 2. Configuração Inicial

O arquivo `prisma/schema.prisma` já está criado! Agora configure as variáveis de ambiente:

```bash
# .env.local
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres?schema=public"

# Mantenha as variáveis do Supabase também
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
```

### 3. Gerar Cliente Prisma

```bash
npx prisma generate
```

Isso criará os tipos TypeScript automaticamente!

### 4. Criar Cliente Singleton

Crie o arquivo `lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### 5. Exemplo de Refatoração

#### Antes (Supabase direto):

```typescript
// app/actions/create-rooms.ts
const { data: room, error: roomError } = await supabase
  .from("rooms")
  .insert({
    name: roomName,
    code: roomCode,
    moderator_password: moderatorPassword,
    is_active: true,
  })
  .select("id")
  .single();

if (roomError) {
  throw new Error(`Falha ao criar a sala. Erro: ${roomError.message}`);
}
```

#### Depois (Prisma):

```typescript
// app/actions/create-rooms.ts
import { prisma } from "@/lib/prisma";

const room = await prisma.room.create({
  data: {
    name: roomName,
    code: roomCode,
    moderatorPassword: moderatorPassword, // Autocomplete funciona!
    isActive: true,
  },
  select: {
    id: true,
  },
});

// Não precisa de verificação de erro, Prisma lança exceção automaticamente
```

### 6. Exemplo Completo: Create Room

```typescript
"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { z } from "zod";
import bcrypt from "bcryptjs";

// Validação com Zod
const createRoomSchema = z.object({
  roomName: z.string().min(3).max(50),
  userName: z.string().min(2).max(30),
  moderatorPassword: z.string().min(6),
});

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => 
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
}

export async function createRoom(formData: FormData) {
  // 1. Validar dados
  const validated = createRoomSchema.safeParse({
    roomName: formData.get("roomName"),
    userName: formData.get("userName"),
    moderatorPassword: formData.get("moderatorPassword"),
  });

  if (!validated.success) {
    return { 
      success: false, 
      error: validated.error.errors[0].message 
    };
  }

  const { roomName, userName, moderatorPassword } = validated.data;

  try {
    // 2. Verificar se sala já existe
    const existingRoom = await prisma.room.findUnique({
      where: { name: roomName },
      select: { id: true, moderatorPassword: true },
    });

    if (existingRoom) {
      // 3. Verificar senha
      const isPasswordValid = await bcrypt.compare(
        moderatorPassword,
        existingRoom.moderatorPassword
      );

      if (!isPasswordValid) {
        return {
          success: false,
          error: "Senha de moderador incorreta para esta sala.",
        };
      }

      // 4. Adicionar moderador à sala existente
      const participant = await prisma.participant.create({
        data: {
          roomId: existingRoom.id,
          name: userName,
          isModerator: true,
          color: "#000000",
        },
      });

      redirect(`/room/${existingRoom.id}?pid=${participant.id}`);
    }

    // 5. Criar nova sala com moderador
    const hashedPassword = await bcrypt.hash(moderatorPassword, 12);
    
    const room = await prisma.room.create({
      data: {
        name: roomName,
        code: generateRoomCode(),
        moderatorPassword: hashedPassword,
        isActive: true,
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
    console.error("Error creating room:", error);
    return { 
      success: false, 
      error: "Erro ao criar sala. Tente novamente." 
    };
  }
}
```

### 7. Exemplo: Join Room

```typescript
"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { z } from "zod";

const joinRoomSchema = z.object({
  code: z.string().length(6).regex(/^[A-Z0-9]+$/),
  userName: z.string().min(2).max(30),
});

function generateParticipantColor(): string {
  const h = Math.floor(Math.random() * 360);
  const s = 80 + Math.floor(Math.random() * 20);
  const l = 50 + Math.floor(Math.random() * 20);
  return `hsl(${h}, ${s}%, ${l}%)`;
}

export async function joinRoom(formData: FormData) {
  const validated = joinRoomSchema.safeParse({
    code: (formData.get("code") as string).toUpperCase(),
    userName: formData.get("userName"),
  });

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.errors[0].message,
    };
  }

  const { code, userName } = validated.data;

  try {
    // 1. Buscar sala
    const room = await prisma.room.findUnique({
      where: { 
        code,
        isActive: true,
      },
      select: { id: true },
    });

    if (!room) {
      return { 
        success: false, 
        error: "Sala não encontrada ou inativa." 
      };
    }

    // 2. Verificar se nome já existe
    const existingParticipant = await prisma.participant.findFirst({
      where: {
        roomId: room.id,
        name: userName,
      },
    });

    if (existingParticipant) {
      return {
        success: false,
        error: "Este nome já está em uso nesta sala.",
      };
    }

    // 3. Criar participante
    const participant = await prisma.participant.create({
      data: {
        roomId: room.id,
        name: userName,
        isModerator: false,
        color: generateParticipantColor(),
      },
    });

    redirect(`/room/${room.id}?pid=${participant.id}`);
  } catch (error) {
    console.error("Error joining room:", error);
    return {
      success: false,
      error: "Erro ao entrar na sala. Tente novamente.",
    };
  }
}
```

### 8. Exemplo: Buscar Dados da Sala

```typescript
// lib/services/room.service.ts
import { prisma } from "@/lib/prisma";

export async function getRoomData(roomId: string) {
  return prisma.room.findUnique({
    where: { id: roomId },
    include: {
      participants: {
        orderBy: { joinedAt: 'asc' },
      },
      stories: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          votes: {
            include: {
              participant: {
                select: {
                  id: true,
                  name: true,
                  color: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

// Tipo retornado automaticamente!
export type RoomData = Awaited<ReturnType<typeof getRoomData>>;
```

### 9. Testar a Migração

```bash
# 1. Verificar se o schema está correto
npx prisma validate

# 2. Visualizar o banco de dados
npx prisma studio

# 3. Testar queries
npx prisma db execute --stdin < test-query.sql
```

### 10. Checklist de Migração

- [ ] Instalar Prisma e dependências
- [ ] Configurar DATABASE_URL
- [ ] Gerar cliente Prisma
- [ ] Criar lib/prisma.ts
- [ ] Instalar Zod e bcryptjs
- [ ] Refatorar create-rooms.ts
- [ ] Refatorar join-rooms.ts
- [ ] Refatorar vote.ts
- [ ] Refatorar leave-room.ts
- [ ] Refatorar participant.ts
- [ ] Testar criação de sala
- [ ] Testar entrada na sala
- [ ] Testar votação
- [ ] Testar realtime (deve continuar funcionando!)
- [ ] Fazer backup do código antigo
- [ ] Deploy em preview
- [ ] Testar em produção

## 🎯 Benefícios Imediatos

### Antes:
```typescript
const { data: room, error } = await supabase
  .from("rooms")
  .select("id, name, code, participants(*)")
  .eq("id", roomId)
  .single();

if (error) throw error;
if (!room) throw new Error("Room not found");

// Tipo: any
```

### Depois:
```typescript
const room = await prisma.room.findUnique({
  where: { id: roomId },
  include: { participants: true },
});

if (!room) throw new Error("Room not found");

// Tipo: Room & { participants: Participant[] }
// Autocomplete completo!
```

## ⚠️ Importante

1. **Supabase Realtime continua funcionando!**
   - Prisma apenas muda como você faz queries
   - O banco de dados é o mesmo
   - Realtime é uma feature do Supabase, não do cliente

2. **Migração pode ser gradual**
   - Mantenha Supabase client em paralelo
   - Migre uma rota por vez
   - Teste cada mudança

3. **Backup antes de tudo**
   ```bash
   pg_dump -h HOST -U USER -d DATABASE > backup.sql
   ```

## 🆘 Troubleshooting

### Erro: "Can't reach database server"
```bash
# Verifique a DATABASE_URL
echo $DATABASE_URL

# Teste a conexão
npx prisma db pull
```

### Erro: "Type 'X' is not assignable to type 'Y'"
```bash
# Regenere os tipos
npx prisma generate
```

### Realtime parou de funcionar
```typescript
// Certifique-se de que o Supabase client ainda está configurado
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
// Use para Realtime, Prisma para queries
```

## 📚 Próximos Passos

Após a migração básica:
1. Adicionar testes (ver UPGRADE.md)
2. Implementar rate limiting
3. Adicionar Sentry
4. Otimizar queries
5. Adicionar CI/CD

---

**Dúvidas?** Consulte a [documentação oficial do Prisma](https://www.prisma.io/docs)
