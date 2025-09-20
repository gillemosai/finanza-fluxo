import { 
  TrendingUp, 
  TrendingDown, 
  CreditCard,
  Wallet,
  Target,
  AlertTriangle,
  PieChart
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock data - será substituído por dados reais do Supabase
const mockData = {
  receitas: 8500.00,
  despesas: 6200.00,
  dividas: 15000.00,
  saldo: 2300.00,
  trends: {
    receitas: { value: "+12%", isPositive: true },
    despesas: { value: "+8%", isPositive: false },
    dividas: { value: "-5%", isPositive: true },
    saldo: { value: "+25%", isPositive: true },
  }
};

export default function Dashboard() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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
          value={formatCurrency(mockData.receitas)}
          icon={<TrendingUp className="w-5 h-5 text-success" />}
          trend={mockData.trends.receitas}
          className="border-l-4 border-l-success"
        />
        
        <StatCard
          title="Despesas"
          value={formatCurrency(mockData.despesas)}
          icon={<TrendingDown className="w-5 h-5 text-destructive" />}
          trend={mockData.trends.despesas}
          className="border-l-4 border-l-destructive"
        />
        
        <StatCard
          title="Dívidas"
          value={formatCurrency(mockData.dividas)}
          icon={<CreditCard className="w-5 h-5 text-warning" />}
          trend={mockData.trends.dividas}
          className="border-l-4 border-l-warning"
        />
        
        <StatCard
          title="Saldo"
          value={formatCurrency(mockData.saldo)}
          icon={<Wallet className="w-5 h-5 text-primary" />}
          trend={mockData.trends.saldo}
          className="border-l-4 border-l-primary"
        />
      </div>

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
              • Suas despesas aumentaram 8% em relação ao mês anterior
            </p>
            <p className="text-sm text-foreground">
              • Você tem 3 dívidas com vencimento nos próximos 30 dias
            </p>
            <p className="text-sm text-foreground">
              • Meta de economia: Faltam R$ 1.200 para atingir o objetivo mensal
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Área para gráficos - será implementada após conectar Supabase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-primary" />
              <span>Receitas vs Despesas</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">Gráficos serão exibidos após conectar o banco de dados</p>
              <p className="text-xs mt-2">Conecte ao Supabase para visualizar os dados</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-success" />
              <span>Evolução Mensal</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">Histórico de evolução financeira</p>
              <p className="text-xs mt-2">Conecte ao Supabase para visualizar tendências</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}