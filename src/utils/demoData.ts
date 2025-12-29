import { supabase } from "@/integrations/supabase/client";

// Credenciais do usuário demo
export const DEMO_USER = {
  email: "demo@finanza.app",
  password: "Demo@2024!"
};

// Dados de exemplo para o usuário demo
export const generateDemoData = () => {
  const currentDate = new Date();
  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  const lastMonthStr = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;

  const receitas = [
    {
      descricao: "Salário",
      valor: 8500,
      categoria: "Salário",
      data_recebimento: `${currentMonth}-05`,
      mes_referencia: currentMonth,
      observacoes: "Salário mensal"
    },
    {
      descricao: "Freelance",
      valor: 2000,
      categoria: "Freelance",
      data_recebimento: `${currentMonth}-15`,
      mes_referencia: currentMonth,
      observacoes: "Projeto de consultoria"
    },
    {
      descricao: "Dividendos",
      valor: 350,
      categoria: "Investimentos",
      data_recebimento: `${currentMonth}-20`,
      mes_referencia: currentMonth,
      observacoes: "Rendimentos de ações"
    },
    {
      descricao: "Salário",
      valor: 8500,
      categoria: "Salário",
      data_recebimento: `${lastMonthStr}-05`,
      mes_referencia: lastMonthStr,
      observacoes: "Salário mensal"
    },
  ];

  const despesas = [
    {
      descricao: "Aluguel",
      valor: 2500,
      categoria: "Moradia",
      data_pagamento: `${currentMonth}-10`,
      mes_referencia: currentMonth,
      status: "pago",
      recorrente: true,
      frequencia_recorrencia: "mensal"
    },
    {
      descricao: "Energia Elétrica",
      valor: 280,
      categoria: "Utilidades",
      data_pagamento: `${currentMonth}-15`,
      mes_referencia: currentMonth,
      status: "pago"
    },
    {
      descricao: "Internet",
      valor: 150,
      categoria: "Utilidades",
      data_pagamento: `${currentMonth}-12`,
      mes_referencia: currentMonth,
      status: "pago",
      recorrente: true,
      frequencia_recorrencia: "mensal"
    },
    {
      descricao: "Supermercado",
      valor: 1200,
      categoria: "Alimentação",
      data_pagamento: `${currentMonth}-08`,
      mes_referencia: currentMonth,
      status: "pago"
    },
    {
      descricao: "Gasolina",
      valor: 450,
      categoria: "Transporte",
      data_pagamento: `${currentMonth}-20`,
      mes_referencia: currentMonth,
      status: "pago"
    },
    {
      descricao: "Academia",
      valor: 120,
      categoria: "Saúde",
      data_pagamento: `${currentMonth}-05`,
      mes_referencia: currentMonth,
      status: "pago",
      recorrente: true,
      frequencia_recorrencia: "mensal"
    },
    {
      descricao: "Streaming (Netflix, Spotify)",
      valor: 85,
      categoria: "Lazer",
      data_pagamento: `${currentMonth}-01`,
      mes_referencia: currentMonth,
      status: "pago",
      recorrente: true
    },
    {
      descricao: "Jantar especial",
      valor: 350,
      categoria: "Lazer",
      data_pagamento: `${currentMonth}-18`,
      mes_referencia: currentMonth,
      status: "pago"
    },
    {
      descricao: "Seguro do carro",
      valor: 380,
      categoria: "Transporte",
      data_pagamento: `${currentMonth}-25`,
      mes_referencia: currentMonth,
      status: "a_pagar",
      data_vencimento: `${currentMonth}-28`
    },
    {
      descricao: "Aluguel",
      valor: 2500,
      categoria: "Moradia",
      data_pagamento: `${lastMonthStr}-10`,
      mes_referencia: lastMonthStr,
      status: "pago"
    },
  ];

  const saldosBancarios = [
    {
      banco: "Nubank",
      saldo: 15320.50,
      tipo_conta: "corrente",
      agencia: "0001",
      numero_conta: "****1234",
      observacoes: "Conta principal"
    },
    {
      banco: "Itaú",
      saldo: 8750.00,
      tipo_conta: "corrente",
      agencia: "1234",
      numero_conta: "****5678",
      observacoes: "Conta salário"
    },
    {
      banco: "XP Investimentos",
      saldo: 45000.00,
      tipo_conta: "investimento",
      observacoes: "Carteira de investimentos"
    },
  ];

  const metasFinanceiras = [
    {
      titulo: "Reserva de Emergência",
      descricao: "6 meses de despesas",
      valor_objetivo: 30000,
      valor_atual: 24070.50,
      categoria: "emergencia",
      status: "em_progresso",
      icone: "🛡️",
      cor: "#10B981"
    },
    {
      titulo: "Viagem para Europa",
      descricao: "Férias de 2 semanas",
      valor_objetivo: 25000,
      valor_atual: 8500,
      categoria: "viagem",
      status: "em_progresso",
      data_limite: "2025-06-30",
      icone: "✈️",
      cor: "#3B82F6"
    },
    {
      titulo: "Novo Notebook",
      descricao: "MacBook Pro para trabalho",
      valor_objetivo: 15000,
      valor_atual: 15000,
      categoria: "compra",
      status: "concluida",
      icone: "💻",
      cor: "#8B5CF6"
    },
  ];

  const dividas = [
    {
      descricao: "Financiamento do Carro",
      valor_total: 45000,
      valor_pago: 18000,
      valor_restante: 27000,
      categoria: "Financiamento",
      status: "em_dia",
      data_vencimento: "2026-12-15",
      observacoes: "36 parcelas de R$ 1.250"
    },
    {
      descricao: "Empréstimo Pessoal",
      valor_total: 10000,
      valor_pago: 7500,
      valor_restante: 2500,
      categoria: "Empréstimo",
      status: "em_dia",
      data_vencimento: "2025-03-20",
      observacoes: "Últimas 2 parcelas"
    },
  ];

  const categorias = [
    { nome: "Salário", tipo: "receita" },
    { nome: "Freelance", tipo: "receita" },
    { nome: "Investimentos", tipo: "receita" },
    { nome: "Outros", tipo: "receita" },
    { nome: "Moradia", tipo: "despesa" },
    { nome: "Alimentação", tipo: "despesa" },
    { nome: "Transporte", tipo: "despesa" },
    { nome: "Saúde", tipo: "despesa" },
    { nome: "Lazer", tipo: "despesa" },
    { nome: "Utilidades", tipo: "despesa" },
    { nome: "Educação", tipo: "despesa" },
  ];

  return { receitas, despesas, saldosBancarios, metasFinanceiras, dividas, categorias };
};

export const insertDemoData = async (userId: string) => {
  const data = generateDemoData();
  
  try {
    // Insert categorias
    await supabase.from("categorias").insert(
      data.categorias.map(c => ({ ...c, user_id: userId }))
    );

    // Insert receitas
    await supabase.from("receitas").insert(
      data.receitas.map(r => ({ ...r, user_id: userId }))
    );

    // Insert despesas
    await supabase.from("despesas").insert(
      data.despesas.map(d => ({ ...d, user_id: userId }))
    );

    // Insert saldos bancários
    await supabase.from("saldos_bancarios").insert(
      data.saldosBancarios.map(s => ({ ...s, user_id: userId }))
    );

    // Insert metas financeiras
    await supabase.from("metas_financeiras").insert(
      data.metasFinanceiras.map(m => ({ ...m, user_id: userId }))
    );

    // Insert dívidas
    await supabase.from("dividas").insert(
      data.dividas.map(d => ({ ...d, user_id: userId }))
    );

    console.log("Demo data inserted successfully");
    return { success: true };
  } catch (error) {
    console.error("Error inserting demo data:", error);
    return { success: false, error };
  }
};
