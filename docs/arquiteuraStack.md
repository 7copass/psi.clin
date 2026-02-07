Arquitetura & Stack Tecnológica — SaaS para Psicólogos
Versão: 1.0
 Data: 06/02/2026
 Relacionado ao: PRD Plataforma SaaS para Psicólogos

1. Visão Geral da Arquitetura
1.1 Modelo
Monorepo com Next.js (App Router) + Supabase como BaaS (Backend as a Service).
Todo o código do projeto — frontend, lógica de negócio, rotas de API e integrações — vive em um único repositório no GitHub, com deploy automático na Vercel a cada push.
1.2 Diagrama de Alto Nível
┌─────────────────────────────────────────────────────────┐
│                      VERCEL                             │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │              NEXT.JS (APP ROUTER)                 │  │
│  │                                                   │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────┐  │  │
│  │  │   Páginas    │  │   Server     │  │  Route  │  │  │
│  │  │  (Frontend)  │  │   Actions    │  │Handlers │  │  │
│  │  │  React/SSR   │  │  (Mutations) │  │  (API)  │  │  │
│  │  └──────┬───────┘  └──────┬───────┘  └────┬────┘  │  │
│  │         │                 │                │       │  │
│  └─────────┼─────────────────┼────────────────┼───────┘  │
│            │                 │                │          │
└────────────┼─────────────────┼────────────────┼──────────┘
             │                 │                │
     ┌───────▼─────┐   ┌──────▼──────┐  ┌──────▼──────┐
     │  SUPABASE   │   │  GEMINI API │  │ STRIPE API  │
     │             │   │             │  │             │
     │ • PostgreSQL│   │ • 2.5 Flash │  │ • Checkout  │
     │ • Auth      │   │ • 2.5 Pro   │  │ • Billing   │
     │ • Storage   │   │             │  │ • Webhooks  │
     │ • RLS       │   │             │  │             │
     │ • Realtime  │   │             │  │             │
     └─────────────┘   └─────────────┘  └─────────────┘
1.3 Princípios da Arquitetura
Princípio
Descrição
Monorepo
Um repositório, um deploy, contexto unificado para vibe coding
Server-first
Dados sensíveis e lógica de negócio sempre no servidor (Server Components, Server Actions, Route Handlers)
BaaS-first
Supabase cuida de banco, auth, storage e segurança. Sem backend customizado
Segurança por padrão
RLS no Supabase isola dados por profissional. Nenhuma query do client acessa dados de outro usuário
Processamento assíncrono
Tarefas pesadas (transcrição, geração de IA) vão para fila, nunca bloqueiam a interface
Custo previsível
Stack serverless (Vercel + Supabase) = paga pelo uso, sem servidor ocioso


2. Stack Tecnológica Completa
2.1 Frontend
Tecnologia
Versão
Função
Next.js
14+
Framework full-stack (App Router)
React
18+
Biblioteca de UI
TypeScript
5+
Tipagem estática em todo o projeto
Tailwind CSS
3.4+
Estilização utility-first
shadcn/ui
latest
Componentes de UI (Dialog, Table, Form, Calendar, etc.)
Tiptap
2+
Editor rich text para anotações e evolução
Lucide React
latest
Ícones
React Hook Form
7+
Gerenciamento de formulários
Zod
3+
Validação de schemas (forms + API)
date-fns
3+
Manipulação de datas (pt-BR)
Zustand
4+
Estado global leve (quando necessário)
Sonner
latest
Toasts e notificações

2.2 Backend (BaaS + Server-side)
Tecnologia
Função
Supabase (PostgreSQL)
Banco de dados relacional
Supabase Auth
Autenticação (email/senha, magic link, OAuth)
Supabase Storage
Armazenamento de áudios e documentos
Supabase RLS
Segurança a nível de linha (isolamento por profissional)
Supabase Realtime
Atualizações em tempo real (notificações futuras)
Next.js Server Actions
Mutations (criar paciente, salvar sessão, etc.)
Next.js Route Handlers
APIs complexas (processar áudio, webhooks, Gemini)
Inngest ou Trigger.dev
Fila de processamento assíncrono (transcrições, IA)

2.3 Inteligência Artificial
Tecnologia
Função
Gemini 2.5 Flash
Transcrição, SmartNotes, Evolução
Gemini 2.5 Pro
Resumo consolidado, Assistente IA, Laudos
@google/generative-ai
SDK oficial Node.js para Gemini

2.4 Pagamentos
Tecnologia
Função
Stripe
Cobranças recorrentes, cartão, checkout, portal do cliente
Stripe Webhooks
Confirmação de pagamento, inadimplência, cancelamento
Stripe Billing
Gestão de planos e assinaturas

2.5 Infraestrutura e DevOps
Tecnologia
Função
Vercel
Hospedagem do Next.js (deploy automático via GitHub)
Supabase Cloud
Hospedagem do banco, auth e storage
GitHub
Repositório do código (monorepo)
Vercel Analytics
Métricas de performance do frontend
Sentry
Monitoramento de erros (frontend + server)
Vercel Cron
Tarefas agendadas (lembretes, relatórios)

2.6 Ferramentas de Desenvolvimento
Ferramenta
Função
Google AI Studio (Antigravity)
IDE principal
Claude Code
Vibe coding assistido
ESLint
Linting do código
Prettier
Formatação automática
Supabase CLI
Migrations e gerenciamento local do banco
Supabase Studio
Interface visual para gerenciar o banco


3. Estrutura do Monorepo
/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Grupo de rotas públicas (login, cadastro)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── cadastro/
│   │   │   └── page.tsx
│   │   ├── recuperar-senha/
│   │   │   └── page.tsx
│   │   └── layout.tsx            # Layout sem sidebar (público)
│   │
│   ├── (dashboard)/              # Grupo de rotas protegidas (app principal)
│   │   ├── layout.tsx            # Layout com sidebar + header (autenticado)
│   │   │
│   │   ├── pacientes/
│   │   │   ├── page.tsx                        # Listagem de pacientes
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx                    # Perfil do paciente
│   │   │   │   ├── prontuario/page.tsx         # Prontuário geral
│   │   │   │   ├── sessoes/page.tsx            # Arquivo de sessões
│   │   │   │   ├── anamnese/page.tsx           # Anamnese
│   │   │   │   ├── resumo/page.tsx             # Resumo IA
│   │   │   │   ├── documentos/page.tsx         # Biblioteca de documentos
│   │   │   │   └── lembretes/page.tsx          # Lembretes e alertas
│   │   │   └── _components/                    # Componentes exclusivos de pacientes
│   │   │       ├── patient-form.tsx
│   │   │       ├── patient-card.tsx
│   │   │       └── patient-filters.tsx
│   │   │
│   │   ├── sessoes/
│   │   │   ├── page.tsx                        # Gestão da sessão
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx                    # Sessão específica
│   │   │   └── _components/
│   │   │       ├── session-editor.tsx           # Editor de anotações (Tiptap)
│   │   │       ├── evolution-editor.tsx         # Editor de evolução (Tiptap)
│   │   │       ├── audio-recorder.tsx           # Gravador de áudio
│   │   │       ├── audio-player.tsx             # Player de áudio
│   │   │       ├── smartnotes-modal.tsx         # Modal do SmartNotes
│   │   │       └── save-audio-modal.tsx         # Modal salvar áudio
│   │   │
│   │   ├── agendamentos/
│   │   │   ├── page.tsx                        # Calendário de agendamentos
│   │   │   └── _components/
│   │   │       ├── calendar-view.tsx
│   │   │       ├── appointment-form.tsx
│   │   │       └── appointment-card.tsx
│   │   │
│   │   ├── assistente/
│   │   │   ├── page.tsx                        # Chat com IA
│   │   │   └── _components/
│   │   │       ├── chat-interface.tsx
│   │   │       └── message-bubble.tsx
│   │   │
│   │   ├── financeiro/
│   │   │   ├── page.tsx                        # Dashboard financeiro
│   │   │   └── _components/
│   │   │       ├── payment-table.tsx
│   │   │       └── revenue-chart.tsx
│   │   │
│   │   ├── monitoramento/
│   │   │   ├── page.tsx                        # Dashboard geral
│   │   │   └── _components/
│   │   │       └── metrics-cards.tsx
│   │   │
│   │   └── conta/
│   │       ├── page.tsx                        # Configurações da conta
│   │       ├── assinatura/page.tsx             # Gestão do plano
│   │       └── clinica/page.tsx                # Dados da clínica
│   │
│   ├── api/                      # Route Handlers (APIs)
│   │   ├── ai/
│   │   │   ├── transcribe/route.ts             # POST — transcrição de áudio
│   │   │   ├── smartnotes/route.ts             # POST — gerar SmartNotes
│   │   │   ├── evolution/route.ts              # POST — gerar evolução
│   │   │   ├── summary/route.ts                # POST — resumo consolidado
│   │   │   └── chat/route.ts                   # POST — assistente IA (streaming)
│   │   ├── webhooks/
│   │   │   └── stripe/route.ts                 # POST — webhooks de pagamento
│   │   └── cron/
│   │       ├── reminders/route.ts              # Lembretes automáticos
│   │       └── reports/route.ts                # Relatórios periódicos
│   │
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Redirect para login ou dashboard
│   └── globals.css               # Estilos globais + Tailwind
│
├── components/                   # Componentes compartilhados (globais)
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   ├── calendar.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   ├── mobile-nav.tsx
│   │   └── breadcrumb.tsx
│   └── shared/
│       ├── loading-spinner.tsx
│       ├── empty-state.tsx
│       ├── confirm-dialog.tsx
│       └── pdf-viewer.tsx
│
├── lib/                          # Lógica de negócio e utilitários
│   ├── supabase/
│   │   ├── client.ts             # Supabase client (browser)
│   │   ├── server.ts             # Supabase client (server-side)
│   │   ├── admin.ts              # Supabase admin (service role, uso restrito)
│   │   └── middleware.ts         # Middleware de auth
│   ├── gemini/
│   │   ├── client.ts             # Configuração do Gemini SDK
│   │   ├── prompts.ts            # System prompts por funcionalidade
│   │   ├── transcribe.ts         # Lógica de transcrição
│   │   ├── smartnotes.ts         # Lógica de SmartNotes
│   │   ├── evolution.ts          # Lógica de geração de evolução
│   │   ├── summary.ts            # Lógica de resumo consolidado
│   │   └── assistant.ts          # Lógica do assistente IA
│   ├── stripe/
│   │   ├── client.ts             # Configuração do Stripe SDK
│   │   ├── subscriptions.ts      # Gestão de assinaturas e planos
│   │   ├── checkout.ts           # Criação de sessões de checkout
│   │   └── webhooks.ts           # Processamento de webhooks
│   ├── validators/
│   │   ├── patient.ts            # Schema Zod para paciente
│   │   ├── session.ts            # Schema Zod para sessão
│   │   ├── appointment.ts        # Schema Zod para agendamento
│   │   └── payment.ts            # Schema Zod para pagamento
│   ├── utils/
│   │   ├── format.ts             # Formatação (datas, moeda, CPF, telefone)
│   │   ├── constants.ts          # Constantes do sistema
│   │   └── helpers.ts            # Funções auxiliares
│   └── types/
│       ├── database.ts           # Tipos gerados do Supabase (auto)
│       ├── gemini.ts             # Tipos das respostas da IA
│       └── app.ts                # Tipos da aplicação
│
├── actions/                      # Server Actions (mutations)
│   ├── patients.ts               # Criar, editar, deletar paciente
│   ├── sessions.ts               # Criar, editar sessão
│   ├── appointments.ts           # CRUD agendamentos
│   ├── audio.ts                  # Upload e processamento de áudio
│   ├── documents.ts              # Upload de documentos
│   └── auth.ts                   # Login, cadastro, logout
│
├── hooks/                        # React hooks customizados
│   ├── use-patient.ts
│   ├── use-session.ts
│   ├── use-audio-recorder.ts
│   ├── use-realtime.ts
│   └── use-subscription.ts
│
├── supabase/                     # Supabase local config
│   ├── config.toml               # Configuração do projeto Supabase
│   ├── migrations/               # Migrations do banco (versionadas)
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   └── ...
│   └── seed.sql                  # Dados iniciais para desenvolvimento
│
├── public/                       # Arquivos estáticos
│   ├── logo.svg
│   └── favicon.ico
│
├── .env.local                    # Variáveis de ambiente (não commitado)
├── .env.example                  # Template de variáveis de ambiente
├── next.config.js                # Configuração do Next.js
├── tailwind.config.ts            # Configuração do Tailwind
├── tsconfig.json                 # Configuração do TypeScript
├── package.json                  # Dependências
└── README.md                     # Documentação do projeto

4. Padrões de Comunicação
4.1 Frontend → Banco de Dados (Leitura)
Para leituras simples e listagens, o frontend usa o SDK do Supabase diretamente. O RLS garante que o profissional só vê seus próprios dados.
[Client Component] → [Supabase SDK] → [PostgreSQL + RLS]
Quando usar: listar pacientes, buscar dados de um paciente, listar sessões, consultar agendamentos.
4.2 Frontend → Server Actions (Escrita)
Para operações que modificam dados ou envolvem lógica de negócio, o frontend chama Server Actions. Isso garante que a validação e a lógica rodem no servidor.
[Client Component] → [Server Action] → [Validação Zod] → [Supabase Admin] → [PostgreSQL]
Quando usar: criar paciente, salvar sessão, criar agendamento, atualizar perfil.
4.3 Frontend → Route Handlers (APIs Complexas)
Para operações assíncronas, integrações externas e streaming, o frontend chama Route Handlers.
[Client Component] → [Route Handler] → [Gemini API / Stripe API / Fila]
Quando usar: transcrição de áudio, geração de SmartNotes, chat do assistente IA (streaming), webhooks.
4.4 Processamento Assíncrono (Filas)
Tarefas pesadas como transcrição de áudio não devem bloquear a interface. O fluxo assíncrono funciona assim:
[Route Handler] → [Inngest/Trigger.dev] → [Job de processamento] → [Supabase update]
                                                                          ↓
[Frontend via Realtime] ← ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
Usuário clica "Salvar áudio"
Route Handler faz upload do áudio para Supabase Storage
Route Handler dispara job na fila (Inngest)
Job processa: chama Gemini para transcrição → gera SmartNotes → salva no banco
Frontend recebe atualização via Supabase Realtime e exibe o resultado

5. Autenticação e Segurança
5.1 Fluxo de Autenticação
[Usuário] → [Página de Login] → [Supabase Auth] → [JWT Token]
                                                        ↓
                                              [Middleware Next.js]
                                                        ↓
                                         [Redireciona para /dashboard]
5.2 Middleware de Proteção de Rotas
Rota
Acesso
/login, /cadastro, /recuperar-senha
Público
/pacientes/**, /sessoes/**, /agendamentos/**
Autenticado
/conta/assinatura/**
Autenticado + plano ativo
/api/webhooks/**
Verificação de assinatura do webhook (Stripe signature)
/api/ai/**
Autenticado + verificação de limites do plano

5.3 Row Level Security (RLS)
Toda tabela que contém dados de pacientes ou sessões tem RLS habilitado. A policy base é:
sql
-- Exemplo: o profissional só acessa seus próprios pacientes
CREATE POLICY "professionals_own_patients" ON patients
  FOR ALL
  USING (professional_id = auth.uid());
Isso garante que, mesmo que um bug no frontend tente acessar dados de outro profissional, o banco rejeita a query.
5.4 Hierarquia de Segurança
Camada
Proteção
1. Middleware Next.js
Verifica se o usuário está logado antes de servir a página
2. Server Actions
Valida dados com Zod + verifica permissões
3. RLS no Supabase
Isola dados por profissional no nível do banco
4. Criptografia
HTTPS em trânsito, criptografia em repouso no Supabase
5. API Keys
Gemini e Asaas keys apenas em variáveis de ambiente server-side


6. Storage de Arquivos
6.1 Buckets no Supabase Storage
Bucket
Conteúdo
Acesso
Limite
audios
Gravações de sessões (webm/mp3)
Privado (RLS por profissional)
Definido por plano
documents
Documentos dos pacientes (PDF, imagens)
Privado (RLS por profissional)
50MB por arquivo
exports
PDFs gerados (resumos, evoluções)
Privado (RLS por profissional)
Temporário (7 dias)
avatars
Fotos de perfil dos profissionais
Público
2MB por arquivo

6.2 Política de Armazenamento
Item
Regra
Upload de áudio
Máximo 120 minutos por arquivo
Formato de áudio
webm (gravação nativa do browser) → convertido para mp3 se necessário
Retenção de áudios
Permanente (enquanto a conta estiver ativa)
Backup
Supabase realiza backup diário automático
Exclusão
Ao deletar paciente, todos os arquivos associados são removidos (LGPD)


7. Deploy e Ambientes
7.1 Ambientes
Ambiente
URL
Branch
Banco
Desenvolvimento
localhost:3000
feature/*
Supabase local (Docker)
Preview
*.vercel.app (automático)
Pull Requests
Supabase staging
Produção
app.seudominio.com.br
main
Supabase production

7.2 Fluxo de Deploy
[Push no GitHub]
      ↓
[Vercel detecta automaticamente]
      ↓
  ┌─── branch main ──→ Deploy em Produção
  │
  └─── branch PR ────→ Deploy Preview (URL temporária)
7.3 Variáveis de Ambiente
Variável
Onde
Descrição
NEXT_PUBLIC_SUPABASE_URL
Client + Server
URL do projeto Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY
Client + Server
Chave pública do Supabase
SUPABASE_SERVICE_ROLE_KEY
Server only
Chave admin do Supabase (bypassa RLS)
GEMINI_API_KEY
Server only
API key do Google Gemini
STRIPE_SECRET_KEY
Server only
Chave secreta do Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
Client + Server
Chave pública do Stripe
STRIPE_WEBHOOK_SECRET
Server only
Secret para validar webhooks
INNGEST_EVENT_KEY
Server only
Chave do Inngest para filas
SENTRY_DSN
Client + Server
DSN do Sentry para monitoramento


8. Performance e Otimização
8.1 Estratégias de Performance
Estratégia
Implementação
Server Components
Páginas renderizadas no servidor por padrão (menos JS no client)
Streaming SSR
Páginas carregam progressivamente com loading.tsx e Suspense
Cache de dados
unstable_cache do Next.js para queries frequentes (lista de pacientes)
Imagens otimizadas
next/image para avatares e logos
Code splitting
Automático pelo App Router (cada rota é um bundle separado)
Lazy loading
Componentes pesados (editor Tiptap, calendário) carregados sob demanda
Debounce
Busca de pacientes com debounce de 300ms
Paginação
Listagens com cursor-based pagination (Supabase .range())

8.2 Metas de Performance
Métrica
Meta
LCP (Largest Contentful Paint)
< 1.5s
FID (First Input Delay)
< 100ms
CLS (Cumulative Layout Shift)
< 0.1
TTFB (Time to First Byte)
< 200ms
Bundle JS inicial
< 150KB gzipped


9. Monitoramento e Observabilidade
9.1 Stack de Monitoramento
Ferramenta
O que monitora
Sentry
Erros de frontend e server (stack traces, breadcrumbs)
Vercel Analytics
Web Vitals, performance por rota, tráfego
Vercel Logs
Logs de Server Actions e Route Handlers
Supabase Dashboard
Queries lentas, uso de storage, conexões ao banco
Dashboard interno
Uso de IA por profissional, custos, limites de plano

9.2 Alertas Críticos
Alerta
Condição
Canal
Erro 500 em produção
Qualquer erro não tratado
Sentry → Email
API Gemini down
3 falhas consecutivas
Sentry → Email
Banco lento
Query > 2s
Supabase → Email
Storage cheio
Bucket > 80% do limite
Dashboard interno
Webhook falhou
Stripe webhook não processado
Sentry → Email

11. Dependências do package.json
11.1 Dependências de Produção
json
{
  "dependencies": {
    "next": "^14.2",
    "react": "^18.3",
    "react-dom": "^18.3",
    "@supabase/supabase-js": "^2.45",
    "@supabase/ssr": "^0.5",
    "@google/generative-ai": "^0.21",
    "@tiptap/react": "^2.6",
    "@tiptap/starter-kit": "^2.6",
    "@tiptap/extension-placeholder": "^2.6",
    "@tiptap/extension-text-align": "^2.6",
    "@tiptap/extension-color": "^2.6",
    "@tiptap/extension-highlight": "^2.6",
    "@tiptap/extension-image": "^2.6",
    "react-hook-form": "^7.53",
    "@hookform/resolvers": "^3.9",
    "zod": "^3.23",
    "date-fns": "^3.6",
    "zustand": "^4.5",
    "sonner": "^1.5",
    "lucide-react": "^0.441",
    "inngest": "^3.22",
    "stripe": "^17.3",
    "class-variance-authority": "^0.7",
    "clsx": "^2.1",
    "tailwind-merge": "^2.5"
  }
}
11.2 Dependências de Desenvolvimento
json
{
  "devDependencies": {
    "typescript": "^5.6",
    "@types/node": "^22",
    "@types/react": "^18.3",
    "tailwindcss": "^3.4",
    "postcss": "^8.4",
    "autoprefixer": "^10.4",
    "eslint": "^8.57",
    "eslint-config-next": "^14.2",
    "prettier": "^3.3",
    "supabase": "^1.200"
  }
}

