import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TopNavigation } from "@/components/TopNavigation";
import { useMenuLayout } from "@/hooks/useMenuLayout";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { layout } = useMenuLayout();

  if (layout === 'top') {
    return (
      <div className="min-h-screen flex flex-col w-full bg-background">
        <TopNavigation />
        <main className="flex-1 p-3 sm:p-6">
          {children}
        </main>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <main className="flex-1 flex flex-col">
          <header className="h-14 sm:h-16 flex items-center justify-between px-3 sm:px-6 border-b border-border bg-card/50 backdrop-blur-sm">
            <SidebarTrigger className="lg:hidden" />
            <h1 className="text-lg sm:text-xl font-semibold text-foreground">Controle Financeiro</h1>
          </header>
          
          <div className="flex-1 p-3 sm:p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}