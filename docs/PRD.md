# PRD - Product Requirements Document
## Finanza - Sistema de Controle Financeiro Pessoal

**Versão:** 1.0  
**Data:** 07 de Dezembro de 2025  
**Status:** Em Desenvolvimento

---

## 1. Visão Geral do Produto

### 1.1 Objetivo
O Finanza é uma aplicação web de controle financeiro pessoal que permite aos usuários gerenciar suas finanças de forma simples e intuitiva, oferecendo visibilidade completa sobre receitas, despesas, dívidas e saldos bancários.

### 1.2 Problema a Resolver
Muitas pessoas têm dificuldade em controlar suas finanças pessoais, não sabendo exatamente:
- Quanto ganham e gastam por mês
- Para onde vai o dinheiro
- Qual o saldo disponível em suas contas
- Quais dívidas possuem e seus vencimentos

### 1.3 Proposta de Valor
O Finanza oferece uma solução centralizada e visual para gestão financeira pessoal, com:
- Dashboard interativo com visão consolidada
- Categorização automática de transações
- Alertas de vencimentos
- Relatórios detalhados
- Suporte a múltiplas contas bancárias

---

## 2. Público-Alvo

### 2.1 Personas

**Persona Principal: João, 32 anos**
- Profissional CLT
- Renda mensal fixa
- Dificuldade em controlar gastos do cartão de crédito
- Quer economizar para objetivos específicos

**Persona Secundária: Maria, 45 anos**
- Autônoma com renda variável
- Múltiplas fontes de renda
- Precisa controlar fluxo de caixa
- Quer visualizar tendências financeiras

### 2.2 Necessidades dos Usuários
- Registrar receitas e despesas facilmente
- Visualizar saldo disponível em tempo real
- Categorizar gastos automaticamente
- Receber alertas de vencimentos
- Gerar relatórios para análise

---

## 3. Funcionalidades

### 3.1 Autenticação e Segurança

| Funcionalidade | Descrição | Prioridade |
|----------------|-----------|------------|
| Cadastro de usuário | Registro com email e senha | Alta |
| Login | Autenticação com email/senha | Alta |
| Recuperação de senha | Reset via email | Alta |
| Sessão persistente | Opção "Lembrar-me" | Média |
| Logout | Encerramento de sessão | Alta |

### 3.2 Dashboard

| Funcionalidade | Descrição | Prioridade |
|----------------|-----------|------------|
| Resumo financeiro | Cards com totais de receitas, despesas e saldo | Alta |
| Gráfico de receitas | Pizza com distribuição por categoria | Alta |
| Gráfico de despesas | Pizza com distribuição por categoria | Alta |
| Evolução mensal | Gráfico de barras com histórico | Alta |
| Taxa de economia | Percentual de economia mensal | Média |
| Saldos bancários | Lista de contas com saldos | Alta |
| Dívidas pendentes | Resumo de dívidas a pagar | Alta |

### 3.3 Gestão de Receitas

| Funcionalidade | Descrição | Prioridade |
|----------------|-----------|------------|
| Cadastro de receita | Registro de entradas financeiras | Alta |
| Edição de receita | Modificação de registros existentes | Alta |
| Exclusão de receita | Remoção de registros | Alta |
| Categorização | Classificação por tipo de receita | Alta |
| Filtro por mês | Visualização por período | Alta |
| Observações | Campo para anotações | Baixa |

### 3.4 Gestão de Despesas

| Funcionalidade | Descrição | Prioridade |
|----------------|-----------|------------|
| Cadastro de despesa | Registro de saídas financeiras | Alta |
| Edição de despesa | Modificação de registros existentes | Alta |
| Exclusão de despesa | Remoção de registros | Alta |
| Categorização | Classificação por tipo de despesa | Alta |
| Data de vencimento | Controle de prazos | Alta |
| Status de pagamento | Pago/Pendente | Alta |
| Despesas recorrentes | Registro automático mensal | Média |
| Frequência de recorrência | Diária/Semanal/Mensal/Anual | Média |
| Alertas | Notificação de vencimentos | Média |

### 3.5 Gestão de Dívidas

| Funcionalidade | Descrição | Prioridade |
|----------------|-----------|------------|
| Cadastro de dívida | Registro de débitos a longo prazo | Alta |
| Valor total | Montante total da dívida | Alta |
| Valor pago | Controle de amortização | Alta |
| Valor restante | Cálculo automático do saldo devedor | Alta |
| Status | Em andamento/Quitada | Alta |
| Data de vencimento | Prazo final | Média |

### 3.6 Saldos Bancários

| Funcionalidade | Descrição | Prioridade |
|----------------|-----------|------------|
| Cadastro de conta | Registro de contas bancárias | Alta |
| Tipo de conta | Corrente/Poupança/Investimento | Alta |
| Banco | Nome da instituição | Alta |
| Saldo atual | Valor disponível | Alta |
| Agência e conta | Dados bancários | Baixa |
| Atualização de saldo | Modificação do valor | Alta |

### 3.7 Cartões de Crédito

| Funcionalidade | Descrição | Prioridade |
|----------------|-----------|------------|
| Cadastro de cartão | Registro de cartões | Alta |
| Limite | Valor máximo disponível | Alta |
| Fatura atual | Valor a pagar | Alta |
| Vencimento | Data de pagamento | Alta |

### 3.8 Relatórios

| Funcionalidade | Descrição | Prioridade |
|----------------|-----------|------------|
| Relatório mensal | Resumo do mês | Alta |
| Comparativo | Evolução entre períodos | Média |
| Exportação PDF | Download de relatórios | Média |
| Gráficos analíticos | Visualizações detalhadas | Alta |

### 3.9 Configurações

| Funcionalidade | Descrição | Prioridade |
|----------------|-----------|------------|
| Gestão de categorias | Criar/editar categorias | Alta |
| Tema claro/escuro | Alternância de aparência | Média |
| Perfil do usuário | Dados pessoais | Baixa |
| Importação de dados | Upload de planilhas | Média |

---

## 4. Arquitetura Técnica

### 4.1 Stack Tecnológico

| Camada | Tecnologia |
|--------|------------|
| Frontend | React 18 + TypeScript |
| Estilização | Tailwind CSS + shadcn/ui |
| Roteamento | React Router DOM |
| Estado Global | React Context + TanStack Query |
| Build Tool | Vite |
| Backend | Supabase (BaaS) |
| Banco de Dados | PostgreSQL (via Supabase) |
| Autenticação | Supabase Auth |
| Hospedagem | Lovable Cloud |

### 4.2 Estrutura do Banco de Dados

#### Tabela: `profiles`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Chave primária |
| email | TEXT | Email do usuário |
| full_name | TEXT | Nome completo |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Data de atualização |

#### Tabela: `receitas`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Chave primária |
| user_id | UUID | Referência ao usuário |
| descricao | TEXT | Descrição da receita |
| valor | DECIMAL | Valor recebido |
| categoria | TEXT | Categoria da receita |
| data_recebimento | DATE | Data do recebimento |
| mes_referencia | TEXT | Mês de referência (YYYY-MM) |
| observacoes | TEXT | Observações adicionais |

#### Tabela: `despesas`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Chave primária |
| user_id | UUID | Referência ao usuário |
| descricao | TEXT | Descrição da despesa |
| valor | DECIMAL | Valor gasto |
| categoria | TEXT | Categoria da despesa |
| data_pagamento | DATE | Data do pagamento |
| data_vencimento | DATE | Data de vencimento |
| mes_referencia | TEXT | Mês de referência |
| status | TEXT | Status (pago/pendente) |
| recorrente | BOOLEAN | Indica se é recorrente |
| frequencia_recorrencia | TEXT | Frequência da recorrência |
| alerta_ativo | BOOLEAN | Alerta habilitado |
| observacoes | TEXT | Observações |

#### Tabela: `dividas`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Chave primária |
| user_id | UUID | Referência ao usuário |
| descricao | TEXT | Descrição da dívida |
| valor_total | DECIMAL | Valor total |
| valor_pago | DECIMAL | Valor já pago |
| valor_restante | DECIMAL | Saldo devedor |
| categoria | TEXT | Categoria |
| data_vencimento | DATE | Data de vencimento |
| status | TEXT | Status da dívida |
| observacoes | TEXT | Observações |

#### Tabela: `saldos_bancarios`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Chave primária |
| user_id | UUID | Referência ao usuário |
| banco | TEXT | Nome do banco |
| tipo_conta | TEXT | Tipo da conta |
| saldo | DECIMAL | Saldo atual |
| agencia | TEXT | Número da agência |
| numero_conta | TEXT | Número da conta |
| observacoes | TEXT | Observações |

#### Tabela: `categorias`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Chave primária |
| user_id | UUID | Referência ao usuário |
| nome | TEXT | Nome da categoria |
| tipo | TEXT | Tipo (receita/despesa) |

### 4.3 Segurança
- Row Level Security (RLS) habilitado em todas as tabelas
- Políticas de acesso por usuário autenticado
- Dados isolados por `user_id`
- Autenticação via JWT

---

## 5. Experiência do Usuário (UX)

### 5.1 Fluxos Principais

#### Fluxo de Primeiro Acesso
1. Usuário acessa a aplicação
2. Visualiza tela de login
3. Clica em "Criar conta"
4. Preenche dados de cadastro
5. Recebe confirmação por email
6. Faz login
7. Visualiza Dashboard vazio
8. Opção de importar dados ou adicionar manualmente

#### Fluxo de Registro de Despesa
1. Usuário acessa menu "Despesas"
2. Clica em "Nova Despesa"
3. Preenche formulário
4. Seleciona categoria
5. Define data de vencimento
6. Marca status de pagamento
7. Salva registro
8. Visualiza despesa na lista

### 5.2 Design System
- **Tema:** Suporte a modo claro e escuro
- **Cores:** Paleta personalizada via CSS variables
- **Tipografia:** Sistema de fontes responsivo
- **Componentes:** Biblioteca shadcn/ui customizada
- **Ícones:** Lucide React

### 5.3 Responsividade
- Desktop: Layout com sidebar fixa
- Tablet: Sidebar colapsável
- Mobile: Navegação inferior ou menu hamburguer

---

## 6. Métricas de Sucesso

### 6.1 KPIs do Produto
| Métrica | Meta | Período |
|---------|------|---------|
| Usuários ativos mensais | 1.000 | 6 meses |
| Taxa de retenção | 60% | Mensal |
| Transações registradas | 10.000 | Mensal |
| NPS | > 40 | Trimestral |

### 6.2 Métricas Técnicas
| Métrica | Meta |
|---------|------|
| Tempo de carregamento | < 2s |
| Uptime | 99.5% |
| Core Web Vitals | Verde |

---

## 7. Roadmap

### Fase 1 - MVP (Atual) ✅
- [x] Autenticação de usuários
- [x] Dashboard com visão geral
- [x] CRUD de receitas
- [x] CRUD de despesas
- [x] CRUD de dívidas
- [x] Gestão de saldos bancários
- [x] Filtro por mês
- [x] Tema claro/escuro
- [x] Categorias personalizadas

### Fase 2 - Melhorias (Próximo)
- [ ] Cartões de crédito completo
- [ ] Relatórios avançados
- [ ] Exportação para PDF/Excel
- [ ] Metas de economia
- [ ] Orçamento mensal por categoria

### Fase 3 - Expansão (Futuro)
- [ ] App mobile (PWA)
- [ ] Notificações push
- [ ] Integração bancária (Open Banking)
- [ ] Inteligência artificial para insights
- [ ] Compartilhamento familiar

---

## 8. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Perda de dados | Baixa | Alto | Backups automáticos Supabase |
| Vazamento de dados | Baixa | Alto | RLS + Autenticação robusta |
| Baixa adoção | Média | Médio | UX intuitiva + Onboarding |
| Performance lenta | Baixa | Médio | Otimização de queries + Cache |

---

## 9. Glossário

| Termo | Definição |
|-------|-----------|
| Receita | Entrada de dinheiro (salário, rendimentos, etc.) |
| Despesa | Saída de dinheiro (contas, compras, etc.) |
| Dívida | Valor devido a terceiros com prazo de pagamento |
| RLS | Row Level Security - política de segurança a nível de linha |
| MVP | Minimum Viable Product - produto mínimo viável |

---

## 10. Histórico de Revisões

| Versão | Data | Autor | Alterações |
|--------|------|-------|------------|
| 1.0 | 07/12/2025 | Finanza Team | Documento inicial |

---

*Este documento é um guia vivo e será atualizado conforme o produto evolui.*
