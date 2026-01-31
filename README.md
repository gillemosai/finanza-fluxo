<p align="center">
  <img src="public/logo cheia transp var01.png" alt="Finanza Logo" width="200"/>
</p>

<h1 align="center">Finanza Fluxo</h1>

<p align="center">
  <strong>Controle financeiro pessoal completo, moderno e offline-first</strong>
</p>

<p align="center">
  <a href="#-recursos">Recursos</a> •
  <a href="#-tecnologias">Tecnologias</a> •
  <a href="#-instalação">Instalação</a> •
  <a href="#-uso">Uso</a> •
  <a href="#-arquitetura">Arquitetura</a> •
  <a href="#-licença">Licença</a>
</p>

---

## 📋 Sobre

O **Finanza Fluxo** é uma aplicação completa de controle financeiro pessoal desenvolvida com foco em experiência do usuário, funcionamento offline e multi-plataforma. Gerencie suas receitas, despesas, dívidas, cartões e metas financeiras de forma intuitiva e segura.

**URL do Projeto**: https://lovable.dev/projects/b3fbd5f8-1770-4b37-bde3-cd1d8ecbe0db

**Produção**: https://finanza-fluxo.lovable.app

---

## ✨ Recursos

### 📊 Dashboard Interativo
- **KPIs Financeiros**: Visualize receitas, despesas, saldo, valores pagos e a pagar
- **Gráfico de Evolução Mensal**: Acompanhe a evolução das suas finanças ao longo do tempo
- **Distribuição de Receitas**: Gráfico de pizza por categoria de receitas
- **Principais Despesas**: Gráfico donut com as maiores despesas do período
- **Status de Pagamentos**: Visão rápida do que foi pago vs pendente

### 💰 Gestão Financeira Completa
- **Receitas**: Cadastro e acompanhamento de todas as entradas
- **Despesas**: Controle detalhado com categorias, status e recorrência
- **Dívidas**: Gestão de dívidas com acompanhamento de pagamentos parciais
- **Cartões de Crédito**: Controle de faturas e limites
- **Saldos Bancários**: Acompanhamento de múltiplas contas

### 🎯 Metas & Sonhos
- Crie metas financeiras personalizadas (viagem, carro, casa, etc.)
- Acompanhe o progresso com indicadores visuais
- Defina prazos e valores objetivos
- Personalize com ícones e cores

### 📅 Filtro Global de Mês
- Selecione o mês no Dashboard e a seleção persiste em todas as telas
- Navegue entre páginas sem perder o contexto temporal
- Visualização integrada de dados por período

### 📑 Relatórios e Exportação
- **Exportação Excel**: Planilhas completas com múltiplas abas
- **Exportação PDF**: Relatórios formatados para impressão
- Filtros por período e categorias
- Dados separados por tipo (Receitas, Despesas, Dívidas, Resumo)

### 🔐 Autenticação Segura
- Login com email e senha
- Opção "Permanecer conectado" com sessões persistentes
- Recuperação de senha por email
- Validação forte de senhas (8+ caracteres, maiúsculas, minúsculas, números, especiais)
- Proteção de rotas para usuários autenticados

### 📱 Progressive Web App (PWA)
- Instalável em qualquer dispositivo (Windows, macOS, Linux, iOS, Android)
- Ícone na área de trabalho/tela inicial
- Experiência nativa sem app stores
- Service Worker para cache e performance

### 📴 Funcionamento Offline-First
- **IndexedDB**: Armazenamento local para funcionamento sem internet
- **Sincronização Automática**: Dados sincronizam quando a conexão retorna
- **Indicador de Status**: Visualize o status de conexão em tempo real
- Zero perda de dados durante quedas de internet

### 📲 Apps Nativos (Capacitor)
- Suporte para build iOS (App Store)
- Suporte para build Android (Google Play)
- Código compartilhado com a versão web
- SQLite nativo para melhor performance mobile

### 🎨 Interface Moderna
- **Tema Claro/Escuro**: Alternância com um clique
- **Menu Hamburger Mobile**: Navegação padrão internacional
- **Design Responsivo**: Funciona perfeitamente em qualquer tela
- **Acessibilidade**: Suporte a leitores de tela (ARIA)

### 🔧 Ferramentas de Dados
- **Importação de Planilhas**: Importe dados de arquivos Excel
- **Geração de Dados de Exemplo**: Popule o app com dados fictícios para demonstração
- **Modo Demo**: Explore o app sem criar conta

---

## 🛠 Tecnologias

### Frontend
| Tecnologia | Descrição |
|------------|-----------|
| React 18 | Biblioteca UI |
| TypeScript | Tipagem estática |
| Vite | Build tool |
| Tailwind CSS | Estilização |
| shadcn/ui | Componentes UI |
| React Router | Roteamento |
| TanStack Query | Gerenciamento de estado servidor |
| Framer Motion | Animações |
| Recharts | Gráficos |

### Backend & Banco de Dados
| Tecnologia | Descrição |
|------------|-----------|
| Supabase | Backend as a Service |
| PostgreSQL | Banco de dados |
| Row Level Security | Segurança de dados por usuário |
| Edge Functions | Funções serverless |

### Offline & Storage
| Tecnologia | Descrição |
|------------|-----------|
| IndexedDB | Armazenamento local (web) |
| SQLite | Armazenamento local (nativo) |
| Service Worker | Cache e offline |

### Mobile & Desktop
| Tecnologia | Descrição |
|------------|-----------|
| Capacitor | Apps nativos iOS/Android |
| PWA | Instalação web |
| Electron | Desktop (opcional) |

---

## 🚀 Instalação

### Pré-requisitos
- Node.js 18+
- npm ou bun

### Instalação Rápida (Windows)
```batch
# Execute o instalador
Instalar Tudo.bat
```
Isso instalará as dependências e criará um atalho "Finanza Fluxo" na Área de Trabalho.

### Instalação Rápida (Linux)
```bash
# Torne o script executável e execute
chmod +x install.sh
./install.sh
```
Isso instalará as dependências e criará um atalho no menu de aplicativos.

### Instalação Manual
```bash
# Clone o repositório
git clone <YOUR_GIT_URL>
cd finanza-fluxo

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais Supabase

# Inicie o servidor de desenvolvimento
npm run dev
```

### Build para Produção
```bash
npm run build
npm run preview
```

---

## 📖 Uso

### Iniciando a Aplicação

**Windows:**
```batch
Iniciar Finanza.bat
```
Ou use o atalho "Finanza Fluxo" criado na Área de Trabalho.

**Linux:**
```bash
./start.sh
```
Ou procure por "Finanza Fluxo" no menu de aplicativos.

### Criando Apps Nativos

#### iOS
```bash
npx cap add ios
npx cap sync ios
npx cap open ios
```

#### Android
```bash
npx cap add android
npx cap sync android
npx cap open android
```

---

## 🏗 Arquitetura

```
src/
├── assets/           # Imagens e recursos
├── components/       # Componentes React
│   ├── ui/           # Componentes shadcn/ui
│   └── ...           # Componentes da aplicação
├── hooks/            # Hooks customizados
│   ├── useAuth.tsx           # Autenticação
│   ├── useOfflineData.tsx    # Sincronização offline
│   ├── useGlobalMonthFilter.tsx  # Filtro global
│   └── ...
├── integrations/     # Integrações externas
│   └── supabase/     # Cliente e tipos Supabase
├── pages/            # Páginas da aplicação
├── services/         # Serviços (IndexedDB, SQLite)
├── utils/            # Utilitários
└── lib/              # Bibliotecas auxiliares

supabase/
├── functions/        # Edge Functions
└── migrations/       # Migrações do banco

electron/             # Build Electron (desktop)
```

### Banco de Dados

| Tabela | Descrição |
|--------|-----------|
| profiles | Perfis de usuário |
| receitas | Receitas/entradas |
| despesas | Despesas/saídas |
| dividas | Dívidas e financiamentos |
| categorias | Categorias personalizadas |
| saldos_bancarios | Contas bancárias |
| metas_financeiras | Metas e sonhos |

---

## 🔒 Segurança

- **Row Level Security (RLS)**: Cada usuário acessa apenas seus próprios dados
- **Validação de Entrada**: Sanitização de dados no frontend e backend
- **Senhas Fortes**: Requisitos mínimos de complexidade
- **HTTPS**: Comunicação criptografada
- **Tratamento de Erros**: Logs seguros sem exposição de dados sensíveis

---

## 🌐 Deploy

### Via Lovable
1. Acesse [Lovable](https://lovable.dev/projects/b3fbd5f8-1770-4b37-bde3-cd1d8ecbe0db)
2. Clique em **Share → Publish**

### Domínio Personalizado
Para conectar um domínio personalizado:
1. Navegue até **Project > Settings > Domains**
2. Clique em **Connect Domain**

Mais informações: [Configurando domínio personalizado](https://docs.lovable.dev/features/custom-domain#custom-domain)

---

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, abra uma issue primeiro para discutir as mudanças propostas.

1. Fork o projeto
2. Crie sua branch de feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

**Gil Lemos** - [@gillemosai](https://github.com/gillemosai)

---

<p align="center">
  Feito com ❤️ usando <a href="https://lovable.dev">Lovable</a>
</p>
