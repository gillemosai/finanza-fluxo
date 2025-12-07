import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TopNavigation } from "@/components/TopNavigation";
import { useMenuLayout } from "@/hooks/useMenuLayout";
import { useViewMode } from "@/hooks/useViewMode";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { layout } = useMenuLayout();
  const { isMobileView } = useViewMode();

  if (layout === 'top') {
    return (
      <div className={cn(
        "h-screen flex flex-col w-full bg-background overflow-hidden",
        isMobileView && "max-w-md mx-auto border-x border-border"
      )}>
        <div className="flex-shrink-0 z-50">
          <TopNavigation />
        </div>
        <main 
          id="main-content" 
          className={cn(
            "flex-1 p-3 sm:p-6 overflow-y-auto overscroll-contain",
            isMobileView && "p-3"
          )}
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
      <div className={cn(
        "h-screen flex w-full bg-background overflow-hidden",
        isMobileView && "max-w-md mx-auto border-x border-border"
      )}>
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
              className={cn(isMobileView ? "block" : "lg:hidden")}
              aria-label="Abrir menu de navegação"
            />
            <h1 className="text-lg sm:text-xl font-semibold text-foreground">
              Controle Financeiro
            </h1>
          </header>
          
          <div className={cn(
            "flex-1 p-3 sm:p-6 overflow-y-auto overscroll-contain",
            isMobileView && "p-3"
          )}>
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
