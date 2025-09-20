import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  CreditCard,
  Settings,
  PieChart
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
  useSidebar,
  SidebarHeader,
} from "@/components/ui/sidebar";
import logo from "@/assets/logo.png";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Receitas", url: "/receitas", icon: TrendingUp },
  { title: "Despesas", url: "/despesas", icon: TrendingDown },
  { title: "Dívidas", url: "/dividas", icon: CreditCard },
  { title: "Relatórios", url: "/relatorios", icon: PieChart },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  const getNavClassName = (path: string) => {
    const active = isActive(path);
    return active 
      ? "bg-gradient-primary text-primary-foreground shadow-glow font-medium" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";
  };

  return (
    <Sidebar className={collapsed ? "w-20" : "w-64"}>
      <SidebarHeader className="p-6">
        <div className="flex items-center space-x-3">
          <img 
            src={logo} 
            alt="Logo Controle Financeiro" 
            className="w-10 h-10 rounded-lg shadow-glow"
          />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                FinanceAI
              </span>
              <span className="text-xs text-muted-foreground">
                Controle Inteligente
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground px-3">
            {!collapsed && "Menu Principal"}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="transition-all duration-300">
                    <NavLink 
                      to={item.url} 
                      className={`flex items-center space-x-3 p-3 rounded-lg ${getNavClassName(item.url)}`}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && (
                        <span className="font-medium">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}