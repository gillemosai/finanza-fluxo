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
    path: "/dashboard",
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
      <header 
        className="h-14 sm:h-16 border-b border-border bg-card/50 backdrop-blur-sm"
        role="banner"
      >
        <div className="h-full flex items-center justify-between px-2 sm:px-6 gap-2">
          {/* Navigation - Scrollable on mobile */}
          <div className="flex-1 min-w-0 overflow-hidden relative">
            <nav 
              className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-hide pb-1 -mb-1 pr-6 sm:pr-0"
              role="navigation"
              aria-label="Menu principal"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {menuItems.map((item) => (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={location.pathname === item.path ? "default" : "ghost"}
                      size="sm"
                      asChild
                      className="w-9 h-9 sm:w-10 sm:h-10 p-0 flex-shrink-0"
                      aria-current={location.pathname === item.path ? "page" : undefined}
                    >
                      <NavLink 
                        to={item.path}
                        aria-label={item.title}
                      >
                        <item.icon className="w-4 h-4" aria-hidden="true" />
                      </NavLink>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{item.title}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </nav>
            {/* Gradient indicator for more content */}
            <div 
              className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card/90 to-transparent pointer-events-none sm:hidden"
              aria-hidden="true"
            />
          </div>
            
          {/* User Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2" role="group" aria-label="Ações do usuário">
            <span 
              className="text-xs sm:text-sm text-muted-foreground hidden lg:block max-w-[150px] truncate"
              aria-label={`Usuário conectado: ${user?.email}`}
            >
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
                  aria-label="Sair da conta"
                >
                  <LogOut className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
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