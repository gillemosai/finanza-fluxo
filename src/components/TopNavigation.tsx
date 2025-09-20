import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  CreditCard,
  Settings,
  PieChart,
  LogOut,
  Building2,
  Wallet
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const menuItems = [
  {
    title: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Receitas",
    path: "/receitas",
    icon: TrendingUp,
  },
  {
    title: "Despesas",
    path: "/despesas",
    icon: TrendingDown,
  },
  {
    title: "Dívidas",
    path: "/dividas",
    icon: Wallet,
  },
  {
    title: "Cartões",
    path: "/cartoes",
    icon: CreditCard,
  },
  {
    title: "Saldos Bancários",
    path: "/saldos-bancarios",
    icon: Building2,
  },
  {
    title: "Relatórios",
    path: "/relatorios",
    icon: PieChart,
  },
  {
    title: "Configurações",
    path: "/configuracoes",
    icon: Settings,
  },
];

export function TopNavigation() {
  const { signOut, user } = useAuth();
  const location = useLocation();

  return (
    <TooltipProvider>
      <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="h-full flex items-center justify-between px-6">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <img 
              src="/src/assets/logo_transparente.png" 
              alt="Logo" 
              className="h-8 w-8" 
            />
            <h1 className="text-xl font-semibold text-foreground">Controle Financeiro</h1>
          </div>

          {/* Navigation Icons */}
          <nav className="flex items-center space-x-2">
            {menuItems.map((item) => (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>
                  <Button
                    variant={location.pathname === item.path ? "default" : "ghost"}
                    size="sm"
                    asChild
                    className="w-10 h-10 p-0"
                  >
                    <NavLink to={item.path}>
                      <item.icon className="w-4 h-4" />
                    </NavLink>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.title}</p>
                </TooltipContent>
              </Tooltip>
            ))}
            
            {/* User Actions */}
            <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-border">
              <span className="text-sm text-muted-foreground hidden md:block">
                {user?.email}
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => signOut()}
                    className="w-10 h-10 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sair</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </nav>
        </div>
      </header>
    </TooltipProvider>
  );
}