import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Settings,
  PieChart,
  LogOut,
  Building2,
  Wallet,
  Target,
  Menu
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ThemeToggle";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { useState } from "react";

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
    title: "Metas",
    path: "/metas",
    icon: Target,
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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header
      className="h-14 sm:h-16 border-b border-border bg-card/50 backdrop-blur-sm"
      role="banner"
    >
      <div className="h-full flex items-center justify-between px-3 sm:px-6">
        {/* Mobile: Hamburger Menu */}
        <div className="flex items-center gap-3">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-10 h-10 p-0 md:hidden"
                aria-label="Abrir menu de navegação"
              >
                <Menu className="w-5 h-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <SheetHeader className="p-4 border-b border-border">
                <SheetTitle className="flex items-center gap-3">
                  <img
                    src="/logo cheia transp var01.png"
                    alt="Finanza"
                    className="h-8 w-auto object-contain"
                  />
                  <span>Controle Financeiro</span>
                </SheetTitle>
              </SheetHeader>
              
              <nav className="flex flex-col p-2" role="navigation" aria-label="Menu principal">
                {menuItems.map((item) => (
                  <SheetClose asChild key={item.path}>
                    <NavLink
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        location.pathname === item.path
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-muted"
                      }`}
                      aria-current={location.pathname === item.path ? "page" : undefined}
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="w-5 h-5" aria-hidden="true" />
                      <span className="font-medium">{item.title}</span>
                    </NavLink>
                  </SheetClose>
                ))}
              </nav>

              {/* User info and actions in drawer */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-background">
                <div className="text-sm text-muted-foreground truncate mb-3">
                  {user?.email}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <OfflineIndicator />
                    <ThemeToggle />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsOpen(false);
                      signOut();
                    }}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Sair da conta"
                  >
                    <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />
                    Sair
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo and Title */}
          <div className="flex items-center gap-2">
            <img
              src="/logo cheia transp var01.png"
              alt="Finanza"
              className="h-8 w-auto object-contain hidden sm:block"
            />
            <h1 className="text-base sm:text-lg font-semibold text-foreground">
              Controle Financeiro
            </h1>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav
          className="hidden md:flex items-center gap-1"
          role="navigation"
          aria-label="Menu principal"
        >
          {menuItems.map((item) => (
            <Button
              key={item.path}
              variant={location.pathname === item.path ? "default" : "ghost"}
              size="sm"
              asChild
              className="w-10 h-10 p-0"
              aria-current={location.pathname === item.path ? "page" : undefined}
            >
              <NavLink to={item.path} aria-label={item.title}>
                <item.icon className="w-4 h-4" aria-hidden="true" />
                <span className="sr-only">{item.title}</span>
              </NavLink>
            </Button>
          ))}
        </nav>

        {/* Desktop User Actions */}
        <div className="hidden md:flex items-center space-x-2" role="group" aria-label="Ações do usuário">
          <span
            className="text-sm text-muted-foreground max-w-[150px] truncate"
            aria-label={`Usuário conectado: ${user?.email}`}
          >
            {user?.email}
          </span>
          <OfflineIndicator />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut()}
            className="w-10 h-10 p-0 text-muted-foreground hover:text-destructive"
            aria-label="Sair da conta"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>

        {/* Mobile: Only theme toggle visible */}
        <div className="flex md:hidden items-center gap-1">
          <OfflineIndicator />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
