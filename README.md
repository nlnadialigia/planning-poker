# Planning Poker

![Next.js](https://img.shields.io/badge/Next.js-000000?style=plastic&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=plastic&logo=react&logoColor=61DAFB)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=plastic&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=plastic&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=plastic&logo=typescript&logoColor=white)

<p align="center">
  <a href="#-sobre-o-projeto">Sobre o Projeto</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-funcionalidades-principais">Funcionalidades</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#️-tecnologias-utilizadas">Tecnologias</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-como-rodar-o-projeto">Como Rodar</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-autora">Autora</a>
</p>

## 🚀 Sobre o Projeto

Esta é uma aplicação de Planning Poker desenvolvida para facilitar sessões de estimativa de tarefas em equipes de desenvolvimento ágil. A ferramenta permite que os times realizem votações de forma remota e sincronizada, com visões e funcionalidades distintas para **Moderadores** e **Participantes**.

O projeto utiliza o Supabase para gerenciar o banco de dados e as funcionalidades em tempo real, garantindo que todos os participantes vejam as atualizações instantaneamente.

![Logo](https://ik.imagekit.io/l7cwocexhc/readme/planning-poker_PTK2P9Uck.png?updatedAt=1760798984812)

## ✨ Funcionalidades Principais

### Para todos os usuários

- **Criação e Acesso a Salas**: Crie novas salas de votação ou acesse salas existentes.
- **Acesso via URL**: Cada participante possui uma URL única com um ID (`pid`) para identificação na sala.
- **Nomes Duplicados**: Múltiplos participantes podem ter o mesmo nome na mesma sala.

### Visão do Moderador

- **Controle Total da Votação**: Iniciar uma nova votação, revelar os votos de todos e limpar a rodada para a próxima estimativa.
- **Gerenciamento de Participantes**: O moderador pode remover participantes da sala a qualquer momento.
- **Painel de Acompanhamento**: Visualize em tempo real quem já votou e quem ainda está pendente.
- **Visualização de Resultados**: Ao revelar, o sistema exibe uma tabela com os votos individuais e destaca o voto mais popular.

### A Visão do Participante

- **Interface de Votação Intuitiva**: Uma pirâmide de cartas representa as opções de voto.
- **Feedback Instantâneo**: A carta selecionada é destacada imediatamente.
- **Avatar Pessoal**: O avatar do próprio participante é destacado na lista para fácil identificação.
- **Sair da Sala**: Ao clicar em "Voltar", o participante é removido da sessão.

## 🛠️ Tecnologias Utilizadas

- **Frontend**:
  - [Next.js](https://nextjs.org/) (com App Router)
  - [React](https://react.dev/)
  - [Tailwind CSS](https://tailwindcss.com/)
  - [shadcn/ui](https://ui.shadcn.com/) para componentes
- **Backend e Banco de Dados**:
  - [Supabase](https://supabase.com/) (PostgreSQL, Realtime, Auth)
- **Linguagem**:
  - [TypeScript](https://www.typescriptlang.org/)

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
    # Para o cliente (navegador)
    NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO_URL.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANONIMA_PUBLICA

    # Para o servidor (Server Actions)
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

## 👩‍💼 Autora

<img src="https://ik.imagekit.io/l7cwocexhc/me/autora_Qd2U70jkF.png?updatedAt=1760798608999" width="300px;" alt="Picture"/>

[![Linkedin](https://img.shields.io/badge/-Linkedin-732a7b?style=plastic&logo=Linkedin&logoColor=white&link=https://www.linkedin.com/in/nlnadialigia/)](https://www.linkedin.com/in/nlnadialigia)&nbsp;&nbsp;
[![Instagram](https://img.shields.io/badge/Instagram-732a7b?style=plastic&logo=instagram&logoColor=white)](https://www.instagram.com/nl.nadia.ligia)&nbsp;&nbsp;
[![Email](https://img.shields.io/badge/-Email-732a7b?style=plastic&logo=Gmail&logoColor=white&link=mailto:nlnadialigia@gmail.com)](mailto:nlnadialigia@gmail.com)&nbsp;&nbsp;
