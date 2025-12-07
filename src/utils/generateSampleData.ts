import { supabase } from "@/integrations/supabase/client";

// Helper to get month reference in format "MES/AA"
const getMonthRef = (date: Date): string => {
  const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  const month = months[date.getMonth()];
  const year = date.getFullYear().toString().slice(-2);
  return `${month}/${year}`;
};

// Helper to format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Random number helper
const randomBetween = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Random choice from array
const randomChoice = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

export async function generateSampleData(userId: string): Promise<void> {
  const now = new Date();
  
  // Generate data for the last 6 months
  const months: Date[] = [];
  for (let i = 0; i < 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(date);
  }

  // Categories for each type
  const receitasCategorias = ['Trabalho', 'Freelance', 'Investimentos', 'Renda Passiva', 'Vendas', 'Outros'];
  const despesasCategorias = ['Moradia', 'Alimentação', 'Transporte', 'Utilidades', 'Saúde', 'Educação', 'Entretenimento', 'Vestuário'];
  const dividasCategorias = ['Cartão', 'Empréstimo', 'Financiamento', 'Veículo'];
  const bancos = ['Nubank', 'Itaú', 'Bradesco', 'Banco do Brasil', 'Santander', 'Inter', 'C6 Bank'];

  // Sample descriptions
  const receitasDescricoes = [
    'Salário mensal', 'Projeto freelance', 'Dividendos', 'Aluguel recebido', 
    'Consultoria', 'Venda de produto', 'Bônus trimestral', 'Comissão de vendas'
  ];
  const despesasDescricoes = [
    'Aluguel', 'Conta de luz', 'Conta de água', 'Internet', 'Supermercado',
    'Combustível', 'Farmácia', 'Streaming', 'Academia', 'Restaurante',
    'Uber/Táxi', 'Plano de saúde', 'Seguro do carro', 'Manutenção casa'
  ];
  const dividasDescricoes = [
    'Fatura Nubank', 'Fatura Itaú', 'Empréstimo pessoal', 'Financiamento veículo',
    'Parcelamento celular', 'Compra parcelada', 'Cartão de crédito'
  ];

  // Clear existing data for this user
  await supabase.from('receitas').delete().eq('user_id', userId);
  await supabase.from('despesas').delete().eq('user_id', userId);
  await supabase.from('dividas').delete().eq('user_id', userId);
  await supabase.from('saldos_bancarios').delete().eq('user_id', userId);

  // Generate Receitas (Income)
  const receitas = [];
  for (const month of months) {
    // 2-4 income entries per month
    const numEntries = randomBetween(2, 4);
    for (let i = 0; i < numEntries; i++) {
      const day = randomBetween(1, 28);
      const date = new Date(month.getFullYear(), month.getMonth(), day);
      receitas.push({
        user_id: userId,
        descricao: randomChoice(receitasDescricoes),
        valor: randomBetween(1500, 12000),
        categoria: randomChoice(receitasCategorias),
        data_recebimento: formatDate(date),
        mes_referencia: getMonthRef(month),
        observacoes: Math.random() > 0.7 ? 'Pagamento confirmado' : null
      });
    }
  }
  await supabase.from('receitas').insert(receitas);

  // Generate Despesas (Expenses)
  const despesas = [];
  for (const month of months) {
    // 8-15 expense entries per month
    const numEntries = randomBetween(8, 15);
    for (let i = 0; i < numEntries; i++) {
      const day = randomBetween(1, 28);
      const date = new Date(month.getFullYear(), month.getMonth(), day);
      const isRecorrente = Math.random() > 0.7;
      despesas.push({
        user_id: userId,
        descricao: randomChoice(despesasDescricoes),
        valor: randomBetween(50, 3000),
        categoria: randomChoice(despesasCategorias),
        data_pagamento: formatDate(date),
        data_vencimento: formatDate(new Date(date.getTime() + 5 * 24 * 60 * 60 * 1000)),
        mes_referencia: getMonthRef(month),
        status: randomChoice(['pago', 'a_pagar', 'atrasado']),
        recorrente: isRecorrente,
        frequencia_recorrencia: isRecorrente ? 'mensal' : null,
        alerta_ativo: Math.random() > 0.8,
        observacoes: Math.random() > 0.8 ? 'Despesa importante' : null
      });
    }
  }
  await supabase.from('despesas').insert(despesas);

  // Generate Dívidas (Debts)
  const dividas = [];
  const currentMonthRef = getMonthRef(now);
  
  // 3-6 active debts
  const numDebts = randomBetween(3, 6);
  for (let i = 0; i < numDebts; i++) {
    const valorTotal = randomBetween(500, 15000);
    const valorPago = randomBetween(0, Math.floor(valorTotal * 0.7));
    const dueDate = new Date(now.getFullYear(), now.getMonth() + randomBetween(1, 6), randomBetween(5, 25));
    
    dividas.push({
      user_id: userId,
      descricao: randomChoice(dividasDescricoes),
      categoria: randomChoice(dividasCategorias),
      valor_total: valorTotal,
      valor_pago: valorPago,
      valor_restante: valorTotal - valorPago,
      data_vencimento: formatDate(dueDate),
      mes_referencia: currentMonthRef,
      status: valorPago >= valorTotal ? 'pago' : valorPago > 0 ? 'em_andamento' : 'pendente',
      observacoes: Math.random() > 0.7 ? 'Prioridade alta' : null
    });
  }
  await supabase.from('dividas').insert(dividas);

  // Generate Saldos Bancários (Bank Balances)
  const saldos = [];
  const selectedBanks = bancos.slice(0, randomBetween(2, 4));
  
  for (const banco of selectedBanks) {
    saldos.push({
      user_id: userId,
      banco: banco,
      tipo_conta: randomChoice(['corrente', 'poupanca', 'investimento']),
      saldo: randomBetween(500, 25000),
      agencia: `${randomBetween(1000, 9999)}`,
      numero_conta: `${randomBetween(10000, 99999)}-${randomBetween(0, 9)}`,
      observacoes: Math.random() > 0.8 ? 'Conta principal' : null
    });
  }
  await supabase.from('saldos_bancarios').insert(saldos);
}
