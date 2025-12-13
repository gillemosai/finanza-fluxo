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
      <div className="h-screen flex flex-col w-full bg-background overflow-hidden">
        <div className="flex-shrink-0 z-50">
          <TopNavigation />
        </div>
        <main 
          id="main-content" 
          className="flex-1 p-3 sm:p-6 overflow-y-auto overscroll-contain"
          role="main"
          aria-label="Conteúdo principal"
        >
          {children}
        </main>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="h-screen flex w-full bg-background overflow-hidden">
        <AppSidebar />
        
        <main 
          id="main-content"
          className="flex-1 flex flex-col overflow-hidden"
          role="main"
          aria-label="Conteúdo principal"
        >
          <header 
            className="flex-shrink-0 h-14 sm:h-16 flex items-center justify-between px-3 sm:px-6 border-b border-border bg-card/50 backdrop-blur-sm z-50"
            role="banner"
          >
            <SidebarTrigger 
              className="lg:hidden"
              aria-label="Abrir menu de navegação"
            />
            <h1 className="text-lg sm:text-xl font-semibold text-foreground">
              Controle Financeiro
            </h1>
          </header>
          
          <div className="flex-1 p-3 sm:p-6 overflow-y-auto overscroll-contain">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
