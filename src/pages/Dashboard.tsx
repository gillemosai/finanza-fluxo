import { useEffect, useState } from "react";
import { StatCard } from "@/components/StatCard";
import finanzaLogo from "@/assets/finanza-logo.png";
import { MonthFilter } from "@/components/MonthFilter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { 
  PieChart as RechartsPieChart, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  LineChart,
  Line,
  Legend,
  Pie,
  Tooltip
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useGlobalMonthFilter } from "@/hooks/useGlobalMonthFilter";
import { 
  TrendingUp, 
  TrendingDown, 
  CreditCard,
  Wallet,
  DollarSign,
  PiggyBank,
  Target,
  AlertTriangle,
  ArrowUpIcon,
  ArrowDownIcon,
  BarChart3,
  CheckCircle,
  Clock,
  Receipt
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FinancialData {
  receitas: number;
  despesas: number;
  totalPago: number;
  faltaPagar: number;
  saldo: number;
  dividas: number;
}

interface CategoryData {
  categoria: string;
  valor: number;
  fill: string;
  percentual?: number;
}

interface DespesaItem {
  descricao: string;
  valor: number;
  categoria: string;
}

interface MonthlyData {
  mes: string;
  receitas: number;
  despesas: number;
  saldo: number;
}

export default function Dashboard() {
  const [data, setData] = useState<FinancialData>({
    receitas: 0,
    despesas: 0,
    totalPago: 0,
    faltaPagar: 0,
    saldo: 0,
    dividas: 0,
  });
  
  const [receitasChart, setReceitasChart] = useState<CategoryData[]>([]);
  const [despesasChart, setDespesasChart] = useState<CategoryData[]>([]);
  const [principaisDespesas, setPrincipaisDespesas] = useState<DespesaItem[]>([]);
  const [statusPagamento, setStatusPagamento] = useState<{pago: number; pendente: number}>({ pago: 0, pendente: 0 });
  const [monthlyChart, setMonthlyChart] = useState<MonthlyData[]>([]);
  const [cartaoData, setCartaoData] = useState<any[]>([]);
  const [dividasData, setDividasData] = useState<any[]>([]);
  const [saldosBancariosData, setSaldosBancariosData] = useState<any[]>([]);
  
  const { selectedMonth, setSelectedMonth } = useGlobalMonthFilter();
  const { user } = useAuth();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatCurrencyShort = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const getCategoryColor = (index: number) => {
    const colors = [
      '#8B5CF6', // purple
      '#F59E0B', // amber
      '#10B981', // emerald
      '#3B82F6', // blue
      '#EF4444', // red
      '#EC4899', // pink
      '#6366F1', // indigo
      '#14B8A6', // teal
      '#F97316', // orange
      '#84CC16', // lime
    ];
    return colors[index % colors.length];
  };

  useEffect(() => {
    if (user) {
      fetchFinancialData();
    }
  }, [user, selectedMonth]);

  const fetchFinancialData = async () => {
    try {
      if (!user) return;

      // Fetch receitas
      let receitasQuery = supabase
        .from('receitas')
        .select('valor, categoria, mes_referencia')
        .eq('user_id', user.id);
      
      if (selectedMonth) {
        receitasQuery = receitasQuery.eq('mes_referencia', selectedMonth);
      }
      
      const { data: receitas } = await receitasQuery;

      // Fetch despesas with status
      let despesasQuery = supabase
        .from('despesas')
        .select('valor, categoria, descricao, mes_referencia, status')
        .eq('user_id', user.id);
      
      if (selectedMonth) {
        despesasQuery = despesasQuery.eq('mes_referencia', selectedMonth);
      }
      
      const { data: despesas } = await despesasQuery;

      // Fetch dividas
      const { data: dividas } = await supabase
        .from('dividas')
        .select('valor_restante, valor_total, descricao, categoria')
        .eq('user_id', user.id);

      // Fetch saldos bancários
      const { data: saldosBancarios } = await supabase
        .from('saldos_bancarios')
        .select('banco, saldo')
        .eq('user_id', user.id);

      const totalReceitas = receitas?.reduce((acc, item) => acc + Number(item.valor), 0) || 0;
      const totalDespesas = despesas?.reduce((acc, item) => acc + Number(item.valor), 0) || 0;
      
      // Calculate paid vs pending
      const totalPago = despesas?.filter(d => d.status === 'Pago').reduce((acc, item) => acc + Number(item.valor), 0) || 0;
      const faltaPagar = despesas?.filter(d => d.status !== 'Pago').reduce((acc, item) => acc + Number(item.valor), 0) || 0;
      
      const totalSaldos = saldosBancarios?.reduce((acc, item) => acc + Number(item.saldo), 0) || 0;
      const totalDividas = dividas?.reduce((acc, item) => acc + Number(item.valor_restante), 0) || 0;

      setData({
        receitas: totalReceitas,
        despesas: totalDespesas,
        totalPago,
        faltaPagar,
        saldo: totalSaldos,
        dividas: totalDividas,
      });

      // Status de pagamento
      setStatusPagamento({ pago: totalPago, pendente: faltaPagar });

      // Process receitas by category for pie chart
      const receitasByCategory = receitas?.reduce((acc: any, receita) => {
        const categoria = receita.categoria;
        acc[categoria] = (acc[categoria] || 0) + Number(receita.valor);
        return acc;
      }, {});

      const receitasChartData = Object.entries(receitasByCategory || {}).map(([category, value]: [string, any], index) => ({
        categoria: `(R) ${category}`,
        valor: value,
        fill: getCategoryColor(index)
      }));

      setReceitasChart(receitasChartData);

      // Process despesas by category for horizontal bar chart with percentages
      const despesasByCategory = despesas?.reduce((acc: any, despesa) => {
        const categoria = despesa.categoria;
        acc[categoria] = (acc[categoria] || 0) + Number(despesa.valor);
        return acc;
      }, {});

      const despesasChartData = Object.entries(despesasByCategory || {}).map(([category, value]: [string, any], index) => ({
        categoria: `(D) ${category}`,
        valor: Number(value),
        percentual: totalDespesas > 0 ? (Number(value) / totalDespesas) * 100 : 0,
        fill: getCategoryColor(index)
      })).sort((a, b) => b.valor - a.valor);

      setDespesasChart(despesasChartData);

      // Top expenses list
      const sortedDespesas = despesas?.sort((a, b) => Number(b.valor) - Number(a.valor)).slice(0, 15) || [];
      setPrincipaisDespesas(sortedDespesas.map(d => ({
        descricao: d.descricao,
        valor: Number(d.valor),
        categoria: d.categoria
      })));

      // Process monthly data
      const allReceitas = await supabase
        .from('receitas')
        .select('valor, mes_referencia')
        .eq('user_id', user.id);
      
      const allDespesas = await supabase
        .from('despesas')
        .select('valor, mes_referencia')
        .eq('user_id', user.id);

      const monthlyData: any = {};
      allReceitas.data?.forEach(receita => {
        const mes = receita.mes_referencia;
        if (!monthlyData[mes]) {
          monthlyData[mes] = { mes, receitas: 0, despesas: 0, saldo: 0 };
        }
        monthlyData[mes].receitas += Number(receita.valor);
      });

      allDespesas.data?.forEach(despesa => {
        const mes = despesa.mes_referencia;
        if (!monthlyData[mes]) {
          monthlyData[mes] = { mes, receitas: 0, despesas: 0, saldo: 0 };
        }
        monthlyData[mes].despesas += Number(despesa.valor);
      });

      Object.keys(monthlyData).forEach(mes => {
        monthlyData[mes].saldo = monthlyData[mes].receitas - monthlyData[mes].despesas;
      });

      const sortedMonthlyData = (Object.values(monthlyData) as MonthlyData[]).sort((a: MonthlyData, b: MonthlyData) => {
        const [monthA, yearA] = a.mes.split('/');
        const [monthB, yearB] = b.mes.split('/');
        const monthOrder = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
        const monthIndexA = monthOrder.indexOf(monthA);
        const monthIndexB = monthOrder.indexOf(monthB);
        if (yearA !== yearB) return yearA.localeCompare(yearB);
        return monthIndexA - monthIndexB;
      }).slice(-6);
      
      setMonthlyChart(sortedMonthlyData);

      // Cartao data
      const cartoesData = dividas?.filter(divida => divida.categoria === 'Cartão') || [];
      setCartaoData(cartoesData);

      // Dividas data (empréstimos)
      const emprestimosData = dividas?.filter(divida => divida.categoria !== 'Cartão') || [];
      setDividasData(emprestimosData);

      // Saldos bancários
      setSaldosBancariosData(saldosBancarios?.map(s => ({
        banco: s.banco,
        saldo: Number(s.saldo)
      })) || []);

    } catch (error) {
      console.error('Error fetching financial data:', error);
    }
  };

  const totalCartao = cartaoData.reduce((acc, c) => acc + Number(c.valor_restante), 0);
  const totalEmprestimos = dividasData.reduce((acc, d) => acc + Number(d.valor_restante), 0);

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white p-3 sm:p-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Meu Controle Financeiro
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <MonthFilter 
            onFilterChange={setSelectedMonth}
            selectedMonth={selectedMonth}
          />
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mb-4">
        {/* Total Receitas */}
        <Card className="bg-[#252541] border-[#3a3a5c] hover:border-green-500/50 transition-all">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-green-400 font-medium">Total Receitas</span>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </div>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-400">
              {formatCurrencyShort(data.receitas)}
            </div>
          </CardContent>
        </Card>

        {/* Total Despesas */}
        <Card className="bg-[#252541] border-[#3a3a5c] hover:border-red-500/50 transition-all">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-red-400 font-medium">Total Despesas</span>
              <TrendingDown className="h-4 w-4 text-red-400" />
            </div>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-red-400">
              {formatCurrencyShort(data.despesas)}
            </div>
          </CardContent>
        </Card>

        {/* Total Pago */}
        <Card className="bg-[#252541] border-[#3a3a5c] hover:border-orange-500/50 transition-all">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-orange-400 font-medium">Total Pago</span>
              <CheckCircle className="h-4 w-4 text-orange-400" />
            </div>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-400">
              {formatCurrencyShort(data.totalPago)}
            </div>
          </CardContent>
        </Card>

        {/* Falta Pagar */}
        <Card className="bg-[#252541] border-[#3a3a5c] hover:border-yellow-500/50 transition-all">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-yellow-400 font-medium">Falta Pagar</span>
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
            </div>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-400">
              {formatCurrencyShort(data.faltaPagar)}
            </div>
          </CardContent>
        </Card>

        {/* Saldo Atual */}
        <Card className="bg-[#252541] border-[#3a3a5c] hover:border-teal-500/50 transition-all col-span-2 sm:col-span-1">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-teal-400 font-medium">Saldo Atual</span>
              <DollarSign className="h-4 w-4 text-teal-400" />
            </div>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-teal-400">
              {formatCurrencyShort(data.saldo)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 mb-4">
        {/* Distribuição de Receitas - Pie Chart */}
        <Card className="lg:col-span-4 bg-[#252541] border-[#3a3a5c]">
          <CardHeader className="pb-2 p-3 sm:p-4">
            <CardTitle className="text-sm sm:text-base font-semibold text-white">
              Distribuição de Receitas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-4">
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={receitasChart}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={70}
                    innerRadius={30}
                    dataKey="valor"
                    label={({ categoria, percent }) => `${categoria} ${(percent * 100).toFixed(0)}%`}
                  >
                    {receitasChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => formatCurrency(Number(value))}
                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #3a3a5c' }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              {receitasChart.slice(0, 6).map((item, index) => (
                <div key={index} className="flex items-center gap-1 text-xs">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.fill }} />
                  <span className="text-gray-300">{item.categoria}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Distribuição de Despesas(%) - Horizontal Bar Chart */}
        <Card className="lg:col-span-4 bg-[#252541] border-[#3a3a5c]">
          <CardHeader className="pb-2 p-3 sm:p-4">
            <CardTitle className="text-sm sm:text-base font-semibold text-white">
              Distribuição de Despesas(%)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-4">
            <ScrollArea className="h-64 sm:h-72">
              <div className="space-y-2 pr-2">
                {despesasChart.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-xs text-gray-300 w-32 truncate">{item.categoria}</span>
                    <div className="flex-1 bg-[#1a1a2e] rounded-full h-4 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${item.percentual}%`,
                          backgroundColor: item.fill
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-14 text-right">
                      {item.percentual?.toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Status de Pagamento */}
        <Card className="lg:col-span-2 bg-[#252541] border-[#3a3a5c]">
          <CardHeader className="pb-2 p-3 sm:p-4">
            <CardTitle className="text-sm sm:text-base font-semibold text-white">
              Status de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-4">
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[statusPagamento]}
                  layout="vertical"
                  margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                >
                  <XAxis type="number" hide />
                  <YAxis type="category" hide />
                  <Tooltip 
                    formatter={(value: any) => formatCurrency(Number(value))}
                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #3a3a5c' }}
                  />
                  <Bar dataKey="pago" stackId="a" fill="#F59E0B" name="Pago" />
                  <Bar dataKey="pendente" stackId="a" fill="#EF4444" name="Pendente" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between text-xs mt-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-amber-500" />
                <span className="text-gray-300">{formatCurrencyShort(statusPagamento.pago)}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-red-500" />
                <span className="text-gray-300">{formatCurrencyShort(statusPagamento.pendente)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Principais Despesas (Vlr) */}
        <Card className="lg:col-span-2 bg-[#252541] border-[#3a3a5c]">
          <CardHeader className="pb-2 p-3 sm:p-4">
            <CardTitle className="text-sm sm:text-base font-semibold text-white">
              Principais Despesas(Vlr)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-4">
            <ScrollArea className="h-64 sm:h-72">
              <div className="space-y-1 pr-2">
                {principaisDespesas.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-1 border-b border-[#3a3a5c]/50">
                    <span className="text-xs text-gray-300 truncate max-w-[120px]">
                      {item.descricao}
                    </span>
                    <span className="text-xs font-medium text-orange-400">
                      {formatCurrencyShort(item.valor)}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Evolução Mensal */}
        <Card className="bg-[#252541] border-[#3a3a5c]">
          <CardHeader className="pb-2 p-3 sm:p-4">
            <CardTitle className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-teal-400" />
              Evolução Mensal
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-4">
            <div className="h-40 sm:h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyChart} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3a3a5c" />
                  <XAxis 
                    dataKey="mes" 
                    tick={{ fill: '#9ca3af', fontSize: 10 }} 
                    axisLine={{ stroke: '#3a3a5c' }}
                  />
                  <YAxis 
                    tick={{ fill: '#9ca3af', fontSize: 10 }} 
                    axisLine={{ stroke: '#3a3a5c' }}
                    tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                  />
                  <Tooltip 
                    formatter={(value: any) => formatCurrency(Number(value))}
                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #3a3a5c' }}
                  />
                  <Line type="monotone" dataKey="saldo" stroke="#14B8A6" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Cartão de Crédito */}
        <Card className="bg-[#252541] border-[#3a3a5c]">
          <CardHeader className="pb-2 p-3 sm:p-4">
            <CardTitle className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-red-400" />
              Cartão de Crédito
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-4">
            <div className="text-2xl sm:text-3xl font-bold text-red-400 mb-4">
              {formatCurrencyShort(totalCartao)}
            </div>
            <ScrollArea className="h-28 sm:h-32">
              <div className="space-y-2">
                {cartaoData.map((cartao, index) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span className="text-gray-300 truncate max-w-[100px]">{cartao.descricao}</span>
                    <span className="text-red-400">{formatCurrencyShort(Number(cartao.valor_restante))}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Empréstimos */}
        <Card className="bg-[#252541] border-[#3a3a5c]">
          <CardHeader className="pb-2 p-3 sm:p-4">
            <CardTitle className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
              <Receipt className="h-4 w-4 text-yellow-400" />
              Empréstimos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-4">
            <div className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-4">
              {formatCurrencyShort(totalEmprestimos)}
            </div>
            <ScrollArea className="h-28 sm:h-32">
              <div className="space-y-2">
                {dividasData.map((divida, index) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span className="text-gray-300 truncate max-w-[100px]">{divida.descricao}</span>
                    <span className="text-yellow-400">{formatCurrencyShort(Number(divida.valor_restante))}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Saldos Bancários */}
        <Card className="bg-[#252541] border-[#3a3a5c]">
          <CardHeader className="pb-2 p-3 sm:p-4">
            <CardTitle className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
              <Wallet className="h-4 w-4 text-teal-400" />
              Saldos Bancários
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-4">
            <div className="text-2xl sm:text-3xl font-bold text-teal-400 mb-4">
              {formatCurrencyShort(data.saldo)}
            </div>
            <ScrollArea className="h-28 sm:h-32">
              <div className="space-y-2">
                {saldosBancariosData.map((banco, index) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span className="text-gray-300 truncate max-w-[100px]">{banco.banco}</span>
                    <span className="text-teal-400">{formatCurrencyShort(banco.saldo)}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Footer Attribution */}
      <div className="text-center mt-4 text-xs text-gray-500">
        App criado por{" "}
        <a 
          href="https://www.linkedin.com/in/gillemosai/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:underline text-teal-400"
        >
          @gillemosai
        </a>
      </div>
    </div>
  );
}
