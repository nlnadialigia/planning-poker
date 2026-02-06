# 💻 Exemplos de Código - Melhorias Imediatas

## 🔧 Correções Rápidas (Implementar Hoje)

### 1. Corrigir Variáveis de Ambiente

```typescript
// lib/supabase/server.ts - ANTES (ERRADO)
return createSupabaseServerClient(
  process.env.SUPABASE_SUPABASE_URL!, // ❌ Duplicado
  process.env.SUPABASE_SUPABASE_ANON_KEY!, // ❌ Duplicado
  { cookies: { ... } }
)

// lib/supabase/server.ts - DEPOIS (CORRETO)
return createSupabaseServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, // ✅
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // ✅
  { cookies: { ... } }
)
```

### 2. Adicionar Validação com Zod

```bash
pnpm add zod
```

```typescript
// lib/validations/room.ts (NOVO ARQUIVO)
import { z } from "zod";

export const createRoomSchema = z.object({
  roomName: z
    .string()
    .min(3, "Nome da sala deve ter no mínimo 3 caracteres")
    .max(50, "Nome da sala deve ter no máximo 50 caracteres")
    .regex(/^[a-zA-Z0-9\s-]+$/, "Nome contém caracteres inválidos"),
  userName: z
    .string()
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(30, "Nome deve ter no máximo 30 caracteres")
    .trim(),
  moderatorPassword: z
    .string()
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .max(100, "Senha muito longa"),
});

export const joinRoomSchema = z.object({
  code: z
    .string()
    .length(6, "Código deve ter 6 caracteres")
    .regex(/^[A-Z0-9]+$/, "Código inválido")
    .transform(val => val.toUpperCase()),
  userName: z
    .string()
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(30, "Nome deve ter no máximo 30 caracteres")
    .trim(),
});

export const voteSchema = z.object({
  storyId: z.string().uuid("ID da história inválido"),
  participantId: z.string().uuid("ID do participante inválido"),
  value: z.enum(["0", "1", "2", "3", "5", "8", "13", "21", "?", "☕"], {
    errorMap: () => ({ message: "Valor de voto inválido" }),
  }),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type JoinRoomInput = z.infer<typeof joinRoomSchema>;
export type VoteInput = z.infer<typeof voteSchema>;
```

### 3. Implementar Hash de Senhas

```bash
pnpm add bcryptjs
pnpm add -D @types/bcryptjs
```

```typescript
// lib/auth/password.ts (NOVO ARQUIVO)
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
```

### 4. Refatorar create-rooms.ts

```typescript
// app/actions/create-rooms.ts - VERSÃO MELHORADA
"use server";

import { createServerClient } from "@/lib/supabase/server";
import { createRoomSchema } from "@/lib/validations/room";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { FormState } from "@/types/room.types";
import { redirect } from "next/navigation";

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
}

export async function createRoom(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  // 1. Validar entrada com Zod
  const validated = createRoomSchema.safeParse({
    roomName: formData.get("roomName"),
    userName: formData.get("userName"),
    moderatorPassword: formData.get("moderatorPassword"),
  });

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.errors[0].message,
    };
  }

  const { roomName, userName, moderatorPassword } = validated.data;
  const supabase = await createServerClient();

  try {
    // 2. Verificar se sala já existe
    const { data: existingRoom, error: roomError } = await supabase
      .from("rooms")
      .select("id, moderator_password")
      .eq("name", roomName)
      .single();

    if (roomError && roomError.code !== "PGRST116") {
      throw new Error("Erro ao verificar sala existente");
    }

    // 3. Se sala existe, verificar senha
    if (existingRoom) {
      const isPasswordValid = await verifyPassword(
        moderatorPassword,
        existingRoom.moderator_password
      );

      if (!isPasswordValid) {
        return {
          success: false,
          error: "Senha de moderador incorreta para esta sala.",
        };
      }

      // Adicionar moderador à sala existente
      const { data: participant, error: participantError } = await supabase
        .from("participants")
        .insert({
          room_id: existingRoom.id,
          name: userName,
          is_moderator: true,
          color: "#000000",
        })
        .select("id")
        .single();

      if (participantError) {
        throw new Error("Erro ao adicionar moderador à sala");
      }

      redirect(`/room/${existingRoom.id}?pid=${participant.id}`);
    }

    // 4. Criar nova sala com senha hasheada
    const hashedPassword = await hashPassword(moderatorPassword);
    const roomCode = generateRoomCode();

    const { data: room, error: createRoomError } = await supabase
      .from("rooms")
      .insert({
        name: roomName,
        code: roomCode,
        moderator_password: hashedPassword, // ✅ Senha hasheada
        is_active: true,
      })
      .select("id")
      .single();

    if (createRoomError) {
      throw new Error("Erro ao criar sala");
    }

    // 5. Adicionar moderador
    const { data: participant, error: participantError } = await supabase
      .from("participants")
      .insert({
        room_id: room.id,
        name: userName,
        is_moderator: true,
        color: "#000000",
      })
      .select("id")
      .single();

    if (participantError) {
      throw new Error("Erro ao adicionar moderador");
    }

    redirect(`/room/${room.id}?pid=${participant.id}`);
  } catch (error) {
    console.error("Error in createRoom:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}
```

### 5. Refatorar join-rooms.ts

```typescript
// app/actions/join-rooms.ts - VERSÃO MELHORADA
"use server";

import { createServerClient } from "@/lib/supabase/server";
import { joinRoomSchema } from "@/lib/validations/room";
import { FormState } from "@/types/room.types";
import { redirect } from "next/navigation";

function generateParticipantColor(): string {
  const h = Math.floor(Math.random() * 360);
  const s = 80 + Math.floor(Math.random() * 20);
  const l = 50 + Math.floor(Math.random() * 20);
  return `hsl(${h}, ${s}%, ${l}%)`;
}

export async function joinRoom(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  // 1. Validar entrada com Zod
  const validated = joinRoomSchema.safeParse({
    code: formData.get("code"),
    userName: formData.get("userName"),
  });

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.errors[0].message,
    };
  }

  const { code, userName } = validated.data;
  const supabase = await createServerClient();

  try {
    // 2. Buscar sala pelo código
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("id")
      .eq("code", code)
      .eq("is_active", true)
      .single();

    if (roomError || !room) {
      return {
        success: false,
        error: "Sala não encontrada ou inativa.",
      };
    }

    // 3. Verificar se nome já está em uso
    const { data: existingParticipant, error: nameCheckError } = await supabase
      .from("participants")
      .select("id")
      .eq("room_id", room.id)
      .eq("name", userName)
      .single();

    if (existingParticipant) {
      return {
        success: false,
        error: "Este nome já está em uso nesta sala.",
      };
    }

    if (nameCheckError && nameCheckError.code !== "PGRST116") {
      throw new Error("Erro ao verificar nome");
    }

    // 4. Criar participante
    const { data: participant, error: participantError } = await supabase
      .from("participants")
      .insert({
        room_id: room.id,
        name: userName,
        is_moderator: false,
        color: generateParticipantColor(),
      })
      .select("id")
      .single();

    if (participantError) {
      throw new Error("Erro ao entrar na sala");
    }

    redirect(`/room/${room.id}?pid=${participant.id}`);
  } catch (error) {
    console.error("Error in joinRoom:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}
```

### 6. Refatorar vote.ts

```typescript
// app/actions/vote.ts - VERSÃO MELHORADA
"use server";

import { createServerClient } from "@/lib/supabase/server";
import { voteSchema } from "@/lib/validations/room";
import { revalidatePath } from "next/cache";

export async function submitVote(formData: FormData) {
  // 1. Validar entrada com Zod
  const validated = voteSchema.safeParse({
    storyId: formData.get("storyId"),
    participantId: formData.get("participantId"),
    value: formData.get("value"),
  });

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.errors[0].message,
    };
  }

  const { storyId, participantId, value } = validated.data;
  const supabase = await createServerClient();

  try {
    // 2. Verificar se história existe e não está revelada
    const { data: story, error: storyError } = await supabase
      .from("stories")
      .select("id, is_revealed")
      .eq("id", storyId)
      .single();

    if (storyError || !story) {
      return {
        success: false,
        error: "História não encontrada.",
      };
    }

    if (story.is_revealed) {
      return {
        success: false,
        error: "Não é possível votar em uma história já revelada.",
      };
    }

    // 3. Upsert do voto
    const { error: voteError } = await supabase
      .from("votes")
      .upsert(
        {
          story_id: storyId,
          participant_id: participantId,
          value,
        },
        {
          onConflict: "story_id,participant_id",
        }
      );

    if (voteError) {
      throw new Error("Erro ao registrar voto");
    }

    revalidatePath(`/room/[id]`, "page");
    return { success: true };
  } catch (error) {
    console.error("Error in submitVote:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}
```

## 🎨 Melhorias de UI/UX

### 1. Loading States Consistentes

```typescript
// components/ui/loading.tsx (NOVO ARQUIVO)
export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-300 border-t-blue-600`}
      />
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Carregando...</p>
      </div>
    </div>
  );
}
```

### 2. Error Boundary

```typescript
// components/error-boundary.tsx (NOVO ARQUIVO)
"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600">
                Algo deu errado
              </h2>
              <p className="mt-2 text-gray-600">
                {this.state.error?.message || "Erro desconhecido"}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Recarregar página
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

### 3. Toast Notifications

```bash
pnpm add sonner
```

```typescript
// components/providers/toast-provider.tsx (NOVO ARQUIVO)
"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return <Toaster position="top-right" richColors />;
}

// app/layout.tsx - Adicionar
import { ToastProvider } from "@/components/providers/toast-provider";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}

// Uso em componentes
import { toast } from "sonner";

toast.success("Voto registrado com sucesso!");
toast.error("Erro ao criar sala");
toast.loading("Entrando na sala...");
```

## 🔒 Melhorias de Segurança

### 1. Sanitização de Inputs

```bash
pnpm add dompurify
pnpm add -D @types/dompurify
```

```typescript
// lib/security/sanitize.ts (NOVO ARQUIVO)
import DOMPurify from "dompurify";

export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // Remove todas as tags HTML
    ALLOWED_ATTR: [],
  }).trim();
}

export function sanitizeRoomName(name: string): string {
  return sanitizeInput(name)
    .replace(/[^a-zA-Z0-9\s-]/g, "") // Remove caracteres especiais
    .slice(0, 50); // Limita tamanho
}
```

### 2. Rate Limiting Simples (Sem Upstash)

```typescript
// lib/rate-limit/simple.ts (NOVO ARQUIVO)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minuto
): { success: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { success: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { success: false, remaining: 0 };
  }

  record.count++;
  return { success: true, remaining: maxRequests - record.count };
}

// Uso em Server Actions
import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/rate-limit/simple";

export async function createRoom(formData: FormData) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || "anonymous";
  
  const { success } = checkRateLimit(ip, 5, 60000); // 5 req/min
  
  if (!success) {
    return {
      success: false,
      error: "Muitas requisições. Aguarde um momento.",
    };
  }
  
  // ... resto do código
}
```

## 📊 Logging Estruturado

```typescript
// lib/logger.ts (NOVO ARQUIVO)
type LogLevel = "info" | "warn" | "error" | "debug";

interface LogData {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: any;
}

class Logger {
  private log(level: LogLevel, message: string, data?: Record<string, any>) {
    const logData: LogData = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...data,
    };

    if (process.env.NODE_ENV === "development") {
      console[level === "error" ? "error" : "log"](
        `[${level.toUpperCase()}]`,
        message,
        data
      );
    } else {
      // Em produção, enviar para serviço de logging
      console.log(JSON.stringify(logData));
    }
  }

  info(message: string, data?: Record<string, any>) {
    this.log("info", message, data);
  }

  warn(message: string, data?: Record<string, any>) {
    this.log("warn", message, data);
  }

  error(message: string, error?: Error, data?: Record<string, any>) {
    this.log("error", message, {
      ...data,
      error: error?.message,
      stack: error?.stack,
    });
  }

  debug(message: string, data?: Record<string, any>) {
    if (process.env.NODE_ENV === "development") {
      this.log("debug", message, data);
    }
  }
}

export const logger = new Logger();

// Uso
logger.info("Room created", { roomId, userId });
logger.error("Failed to create room", error, { roomName });
```

---

**Prioridade de Implementação:**
1. ✅ Corrigir variáveis de ambiente (5 min)
2. ✅ Adicionar validação Zod (30 min)
3. ✅ Implementar hash de senhas (30 min)
4. ✅ Refatorar Server Actions (2 horas)
5. ✅ Adicionar loading states (1 hora)
6. ✅ Implementar error boundary (30 min)
7. ✅ Adicionar rate limiting (1 hora)
8. ✅ Implementar logging (30 min)

**Total estimado**: 1 dia de trabalho
