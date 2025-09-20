import { useEffect, useState } from "react";
import { StatCard } from "@/components/StatCard";
import { DataImporter } from "@/components/DataImporter";
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
  Pie
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
  ArrowDownIcon
} from "lucide-react";

interface FinancialData {
  receitas: number;
  despesas: number;
  dividas: number;
  saldo: number;
  economia: number;
  taxaEconomia: number;
  gastosVariaveis: number;
  gastosFixos: number;
}

interface CategoryData {
  categoria: string;
  valor: number;
  fill: string;
  percentual?: number;
}

interface MonthlyData {
  mes: string;
  receitas: number;
  despesas: number;
  saldo: number;
  economia: number;
}

interface TrendData {
  periodo: string;
  valor: number;
  tipo: 'receita' | 'despesa';
}

export default function Dashboard() {
  const [data, setData] = useState<FinancialData>({
    receitas: 0,
    despesas: 0,
    dividas: 0,
    saldo: 0,
    economia: 0,
    taxaEconomia: 0,
    gastosVariaveis: 0,
    gastosFixos: 0,
  });
  
  const [receitasChart, setReceitasChart] = useState<CategoryData[]>([]);
  const [despesasChart, setDespesasChart] = useState<CategoryData[]>([]);
  const [monthlyChart, setMonthlyChart] = useState<MonthlyData[]>([]);
  const [cartaoData, setCartaoData] = useState<any[]>([]);
  const [saldosBancariosData, setSaldosBancariosData] = useState<any[]>([]);
  const [previousMonthData, setPreviousMonthData] = useState<FinancialData>({
    receitas: 0,
    despesas: 0,
    dividas: 0,
    saldo: 0,
    economia: 0,
    taxaEconomia: 0,
    gastosVariaveis: 0,
    gastosFixos: 0,
  });
  // Use global month filter instead of local state
  const { selectedMonth, setSelectedMonth } = useGlobalMonthFilter();
  
  const { user } = useAuth();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getCategoryColor = (category: string, index: number) => {
    const colors = [
      'hsl(var(--primary))',
      'hsl(var(--secondary))', 
      'hsl(var(--accent))',
      'hsl(var(--success))',
      'hsl(var(--warning))',
      'hsl(var(--destructive))',
      'hsl(var(--info))',
      'hsl(220, 70%, 50%)',
      'hsl(280, 70%, 50%)',
      'hsl(320, 70%, 50%)'
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

      // Fetch despesas
      let despesasQuery = supabase
        .from('despesas')
        .select('valor, categoria, mes_referencia')
        .eq('user_id', user.id);
      
      if (selectedMonth) {
        despesasQuery = despesasQuery.eq('mes_referencia', selectedMonth);
      }
      
      const { data: despesas } = await despesasQuery;

      // Fetch dividas
      const { data: dividas } = await supabase
        .from('dividas')
        .select('valor_restante, descricao, categoria')
        .eq('user_id', user.id);

      // Fetch saldos bancários
      const { data: saldosBancarios } = await supabase
        .from('saldos_bancarios')
        .select('banco, saldo')
        .eq('user_id', user.id);

      const totalReceitas = receitas?.reduce((acc, item) => acc + Number(item.valor), 0) || 0;
      const totalDespesas = despesas?.reduce((acc, item) => acc + Number(item.valor), 0) || 0;
      const totalDividas = dividas?.reduce((acc, item) => acc + Number(item.valor_restante), 0) || 0;
      const saldo = totalReceitas - totalDespesas;
      const economia = saldo > 0 ? saldo : 0;
      const taxaEconomia = totalReceitas > 0 ? (economia / totalReceitas) * 100 : 0;

      // Classify expenses as fixed/variable
      const gastosFixos = despesas?.filter(d => 
        ['Moradia', 'Internet', 'Assinaturas'].includes(d.categoria)
      ).reduce((acc, item) => acc + Number(item.valor), 0) || 0;
      
      const gastosVariaveis = totalDespesas - gastosFixos;

      setData({
        receitas: totalReceitas,
        despesas: totalDespesas,
        dividas: totalDividas,
        saldo: saldo,
        economia: economia,
        taxaEconomia: taxaEconomia,
        gastosFixos: gastosFixos,
        gastosVariaveis: gastosVariaveis,
      });

      // Process receitas by category
      const receitasByCategory = receitas?.reduce((acc: any, receita) => {
        const categoria = receita.categoria;
        acc[categoria] = (acc[categoria] || 0) + Number(receita.valor);
        return acc;
      }, {});

      const receitasChartData = Object.entries(receitasByCategory || {}).map(([category, value]: [string, any], index) => ({
        categoria: category,
        valor: value,
        fill: getCategoryColor(category, index)
      }));

      setReceitasChart(receitasChartData);

      // Process despesas by category
      const despesasByCategory = despesas?.reduce((acc: any, despesa) => {
        const categoria = despesa.categoria;
        acc[categoria] = (acc[categoria] || 0) + Number(despesa.valor);
        return acc;
      }, {});

      const despesasChartData = Object.entries(despesasByCategory || {}).map(([category, value]: [string, any], index) => ({
        categoria: category,
        valor: Number(value),
        fill: getCategoryColor(category, index)
      }));

      setDespesasChart(despesasChartData);

      // Process monthly data with enhanced metrics
      const monthlyData: any = {};
      receitas?.forEach(receita => {
        const mes = receita.mes_referencia;
        if (!monthlyData[mes]) {
          monthlyData[mes] = { mes, receitas: 0, despesas: 0, saldo: 0, economia: 0 };
        }
        monthlyData[mes].receitas += Number(receita.valor);
      });

      despesas?.forEach(despesa => {
        const mes = despesa.mes_referencia;
        if (!monthlyData[mes]) {
          monthlyData[mes] = { mes, receitas: 0, despesas: 0, saldo: 0, economia: 0 };
        }
        monthlyData[mes].despesas += Number(despesa.valor);
      });

      Object.keys(monthlyData).forEach(mes => {
        monthlyData[mes].saldo = monthlyData[mes].receitas - monthlyData[mes].despesas;
        monthlyData[mes].economia = monthlyData[mes].saldo > 0 ? monthlyData[mes].saldo : 0;
      });

      // Sort monthly data by month in chronological order (JUL/25 → AGO/25 → SET/25)
      const sortedMonthlyData = (Object.values(monthlyData) as MonthlyData[]).sort((a: MonthlyData, b: MonthlyData) => {
        // Convert month format (SET/25) to a sortable format
        const [monthA, yearA] = a.mes.split('/');
        const [monthB, yearB] = b.mes.split('/');
        
        const monthOrder = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
        const monthIndexA = monthOrder.indexOf(monthA);
        const monthIndexB = monthOrder.indexOf(monthB);
        
        // First sort by year, then by month
        if (yearA !== yearB) {
          return yearA.localeCompare(yearB);
        }
        return monthIndexA - monthIndexB;
      });
      
      setMonthlyChart(sortedMonthlyData);

      // Process cartao data
      const cartoesData = dividas?.filter(divida => divida.categoria === 'Cartão') || [];
      setCartaoData(cartoesData);

      // Process saldos bancários data for dashboard display
      const saldosBancariosFormatted = saldosBancarios?.map(saldo => ({
        banco: saldo.banco,
        saldo: Number(saldo.saldo)
      })) || [];

      // Update the hardcoded bank data with real data
      setSaldosBancariosData(saldosBancariosFormatted);

    } catch (error) {
      console.error('Error fetching financial data:', error);
    }
  };

  // Helper functions for trend calculations
  const getTrend = (current: number, previous: number) => {
    if (previous === 0) return { value: "Novo", isPositive: true };
    const percentChange = ((current - previous) / previous) * 100;
    return {
      value: `${Math.abs(percentChange).toFixed(1)}%`,
      isPositive: percentChange >= 0
    };
  };

  // Show import component if no data exists
  if (data.receitas === 0 && data.despesas === 0 && data.dividas === 0) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
        <DataImporter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-accent/5 p-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Dashboard Financeiro
          </h1>
          <p className="text-muted-foreground mt-2">
            Visão geral das suas finanças pessoais
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="text-sm">
            {selectedMonth ? `Filtro: ${selectedMonth}` : 'Todos os períodos'}
          </Badge>
          <MonthFilter 
            onFilterChange={setSelectedMonth}
            selectedMonth={selectedMonth}
          />
        </div>
      </div>

      {/* KPIs Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-8">
        <StatCard
          title="Receitas Totais"
          value={formatCurrency(data.receitas)}
          icon={<TrendingUp className="h-5 w-5 text-success" />}
          trend={getTrend(data.receitas, previousMonthData.receitas)}
          className="hover-scale bg-gradient-to-r from-success/10 to-success/5 border-success/20"
        />
        
        <StatCard
          title="Despesas Totais"
          value={formatCurrency(data.despesas)}
          icon={<TrendingDown className="h-5 w-5 text-destructive" />}
          trend={getTrend(data.despesas, previousMonthData.despesas)}
          className="hover-scale bg-gradient-to-r from-destructive/10 to-destructive/5 border-destructive/20"
        />
        
        <StatCard
          title="Saldo Líquido"
          value={formatCurrency(data.saldo)}
          icon={<Wallet className="h-5 w-5 text-primary" />}
          trend={getTrend(data.saldo, previousMonthData.saldo)}
          className="hover-scale bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20"
        />
        
        <StatCard
          title="Taxa de Economia"
          value={`${data.taxaEconomia.toFixed(1)}%`}
          icon={<PiggyBank className="h-5 w-5 text-warning" />}
          trend={getTrend(data.taxaEconomia, previousMonthData.taxaEconomia)}
          className="hover-scale bg-gradient-to-r from-warning/10 to-warning/5 border-warning/20"
        />
        
        <StatCard
          title="Gastos Fixos"
          value={formatCurrency(data.gastosFixos)}
          icon={<Target className="h-5 w-5 text-info" />}
          className="hover-scale bg-gradient-to-r from-info/10 to-info/5 border-info/20"
        />
        
        <StatCard
          title="Dívidas Pendentes"
          value={formatCurrency(data.dividas)}
          icon={<AlertTriangle className="h-5 w-5 text-destructive" />}
          className="hover-scale bg-gradient-to-r from-destructive/10 to-destructive/5 border-destructive/20"
        />
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {/* Income Distribution */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-glow transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              Distribuição de Receitas
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <ChartContainer
              config={{
                valor: { label: "Valor", color: "hsl(var(--success))" },
              }}
              className="h-full w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie 
                    data={receitasChart} 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={80} 
                    innerRadius={40}
                    dataKey="valor"
                    label={({ categoria, percent }) => `${categoria} ${(percent * 100).toFixed(1)}%`}
                    labelLine={false}
                  >
                    {receitasChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value: any) => [formatCurrency(Number(value)), "Valor"]}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Expense Distribution */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-glow transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-destructive" />
              Distribuição de Despesas
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <ChartContainer
              config={{
                valor: { label: "Valor", color: "hsl(var(--destructive))" },
              }}
              className="h-full w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie 
                    data={despesasChart} 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={80} 
                    innerRadius={40}
                    dataKey="valor"
                    label={({ categoria, percent }) => `${categoria} ${(percent * 100).toFixed(1)}%`}
                    labelLine={false}
                  >
                    {despesasChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value: any) => [formatCurrency(Number(value)), "Valor"]}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Credit Card Summary */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-glow transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-warning" />
              Resumo Cartões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Credit Card Visual */}
              <div className="bg-gradient-to-r from-gray-700 to-gray-900 rounded-xl p-4 text-white h-20 flex items-center justify-center shadow-lg">
                <div className="text-center">
                  <div className="text-xs opacity-70">••••  ••••  ••••  2500</div>
                  <div className="text-sm font-medium mt-1">Total: {formatCurrency(cartaoData.reduce((acc, cartao) => acc + Number(cartao.valor_restante), 0))}</div>
                </div>
              </div>
              
              {/* Card Details */}
              <div className="space-y-3 max-h-32 overflow-y-auto">
                {cartaoData.map((cartao, index) => (
                  <div key={index} className="flex justify-between items-center text-sm p-2 rounded-lg bg-accent/10">
                    <span className="text-muted-foreground font-medium">{cartao.descricao}</span>
                    <Badge variant="outline" className="font-semibold">
                      {formatCurrency(Number(cartao.valor_restante))}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trends Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Evolution */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-glow transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <ArrowUpIcon className="h-5 w-5 text-primary" />
              Evolução Mensal
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ChartContainer
              config={{
                receitas: { label: "Receitas", color: "hsl(var(--success))" },
                despesas: { label: "Despesas", color: "hsl(var(--destructive))" },
                economia: { label: "Economia", color: "hsl(var(--primary))" },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyChart} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="mes" 
                    fontSize={10}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis 
                    fontSize={10}
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={(value) => `R$ ${(value/1000).toFixed(1)}k`}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value: any) => [formatCurrency(Number(value)), ""]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="receitas"
                    stroke="hsl(var(--success))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--success))", r: 4 }}
                    name="Receitas"
                  />
                  <Line
                    type="monotone"
                    dataKey="despesas"
                    stroke="hsl(var(--destructive))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--destructive))", r: 4 }}
                    name="Despesas"
                  />
                  <Line
                    type="monotone"
                    dataKey="economia"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                    name="Economia"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Bank Balances */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-glow transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Wallet className="h-5 w-5 text-info" />
              Saldos Bancários
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <div className="space-y-6">
              <div className="text-center p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20">
                <div className="text-3xl font-bold text-primary mb-2">
                  {formatCurrency(data.saldo)}
                </div>
                <div className="text-sm text-muted-foreground">Saldo Total Disponível</div>
              </div>
              
              <div className="space-y-4 max-h-48 overflow-y-auto">
                {saldosBancariosData.length > 0 ? (
                  saldosBancariosData.map((banco, index) => (
                    <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-accent/10 hover:bg-accent/20 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Wallet className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-medium text-foreground">{banco.banco}</span>
                      </div>
                      <Badge variant="secondary" className="font-semibold">
                        {formatCurrency(banco.saldo)}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma conta bancária cadastrada</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}