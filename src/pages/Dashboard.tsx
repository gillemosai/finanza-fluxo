import { useEffect, useState } from "react";
import { MonthFilter } from "@/components/MonthFilter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Pie,
  Tooltip,
  Legend
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
  AlertTriangle,
  CheckCircle,
  Receipt,
  BarChart3
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
      '#8B5CF6', '#F59E0B', '#10B981', '#3B82F6', '#EF4444',
      '#EC4899', '#6366F1', '#14B8A6', '#F97316', '#84CC16',
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

      let receitasQuery = supabase
        .from('receitas')
        .select('valor, categoria, mes_referencia')
        .eq('user_id', user.id);
      
      if (selectedMonth) {
        receitasQuery = receitasQuery.eq('mes_referencia', selectedMonth);
      }
      
      const { data: receitas } = await receitasQuery;

      let despesasQuery = supabase
        .from('despesas')
        .select('valor, categoria, descricao, mes_referencia, status')
        .eq('user_id', user.id);
      
      if (selectedMonth) {
        despesasQuery = despesasQuery.eq('mes_referencia', selectedMonth);
      }
      
      const { data: despesas } = await despesasQuery;

      const { data: dividas } = await supabase
        .from('dividas')
        .select('valor_restante, valor_total, descricao, categoria')
        .eq('user_id', user.id);

      const { data: saldosBancarios } = await supabase
        .from('saldos_bancarios')
        .select('banco, saldo')
        .eq('user_id', user.id);

      const totalReceitas = receitas?.reduce((acc, item) => acc + Number(item.valor), 0) || 0;
      const totalDespesas = despesas?.reduce((acc, item) => acc + Number(item.valor), 0) || 0;
      const totalPago = despesas?.filter(d => d.status === 'paga').reduce((acc, item) => acc + Number(item.valor), 0) || 0;
      const faltaPagar = despesas?.filter(d => d.status !== 'paga').reduce((acc, item) => acc + Number(item.valor), 0) || 0;
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

      setStatusPagamento({ pago: totalPago, pendente: faltaPagar });

      const receitasByCategory = receitas?.reduce((acc: any, receita) => {
        const categoria = receita.categoria;
        acc[categoria] = (acc[categoria] || 0) + Number(receita.valor);
        return acc;
      }, {});

      const receitasChartData = Object.entries(receitasByCategory || {}).map(([category, value]: [string, any], index) => ({
        categoria: category,
        valor: value,
        fill: getCategoryColor(index)
      }));

      setReceitasChart(receitasChartData);

      const despesasByCategory = despesas?.reduce((acc: any, despesa) => {
        const categoria = despesa.categoria;
        acc[categoria] = (acc[categoria] || 0) + Number(despesa.valor);
        return acc;
      }, {});

      const despesasChartData = Object.entries(despesasByCategory || {}).map(([category, value]: [string, any], index) => ({
        categoria: category,
        valor: Number(value),
        percentual: totalDespesas > 0 ? (Number(value) / totalDespesas) * 100 : 0,
        fill: getCategoryColor(index)
      })).sort((a, b) => b.valor - a.valor);

      setDespesasChart(despesasChartData);

      const sortedDespesas = despesas?.sort((a, b) => Number(b.valor) - Number(a.valor)).slice(0, 10) || [];
      setPrincipaisDespesas(sortedDespesas.map(d => ({
        descricao: d.descricao,
        valor: Number(d.valor),
        categoria: d.categoria
      })));

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

      const cartoesData = dividas?.filter(divida => divida.categoria === 'Cartão') || [];
      setCartaoData(cartoesData);

      const emprestimosData = dividas?.filter(divida => divida.categoria !== 'Cartão') || [];
      setDividasData(emprestimosData);

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

  // KPI Card Component for consistency
  const KPICard = ({ 
    title, 
    value, 
    icon: Icon, 
    colorClass 
  }: { 
    title: string; 
    value: string; 
    icon: any; 
    colorClass: string;
  }) => (
    <Card className="bg-card border-border/50 hover:border-border transition-all duration-200 hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10`}>
            <Icon className={`h-5 w-5 ${colorClass.replace('bg-', 'text-')}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-medium truncate">{title}</p>
            <p className={`text-lg font-bold ${colorClass.replace('bg-', 'text-')} truncate`}>{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-primary" />
            Meu Controle Financeiro
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visão geral das suas finanças pessoais
          </p>
        </div>
        <MonthFilter 
          onFilterChange={setSelectedMonth}
          selectedMonth={selectedMonth}
        />
      </header>

      {/* KPI Cards */}
      <section aria-label="Indicadores financeiros">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          <KPICard 
            title="Total Receitas" 
            value={formatCurrencyShort(data.receitas)} 
            icon={TrendingUp} 
            colorClass="bg-emerald-500" 
          />
          <KPICard 
            title="Total Despesas" 
            value={formatCurrencyShort(data.despesas)} 
            icon={TrendingDown} 
            colorClass="bg-red-500" 
          />
          <KPICard 
            title="Total Pago" 
            value={formatCurrencyShort(data.totalPago)} 
            icon={CheckCircle} 
            colorClass="bg-amber-500" 
          />
          <KPICard 
            title="Falta Pagar" 
            value={formatCurrencyShort(data.faltaPagar)} 
            icon={AlertTriangle} 
            colorClass="bg-orange-500" 
          />
          <KPICard 
            title="Saldo Atual" 
            value={formatCurrencyShort(data.saldo)} 
            icon={DollarSign} 
            colorClass="bg-teal-500" 
          />
        </div>
      </section>

      {/* Charts Section */}
      <section aria-label="Gráficos de distribuição" className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {/* Distribuição de Receitas */}
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Distribuição de Receitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {receitasChart.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={receitasChart}
                      cx="50%"
                      cy="40%"
                      labelLine={true}
                      outerRadius={70}
                      innerRadius={35}
                      dataKey="valor"
                      nameKey="categoria"
                      label={({ categoria, percent }) => `${categoria}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {receitasChart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any, name: string) => [formatCurrency(Number(value)), name]}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      align="center"
                      layout="horizontal"
                      wrapperStyle={{ paddingTop: '16px' }}
                      formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  Nenhuma receita encontrada
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Distribuição de Despesas */}
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              Distribuição de Despesas (%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-56">
              <div className="space-y-3 pr-4">
                {despesasChart.length > 0 ? despesasChart.map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground truncate max-w-[60%]">{item.categoria}</span>
                      <span className="font-medium">{item.percentual?.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${item.percentual}%`,
                          backgroundColor: item.fill
                        }}
                      />
                    </div>
                  </div>
                )) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm py-20">
                    Nenhuma despesa encontrada
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Principais Despesas - Gráfico de Pizza */}
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Receipt className="h-4 w-4 text-amber-500" />
              Principais Despesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {principaisDespesas.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={principaisDespesas.slice(0, 5).map((item, index) => ({
                        ...item,
                        fill: `hsl(${35 + index * 15}, ${85 - index * 5}%, ${50 + index * 5}%)`
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="valor"
                      nameKey="descricao"
                    >
                      {principaisDespesas.slice(0, 5).map((_, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={`hsl(${35 + index * 15}, ${85 - index * 5}%, ${50 + index * 5}%)`}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [formatCurrencyShort(value), 'Valor']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                    />
                    <Legend 
                      layout="vertical"
                      align="right"
                      verticalAlign="middle"
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => (
                        <span className="text-xs text-foreground">
                          {value.length > 15 ? `${value.slice(0, 15)}...` : value}
                        </span>
                      )}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  Nenhuma despesa encontrada
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Evolution & Status Section */}
      <section aria-label="Evolução e status" className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Evolução Mensal */}
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Evolução Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {monthlyChart.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis 
                      dataKey="mes" 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} 
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} 
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                      tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                      width={50}
                    />
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        formatCurrency(Number(value)),
                        name === 'receitas' ? 'Receitas' : name === 'despesas' ? 'Despesas' : 'Saldo'
                      ]}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend 
                      formatter={(value) => (
                        <span className="text-xs">
                          {value === 'receitas' ? 'Receitas' : value === 'despesas' ? 'Despesas' : 'Saldo'}
                        </span>
                      )}
                    />
                    <Bar dataKey="receitas" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="despesas" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  Nenhum dado mensal disponível
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Status de Pagamento */}
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-amber-500" />
              Status de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex flex-col justify-center">
              <div className="space-y-6">
                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progresso de Pagamentos</span>
                    <span className="font-medium">
                      {data.despesas > 0 ? ((data.totalPago / data.despesas) * 100).toFixed(0) : 0}%
                    </span>
                  </div>
                  <div className="h-4 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-700"
                      style={{ width: `${data.despesas > 0 ? (data.totalPago / data.despesas) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-500/10 rounded-lg p-4 text-center">
                    <CheckCircle className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground mb-1">Pago</p>
                    <p className="text-lg font-bold text-emerald-500">{formatCurrencyShort(statusPagamento.pago)}</p>
                  </div>
                  <div className="bg-red-500/10 rounded-lg p-4 text-center">
                    <AlertTriangle className="h-6 w-6 text-red-500 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground mb-1">Pendente</p>
                    <p className="text-lg font-bold text-red-500">{formatCurrencyShort(statusPagamento.pendente)}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Bottom Cards */}
      <section aria-label="Detalhes financeiros" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Cartão de Crédito */}
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-red-500" />
              Cartão de Crédito
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-500 mb-4">{formatCurrencyShort(totalCartao)}</p>
            <ScrollArea className="h-32">
              <div className="space-y-2 pr-4">
                {cartaoData.length > 0 ? cartaoData.map((cartao, index) => (
                  <div key={index} className="flex justify-between text-sm py-1 border-b border-border/30 last:border-0">
                    <span className="text-muted-foreground truncate max-w-[60%]">{cartao.descricao}</span>
                    <span className="text-red-500 font-medium">{formatCurrencyShort(Number(cartao.valor_restante))}</span>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground text-center py-8">Nenhuma fatura</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Empréstimos */}
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Receipt className="h-4 w-4 text-amber-500" />
              Empréstimos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-500 mb-4">{formatCurrencyShort(totalEmprestimos)}</p>
            <ScrollArea className="h-32">
              <div className="space-y-2 pr-4">
                {dividasData.length > 0 ? dividasData.map((divida, index) => (
                  <div key={index} className="flex justify-between text-sm py-1 border-b border-border/30 last:border-0">
                    <span className="text-muted-foreground truncate max-w-[60%]">{divida.descricao}</span>
                    <span className="text-amber-500 font-medium">{formatCurrencyShort(Number(divida.valor_restante))}</span>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground text-center py-8">Nenhum empréstimo</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Saldos Bancários */}
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Wallet className="h-4 w-4 text-teal-500" />
              Saldos Bancários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-teal-500 mb-4">{formatCurrencyShort(data.saldo)}</p>
            <ScrollArea className="h-32">
              <div className="space-y-2 pr-4">
                {saldosBancariosData.length > 0 ? saldosBancariosData.map((banco, index) => (
                  <div key={index} className="flex justify-between text-sm py-1 border-b border-border/30 last:border-0">
                    <span className="text-muted-foreground truncate max-w-[60%]">{banco.banco}</span>
                    <span className="text-teal-500 font-medium">{formatCurrencyShort(banco.saldo)}</span>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground text-center py-8">Nenhuma conta</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Resumo Geral */}
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Resumo Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border/30">
                <span className="text-sm text-muted-foreground">Receitas</span>
                <span className="text-sm font-semibold text-emerald-500">+ {formatCurrencyShort(data.receitas)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/30">
                <span className="text-sm text-muted-foreground">Despesas</span>
                <span className="text-sm font-semibold text-red-500">- {formatCurrencyShort(data.despesas)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/30">
                <span className="text-sm text-muted-foreground">Dívidas</span>
                <span className="text-sm font-semibold text-amber-500">- {formatCurrencyShort(data.dividas)}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm font-medium">Balanço</span>
                <span className={`text-lg font-bold ${data.receitas - data.despesas >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {formatCurrencyShort(data.receitas - data.despesas)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="text-center pt-4 pb-2">
        <p className="text-xs text-muted-foreground">
          App criado por{" "}
          <a 
            href="https://www.linkedin.com/in/gillemosai/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline transition-colors"
          >
            @gillemosai
          </a>
        </p>
      </footer>
    </div>
  );
}
