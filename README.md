# Organizaê · Planner Financeiro

Planner financeiro pessoal completo, moderno e responsivo. Controle ganhos e
despesas, organize por categorias, crie lançamentos recorrentes, planeje metas e
acompanhe tudo em um dashboard elegante.

## Funcionalidades

- **Controle de ganhos e despesas** com nome, valor, data, categoria, forma de
  pagamento/recebimento, observações e recorrência.
- **Dashboard** com saldo atual, ganhos/gastos do mês, gráfico de entradas x
  saídas, gastos por categoria, próximos pagamentos/recebimentos e metas.
- **Categorias personalizáveis** (padrão + criadas pelo usuário).
- **Formas de pagamento e recebimento** configuráveis.
- **Lançamentos recorrentes** (diário, semanal, quinzenal, mensal, anual) com
  geração automática das próximas ocorrências.
- **Metas financeiras** com cálculo de quanto guardar por mês, percentual
  concluído, valor restante, tempo restante e barra de progresso.
- **100% responsivo** (desktop, tablet e celular) com navegação inferior no
  mobile e sidebar no desktop.
- **Tema claro/escuro** com preferência salva.
- **Persistência local** (localStorage) com **login e sincronização em nuvem**
  opcionais via Supabase. Funciona offline e sincroniza ao reconectar.
- **Backup**: exportação e importação em JSON.

## Tecnologias

- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) — build e dev server
- [Tailwind CSS v4](https://tailwindcss.com/) — estilização
- [Zustand](https://zustand-demo.pmnd.rs/) — estado global + persistência
- [Recharts](https://recharts.org/) — gráficos
- [date-fns](https://date-fns.org/) — datas
- [lucide-react](https://lucide.dev/) — ícones
- [Supabase](https://supabase.com/) — autenticação e banco (nuvem, opcional)

## Como rodar

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`.

> Sem configurar a nuvem, o app já funciona 100% local (dados no navegador).

## Login + sincronização em nuvem (opcional, Supabase)

O app é *local-first*: funciona offline e, quando há uma conta conectada,
sincroniza os dados com a nuvem para acesso em qualquer dispositivo.

1. Crie um projeto gratuito em [supabase.com](https://supabase.com).
2. No painel, abra **SQL Editor**, cole o conteúdo de
   [`supabase/schema.sql`](./supabase/schema.sql) e clique em **Run** (cria as
   tabelas e as políticas de segurança por usuário).
3. Em **Project Settings → API**, copie a **Project URL** e a **anon public key**.
4. Crie um arquivo `.env` na raiz (baseado em `.env.example`):

```bash
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

5. Reinicie o `npm run dev`. Um botão **Entrar / Criar conta** aparecerá na
   barra lateral (e um ícone de conta no topo do mobile).

Detalhes do funcionamento:

- Ao **criar conta/entrar**, os dados locais são enviados (merge) e o estado
  consolidado é baixado — nada é perdido.
- Cada alteração é sincronizada automaticamente (com *debounce*).
- O **localStorage** continua como cache/fallback: o app funciona offline.
- A segurança é garantida por **Row Level Security**: cada usuário só acessa os
  próprios dados.

Para gerar a versão de produção:

```bash
npm run build
npm run preview
```

## App Android (APK)

O projeto inclui suporte a **Capacitor** para gerar um APK instalável no Android.

**APK pronto:** após compilar, o arquivo fica em `organizaê.apk` na raiz do projeto (~6 MB).

### Como instalar no celular

1. Copie o arquivo **`organizaê.apk`** para o seu Android (WhatsApp, e-mail, cabo USB, etc.).
2. Toque no arquivo e permita **"Instalar apps desconhecidos"** se o sistema pedir.
3. Confirme a instalação. O app aparecerá como **organizaê** com o ícone azul.

### Recompilar o APK (após alterações no app)

```bash
npm run android:apk
```

Requisitos: Java JDK 17+ e Android SDK (já configurado neste ambiente).

O ícone do app está em `resources/icon.png`. Para trocar, substitua essa imagem e rode:

```bash
npx capacitor-assets generate --android
npm run android:apk
```

## Estrutura do projeto

```
src/
├── components/
│   ├── account/       # Login/cadastro e UI de conta
│   ├── charts/        # Gráficos (Recharts)
│   ├── goals/         # Modais de metas
│   ├── layout/        # Sidebar, topbar, navegação
│   ├── settings/      # Modais de categorias e formas
│   ├── shared/        # Componentes reutilizáveis (StatCard, MonthSelector...)
│   ├── transactions/  # Formulário e itens de lançamento
│   └── ui/            # Design system (Button, Modal, Input, Toast...)
├── lib/               # Utilitários (formatação, recorrência, análise, supabase, sync)
├── pages/             # Telas (Dashboard, Lançamentos, Metas, Configurações)
├── store/             # Estado global (Zustand): finanças, tema, auth
└── types/             # Tipos do domínio
supabase/
└── schema.sql         # Tabelas + RLS para a nuvem
```

## Evoluções futuras

A arquitetura foi pensada para crescer com facilidade:

- **Login de usuários** — isolar o estado por usuário.
- **Sincronização em nuvem** — substituir a persistência local por uma API,
  mantendo a mesma camada `store/`.
- **Exportação de relatórios** — já há exportação JSON; basta adicionar PDF/CSV.
- **Integração bancária** — alimentar os lançamentos via Open Finance.
