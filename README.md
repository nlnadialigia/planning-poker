# Planning Poker

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-000000?style=plastic&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19.2.4-20232A?style=plastic&logo=react&logoColor=61DAFB)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=plastic&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.18-38B2AC?style=plastic&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-007ACC?style=plastic&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green?style=plastic)

<p align="center">
  <a href="#-sobre-o-projeto">Sobre o Projeto</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-funcionalidades-principais">Funcionalidades</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#️-tecnologias-utilizadas">Tecnologias</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-arquitetura">Arquitetura</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-como-rodar-o-projeto">Como Rodar</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-estrutura-do-projeto">Estrutura</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-autora">Autora</a>
</p>

## 🚀 Sobre o Projeto

Esta é uma aplicação de Planning Poker desenvolvida para facilitar sessões de estimativa de tarefas em equipes de desenvolvimento ágil. A ferramenta permite que os times realizem votações de forma remota e sincronizada, com visões e funcionalidades distintas para **Moderadores** e **Participantes**.

O projeto utiliza o Supabase para gerenciar o banco de dados e as funcionalidades em tempo real, garantindo que todos os participantes vejam as atualizações instantaneamente.

![Logo](https://ik.imagekit.io/l7cwocexhc/readme/planning-poker_PTK2P9Uck.png?updatedAt=1760798984812)

## ✨ Funcionalidades Principais

### Para todos os usuários
- **Criação e Acesso a Salas**: Crie novas salas de votação ou acesse salas existentes.
- **Nomes Únicos**: Cada participante na sala deve ter um nome único, evitando confusão.
- **Avatares Coloridos**: Cada participante recebe uma cor única e vibrante (preta para o moderador), tornando a identificação visual mais fácil e agradável.
- **Acesso via URL**: Cada participante possui uma URL única com um ID (`pid`) para identificação na sala.

### A Visão do Moderador
- **Um Moderador por Sala**: Cada sala agora suporta apenas um moderador, garantindo um único ponto de controle.
- **Visão de Mesa de Poker**: Uma interface imersiva que exibe os participantes dispostos em uma mesa circular, com o moderador ao centro.
- **Feedback de Voto Visual**: Quando um participante vota, seu card na mesa acende com sua cor pessoal, oferecendo um feedback visual e instantâneo de quem já votou.
- **Controle Total da Votação**: Iniciar uma nova votação, revelar os votos de todos e limpar a rodada para a próxima estimativa.
- **Gerenciamento de Participantes**: O moderador pode remover participantes da sala a qualquer momento.

### A Visão do Participante
- **Interface de Votação Intuitiva**: Uma pirâmide de cartas representa as opções de voto.
- **Feedback Instantâneo**: A carta selecionada é destacada imediatamente.
- **Avatar Pessoal**: O avatar do próprio participante é destacado na lista para fácil identificação.
- **Sair da Sala**: Ao clicar em "Voltar", o participante é removido da sessão.

## 🛠️ Tecnologias Utilizadas

- **Frontend**:
  - [Next.js 16.1.6](https://nextjs.org/) (App Router + Server Actions)
  - [React 19.2.4](https://react.dev/)
  - [Tailwind CSS 4.1.18](https://tailwindcss.com/)
  - [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) para componentes
  - [TanStack Query 5.90.20](https://tanstack.com/query) para gerenciamento de estado
  - [Lucide React](https://lucide.dev/) para ícones
- **Backend e Banco de Dados**:
  - [Supabase](https://supabase.com/) (PostgreSQL + Realtime)
  - [Prisma 7.3.0](https://www.prisma.io/) (ORM - em preparação)
- **Linguagem**:
  - [TypeScript 5.9.3](https://www.typescriptlang.org/)
- **Deploy**:
  - [Vercel](https://vercel.com/)
  - [Vercel Analytics](https://vercel.com/analytics)

## ⚙️ Como Rodar o Projeto

Siga os passos abaixo para configurar e executar o projeto em seu ambiente local.

### Pré-requisitos

- [Node.js](https://nodejs.org/en) (versão 20 ou superior)
- [pnpm](https://pnpm.io/installation)
- Uma conta no [Supabase](https://supabase.com/)

### Passos

1.  **Clone o repositório**

    ```bash
    git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
    cd SEU_REPOSITORIO
    ```

2.  **Instale as dependências**

    ```bash
    pnpm install
    ```

3.  **Configure o Supabase**

    a. Crie um novo projeto no Supabase.

    b. Crie um arquivo `.env.local` na raiz do projeto e adicione as chaves do seu projeto Supabase:

    ```bash
    # Supabase Configuration
    NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO_URL.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANONIMA_PUBLICA
    SUPABASE_URL=https://SEU_PROJETO_URL.supabase.co
    SUPABASE_ANON_KEY=SUA_CHAVE_ANONIMA_PUBLICA
    ```

    c. Execute os scripts SQL da pasta `/scripts` no **SQL Editor** do seu projeto Supabase para configurar o banco de dados e habilitar o Realtime.

4.  **Execute a aplicação**
    ```bash
    pnpm dev
    ```

Abra [http://localhost:3000](http://localhost:3000) em seu navegador para ver a aplicação funcionando.

### 🌐 [Acesse a aplicação aqui](https://planning-poker-nl.vercel.app/)

## 📐 Arquitetura

### Estrutura de Pastas

```
planning-poker/
├── app/                      # Next.js App Router
│   ├── actions/             # Server Actions
│   │   ├── create-rooms.ts  # Criação de salas
│   │   ├── join-rooms.ts    # Entrada em salas
│   │   ├── vote.ts          # Sistema de votação
│   │   ├── leave-room.ts    # Saída de participantes
│   │   └── participant.ts   # Gerenciamento de participantes
│   ├── room/[id]/           # Página dinâmica da sala
│   ├── layout.tsx           # Layout principal
│   ├── page.tsx             # Página inicial
│   └── globals.css          # Estilos globais
├── components/              # Componentes React
│   ├── home/               # Componentes da home
│   ├── room/               # Componentes da sala
│   ├── providers/          # Context providers
│   └── ui/                 # Componentes UI (shadcn)
├── lib/                    # Utilitários e configurações
│   ├── hooks/             # Custom hooks
│   ├── supabase/          # Cliente Supabase
│   └── utils.ts           # Funções auxiliares
├── scripts/               # Scripts SQL do banco
├── types/                 # Definições TypeScript
└── public/               # Arquivos estáticos
```

### Fluxo de Dados

1. **Criação de Sala**: Server Action → Supabase → Redirect
2. **Entrada na Sala**: Server Action → Validação → Supabase → Redirect
3. **Votação**: Client → Server Action → Supabase → Realtime Broadcast
4. **Atualização em Tempo Real**: Supabase Realtime → TanStack Query → UI Update

### Banco de Dados (Supabase PostgreSQL)

**Tabelas principais:**
- `rooms`: Salas de votação
- `participants`: Participantes das salas
- `stories`: Histórias/tarefas para votação
- `votes`: Votos dos participantes

**Recursos:**
- Row Level Security (RLS) com políticas públicas
- Realtime habilitado para sincronização instantânea
- Índices otimizados para performance

### 🌐 [Acesse a aplicação aqui](https://planning-poker-nl.vercel.app/)

## 👩‍💼 Autora

<img src="https://ik.imagekit.io/l7cwocexhc/me/autora_Qd2U70jkF.png?updatedAt=1760798608999" width="300px;" alt="Picture"/>

[![Linkedin](https://img.shields.io/badge/-Linkedin-732a7b?style=plastic&logo=Linkedin&logoColor=white&link=https://www.linkedin.com/in/nlnadialigia/)](https://www.linkedin.com/in/nlnadialigia)&nbsp;&nbsp;
[![Instagram](https://img.shields.io/badge/Instagram-732a7b?style=plastic&logo=instagram&logoColor=white)](https://www.instagram.com/nl.nadia.ligia)&nbsp;&nbsp;
[![Email](https://img.shields.io/badge/-Email-732a7b?style=plastic&logo=Gmail&logoColor=white&link=mailto:nlnadialigia@gmail.com)](mailto:nlnadialigia@gmail.com)&nbsp;&nbsp;
