# 💰 Finanza Fluxo - Gestão Inteligente

<p align="center">
  <img src="public/logo cheia transp var01.png" alt="Finanza Logo" width="200"/>
</p>

<p align="center">
  <strong>"Cuidado com as pequenas despesas; um pequeno vazamento afundará um grande navio." — Benjamin Franklin</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Offline--First-blueviolet?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/Platform-PWA--Mobile-00f3ff?style=for-the-badge" alt="Platform">
  <img src="https://img.shields.io/badge/Stack-Fullstack-orange?style=for-the-badge" alt="Stack">
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License">
</p>

---

## 🚀 Sobre o Projeto

O **Finanza Fluxo** é um ecossistema completo de controle financeiro pessoal, desenvolvido sob a metodologia **Vibe Code** para unir design intuitivo e robustez técnica. Focado em privacidade e disponibilidade, o app prioriza o funcionamento **Offline-First**, garantindo que você nunca perca o controle de seus dados, com ou sem internet.

* **URL do Projeto:** [Lovable Editor](https://lovable.dev/projects/b3fbd5f8-1770-4b37-bde3-cd1d8ecbe0db)
* **Versão em Produção:** [finanza-fluxo.lovable.app](https://finanza-fluxo.lovable.app)

---

## ✨ Funcionalidades Principais

* **📊 Dashboard Interativo:** KPIs de receitas e despesas com gráficos de evolução mensal e distribuição por categoria.
* **📴 Funcionamento Offline-First:** Armazenamento local via IndexedDB com sincronização automática assim que a conexão retorna.
* **🎯 Metas & Sonhos:** Sistema de acompanhamento de objetivos financeiros com indicadores visuais de progresso.
* **💳 Gestão de Cartões e Dívidas:** Controle detalhado de faturas, limites e pagamentos parciais de débitos.
* **📱 Experiência PWA e Nativa:** Instalável como aplicativo web ou compilável para iOS e Android via Capacitor.
* **📑 Relatórios Profissionais:** Exportação de dados para Excel e relatórios formatados em PDF.

---

## 🛠️ Tecnologias Utilizadas

### Frontend & UI
* **React 18 & TypeScript:** Base sólida para uma interface tipada e reativa.
* **Tailwind CSS & shadcn/ui:** Design moderno, responsivo e com suporte a Tema Escuro/Claro.
* **Framer Motion:** Animações fluidas para uma experiência de uso premium.

### Backend & Storage
* **Supabase:** Backend as a Service com PostgreSQL e Row Level Security (RLS).
* **IndexedDB & SQLite:** Persistência de dados local para alta performance e uso offline.

---

## ⚙️ Instalação e Execução

### 🚀 Instalação Rápida (Windows)
Criamos um script que configura todo o ambiente automaticamente:
1.  Baixe o repositório.
2.  Execute o arquivo **`Instalar Tudo.bat`**.
3.  Use o atalho criado na sua área de trabalho para iniciar.

### 🐧 Instalação no Linux / Mac
```bash
chmod +x install.sh
./install.sh
# Inicie com
./start.sh
```

### 💻 Instalação Manual (Desenvolvedor)
```bash
git clone https://github.com/gillemosai/finanza2026.git
cd finanza2026
npm install
npm run dev
```

---

## 🏗️ Arquitetura do Sistema

```text
src/
├── components/       # UI Reutilizável (shadcn)
├── hooks/            # Lógica de Auth e Sincronização
├── integrations/     # Conexão com Supabase
├── services/         # Motores IndexedDB e SQLite
└── pages/            # Telas da aplicação
```

---

## 📜 Licença

Este projeto está licenciado sob a **Licença MIT**. Sinta-se livre para usar, modificar e distribuir.

---

<p align="center">
  Desenvolvido com 💜 por <strong>Gil Lemos</strong> [@gillemosai]
</p>
