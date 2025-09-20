import { 
  TrendingUp, 
  TrendingDown, 
  CreditCard,
  Wallet,
  Target,
  AlertTriangle,
  PieChart,
  Users
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart as RechartsPieChart, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface FinancialData {
  receitas: number;
  despesas: number;
  dividas: number;
  saldo: number;
  trends: {
    receitas: { value: string; isPositive: boolean };
    despesas: { value: string; isPositive: boolean };
    dividas: { value: string; isPositive: boolean };
    saldo: { value: string; isPositive: boolean };
  };
}

export default function Dashboard() {
  const [data, setData] = useState<FinancialData>({
    receitas: 0,
    despesas: 0,
    dividas: 0,
    saldo: 0,
    trends: {
      receitas: { value: "0%", isPositive: true },
      despesas: { value: "0%", isPositive: true },
      dividas: { value: "0%", isPositive: true },
      saldo: { value: "0%", isPositive: true },
    }
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [expensesByCategory, setExpensesByCategory] = useState<any[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  useEffect(() => {
    // Check auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      if (session) {
        fetchFinancialData();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (session) {
        fetchFinancialData();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchFinancialData = async () => {
    try {
      // Fetch receitas
      const { data: receitas, error: receitasError } = await supabase
        .from('receitas')
        .select('valor')
        .eq('user_id', '00000000-0000-0000-0000-000000000000'); // Demo user ID

      if (receitasError) throw receitasError;

      // Fetch despesas
      const { data: despesas, error: despesasError } = await supabase
        .from('despesas')
        .select('valor, categoria')
        .eq('user_id', '00000000-0000-0000-0000-000000000000');

      if (despesasError) throw despesasError;

      // Fetch dividas
      const { data: dividas, error: dividasError } = await supabase
        .from('dividas')
        .select('valor_restante')
        .eq('user_id', '00000000-0000-0000-0000-000000000000');

      if (dividasError) throw dividasError;

      const totalReceitas = receitas?.reduce((acc, item) => acc + Number(item.valor), 0) || 0;
      const totalDespesas = despesas?.reduce((acc, item) => acc + Number(item.valor), 0) || 0;
      const totalDividas = dividas?.reduce((acc, item) => acc + Number(item.valor_restante), 0) || 0;
      const saldo = totalReceitas - totalDespesas;

      // Process expenses by category
      const expenseCategories = despesas?.reduce((acc: any, expense) => {
        const categoria = expense.categoria;
        acc[categoria] = (acc[categoria] || 0) + Number(expense.valor);
        return acc;
      }, {});

      const expensesChart = Object.entries(expenseCategories || {}).map(([category, value]: [string, any]) => ({
        categoria: category,
        valor: value,
        fill: getColorForCategory(category)
      }));

      setExpensesByCategory(expensesChart);

      // Set chart data for receitas vs despesas
      setChartData([
        { name: 'Receitas', value: totalReceitas, fill: 'hsl(var(--success))' },
        { name: 'Despesas', value: totalDespesas, fill: 'hsl(var(--destructive))' }
      ]);

      setData({
        receitas: totalReceitas,
        despesas: totalDespesas,
        dividas: totalDividas,
        saldo: saldo,
        trends: {
          receitas: { value: "+12%", isPositive: true },
          despesas: { value: "+8%", isPositive: false },
          dividas: { value: "-5%", isPositive: true },
          saldo: { value: saldo > 0 ? "+25%" : "-15%", isPositive: saldo > 0 },
        }
      });

    } catch (error) {
      console.error('Error fetching financial data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados financeiros",
        variant: "destructive",
      });
    }
  };

  const getColorForCategory = (category: string) => {
    const colors = {
      'Moradia': 'hsl(var(--primary))',
      'Alimentação': 'hsl(var(--success))',
      'Transporte': 'hsl(var(--warning))',
      'Utilidades': 'hsl(var(--info))',
      'Saúde': 'hsl(var(--destructive))',
      'Lazer': 'hsl(var(--accent))'
    };
    return colors[category as keyof typeof colors] || 'hsl(var(--muted))';
  };

  return (
    <div className="space-y-6">
      {/* Header com resumo */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Dashboard Financeiro
        </h1>
        <p className="text-muted-foreground">
          Visão geral da sua situação financeira atual
        </p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Receitas"
          value={formatCurrency(data.receitas)}
          icon={<TrendingUp className="w-5 h-5 text-success" />}
          trend={data.trends.receitas}
          className="border-l-4 border-l-success"
        />
        
        <StatCard
          title="Despesas"
          value={formatCurrency(data.despesas)}
          icon={<TrendingDown className="w-5 h-5 text-destructive" />}
          trend={data.trends.despesas}
          className="border-l-4 border-l-destructive"
        />
        
        <StatCard
          title="Dívidas"
          value={formatCurrency(data.dividas)}
          icon={<CreditCard className="w-5 h-5 text-warning" />}
          trend={data.trends.dividas}
          className="border-l-4 border-l-warning"
        />
        
        <StatCard
          title="Saldo"
          value={formatCurrency(data.saldo)}
          icon={<Wallet className="w-5 h-5 text-primary" />}
          trend={data.trends.saldo}
          className="border-l-4 border-l-primary"
        />
      </div>

      {/* Authentication Warning */}
      {!isAuthenticated && (
        <Card className="shadow-card border-0 bg-gradient-info/5 border-l-4 border-l-info">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-info">
              <Users className="w-5 h-5" />
              <span>Autenticação Necessária</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground">
              Para visualizar seus dados financeiros reais, você precisa implementar autenticação. 
              Os dados mostrados são apenas demonstrativos.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Alertas e notificações */}
      <Card className="shadow-card border-0 bg-gradient-warning/5 border-l-4 border-l-warning">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-warning">
            <AlertTriangle className="w-5 h-5" />
            <span>Alertas Importantes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-foreground">
              • Suas despesas aumentaram {Math.abs(Number(data.trends.despesas.value.replace('%', '')))}% em relação ao mês anterior
            </p>
            <p className="text-sm text-foreground">
              • Saldo atual: {data.saldo >= 0 ? 'Positivo' : 'Negativo'} de {formatCurrency(Math.abs(data.saldo))}
            </p>
            <p className="text-sm text-foreground">
              • Total de dívidas pendentes: {formatCurrency(data.dividas)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos Interativos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-primary" />
              <span>Receitas vs Despesas</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {chartData.length > 0 ? (
              <ChartContainer
                config={{
                  receitas: { label: "Receitas", color: "hsl(var(--success))" },
                  despesas: { label: "Despesas", color: "hsl(var(--destructive))" },
                }}
                className="h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <RechartsPieChart data={chartData} cx="50%" cy="50%" outerRadius={80}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </RechartsPieChart>
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      formatter={(value: any) => [formatCurrency(Number(value)), ""]}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                <div>
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Carregando dados financeiros...</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-success" />
              <span>Despesas por Categoria</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {expensesByCategory.length > 0 ? (
              <ChartContainer
                config={{
                  valor: { label: "Valor", color: "hsl(var(--primary))" },
                }}
                className="h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={expensesByCategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="categoria" 
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis fontSize={12} />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      formatter={(value: any) => [formatCurrency(Number(value)), "Valor"]}
                    />
                    <Bar dataKey="valor" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                <div>
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Carregando categorias de despesas...</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}