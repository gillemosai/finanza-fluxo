import { useEffect, useState } from "react";
import { StatCard } from "@/components/StatCard";
import { DataImporter } from "@/components/DataImporter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
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
  Legend
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  TrendingUp, 
  TrendingDown, 
  CreditCard,
  Wallet,
  DollarSign,
  Calendar
} from "lucide-react";

interface FinancialData {
  receitas: number;
  despesas: number;
  dividas: number;
  saldo: number;
}

interface CategoryData {
  categoria: string;
  valor: number;
  fill: string;
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
    dividas: 0,
    saldo: 0,
  });
  
  const [receitasChart, setReceitasChart] = useState<CategoryData[]>([]);
  const [despesasChart, setDespesasChart] = useState<CategoryData[]>([]);
  const [monthlyChart, setMonthlyChart] = useState<MonthlyData[]>([]);
  const [cartaoData, setCartaoData] = useState<any[]>([]);
  
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
  }, [user]);

  const fetchFinancialData = async () => {
    try {
      if (!user) return;

      // Fetch receitas
      const { data: receitas } = await supabase
        .from('receitas')
        .select('valor, categoria, mes_referencia')
        .eq('user_id', user.id);

      // Fetch despesas
      const { data: despesas } = await supabase
        .from('despesas')
        .select('valor, categoria, mes_referencia')
        .eq('user_id', user.id);

      // Fetch dividas
      const { data: dividas } = await supabase
        .from('dividas')
        .select('valor_restante, descricao, categoria')
        .eq('user_id', user.id);

      const totalReceitas = receitas?.reduce((acc, item) => acc + Number(item.valor), 0) || 0;
      const totalDespesas = despesas?.reduce((acc, item) => acc + Number(item.valor), 0) || 0;
      const totalDividas = dividas?.reduce((acc, item) => acc + Number(item.valor_restante), 0) || 0;
      const saldo = totalReceitas - totalDespesas;

      setData({
        receitas: totalReceitas,
        despesas: totalDespesas,
        dividas: totalDividas,
        saldo: saldo,
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
        valor: value,
        fill: getCategoryColor(category, index)
      }));

      setDespesasChart(despesasChartData);

      // Process monthly data
      const monthlyData: any = {};
      receitas?.forEach(receita => {
        const mes = receita.mes_referencia;
        if (!monthlyData[mes]) {
          monthlyData[mes] = { mes, receitas: 0, despesas: 0, saldo: 0 };
        }
        monthlyData[mes].receitas += Number(receita.valor);
      });

      despesas?.forEach(despesa => {
        const mes = despesa.mes_referencia;
        if (!monthlyData[mes]) {
          monthlyData[mes] = { mes, receitas: 0, despesas: 0, saldo: 0 };
        }
        monthlyData[mes].despesas += Number(despesa.valor);
      });

      Object.keys(monthlyData).forEach(mes => {
        monthlyData[mes].saldo = monthlyData[mes].receitas - monthlyData[mes].despesas;
      });

      setMonthlyChart(Object.values(monthlyData));

      // Process cartao data
      const cartoesData = dividas?.filter(divida => divida.categoria === 'Cartão') || [];
      setCartaoData(cartoesData);

    } catch (error) {
      console.error('Error fetching financial data:', error);
    }
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
    <div className="space-y-6 p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>2024</span>
        </div>
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-orange-400 to-orange-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm font-medium">Receitas</span>
                </div>
                <div className="text-2xl font-bold">{formatCurrency(data.receitas)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingDown className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium text-muted-foreground">Despesas</span>
                </div>
                <div className="text-2xl font-bold text-foreground">{formatCurrency(data.despesas)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-muted-foreground">Saldo</span>
                </div>
                <div className="text-2xl font-bold text-foreground">{formatCurrency(data.saldo)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <CreditCard className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-medium text-muted-foreground">Gastos no cartão</span>
                </div>
                <div className="text-2xl font-bold text-foreground">{formatCurrency(cartaoData.reduce((acc, cartao) => acc + Number(cartao.valor_restante), 0))}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos principais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribuição das receitas */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Distribuição das receitas</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ChartContainer
              config={{
                valor: { label: "Valor", color: "hsl(var(--primary))" },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <RechartsPieChart data={receitasChart} cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                    {receitasChart.map((entry, index) => (
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
          </CardContent>
        </Card>

        {/* Distribuição dos gastos e receitas */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Distribuição dos gastos e receitas</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ChartContainer
              config={{
                valor: { label: "Valor", color: "hsl(var(--primary))" },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={despesasChart} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" fontSize={10} />
                  <YAxis 
                    dataKey="categoria" 
                    type="category"
                    fontSize={10}
                    width={80}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value: any) => [formatCurrency(Number(value)), "Valor"]}
                  />
                  <Bar dataKey="valor" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Gastos com Cartão de Crédito */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Gastos com Cartão de Crédito</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Visual do cartão */}
              <div className="bg-gradient-to-r from-gray-700 to-gray-900 rounded-lg p-4 text-white h-24 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xs opacity-70">••••  ••••  ••••  2500</div>
                  <div className="text-sm font-medium mt-1">Cartão Principal</div>
                </div>
              </div>
              
              {/* Dados dos cartões */}
              <div className="space-y-2">
                {cartaoData.map((cartao, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{cartao.descricao}</span>
                    <span className="font-medium text-foreground">{formatCurrency(Number(cartao.valor_restante))}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos inferiores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução Receitas x Despesas x Saldo */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Evolução Receitas x Despesas x Saldo ao longo dos meses</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ChartContainer
              config={{
                receitas: { label: "Receitas", color: "hsl(var(--success))" },
                despesas: { label: "Despesas", color: "hsl(var(--destructive))" },
                saldo: { label: "Saldo", color: "hsl(var(--primary))" },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" fontSize={12} />
                  <YAxis fontSize={12} />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value: any) => [formatCurrency(Number(value)), ""]}
                  />
                  <Legend />
                  <Bar 
                    dataKey="receitas" 
                    fill="hsl(var(--success))" 
                    name="Receitas"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar 
                    dataKey="despesas" 
                    fill="hsl(var(--destructive))" 
                    name="Despesas"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar 
                    dataKey="saldo" 
                    fill="hsl(var(--primary))" 
                    name="Saldo"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Saldo dos Bancos */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Saldo dos Bancos</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <div className="space-y-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-foreground">{formatCurrency(data.saldo)}</div>
                <div className="text-sm text-muted-foreground">Saldo Total</div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">BB</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-orange-200 h-8 flex items-center justify-center rounded text-xs font-medium">
                      163
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Bradesco</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-orange-200 h-8 flex items-center justify-center rounded text-xs font-medium">
                      152
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Itaú</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-orange-200 h-8 flex items-center justify-center rounded text-xs font-medium">
                      117
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}