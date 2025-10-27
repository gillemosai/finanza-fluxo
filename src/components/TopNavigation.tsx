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
import { ThemeToggle } from "@/components/ThemeToggle";

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
      <header className="h-14 sm:h-16 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="h-full flex items-center justify-between px-3 sm:px-6">
          {/* Navigation */}
          <div className="flex items-center space-x-2 sm:space-x-6">
            {/* Navigation Icons */}
            <nav className="flex items-center space-x-0.5 sm:space-x-1 overflow-x-auto">
              {menuItems.map((item) => (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={location.pathname === item.path ? "default" : "ghost"}
                      size="sm"
                      asChild
                      className="w-8 h-8 sm:w-10 sm:h-10 p-0 flex-shrink-0"
                    >
                      <NavLink to={item.path}>
                        <item.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                      </NavLink>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{item.title}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </nav>
          </div>
            
          {/* User Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <span className="text-xs sm:text-sm text-muted-foreground hidden lg:block max-w-[150px] truncate">
              {user?.email}
            </span>
            <ThemeToggle />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="w-8 h-8 sm:w-10 sm:h-10 p-0 text-muted-foreground hover:text-destructive flex-shrink-0"
                >
                  <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sair</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}