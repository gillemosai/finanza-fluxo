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
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
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

export function AppSidebar() {
  const { signOut, user } = useAuth();
  const location = useLocation();

  return (
    <Sidebar role="navigation" aria-label="Menu lateral">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel id="nav-label">Controle Financeiro</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu aria-labelledby="nav-label">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.path}
                  >
                    <NavLink 
                      to={item.path}
                      aria-current={location.pathname === item.path ? "page" : undefined}
                      aria-label={item.title}
                    >
                      <item.icon className="w-4 h-4" aria-hidden="true" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <div className="p-4 border-t" role="contentinfo">
        <div className="flex items-center justify-between mb-2">
          <div 
            className="text-sm text-muted-foreground truncate flex-1"
            aria-label={`Usuário conectado: ${user?.email}`}
          >
            {user?.email}
          </div>
          <div className="flex items-center gap-1" role="group" aria-label="Ações do usuário">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut()}
              className="text-muted-foreground hover:text-destructive"
              aria-label="Sair da conta"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}