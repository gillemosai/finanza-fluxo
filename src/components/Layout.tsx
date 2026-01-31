import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TopNavigation } from "@/components/TopNavigation";
import { useMenuLayout } from "@/hooks/useMenuLayout";
import pkg from "../../package.json";

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
        <footer className="flex-shrink-0 py-2 px-4 border-t border-border bg-card/30 text-center text-xs text-muted-foreground">
          <span>V{pkg.version.split('.').slice(1, 2).join('')}</span>
          <span className="mx-2">•</span>
          <span>Copyright © Gil Lemos | @gillemosai</span>
        </footer>
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
            <div className="flex items-center gap-3">
              <SidebarTrigger
                className="lg:hidden"
                aria-label="Abrir menu de navegação"
              />
              <img
                src="/logo cheia transp var01.png"
                alt="Finanza"
                className="h-8 w-auto object-contain hidden sm:block"
              />
              <h1 className="text-lg sm:text-xl font-semibold text-foreground">
                Controle Financeiro
              </h1>
            </div>
          </header>

          <div className="flex-1 p-3 sm:p-6 overflow-y-auto overscroll-contain">
            {children}
          </div>

          <footer className="flex-shrink-0 py-2 px-4 border-t border-border bg-card/30 text-center text-xs text-muted-foreground">
            <span>V{pkg.version.split('.').slice(1, 2).join('')}</span>
            <span className="mx-2">•</span>
            <span>Copyright © Gil Lemos | @gillemosai</span>
          </footer>
        </main>
      </div>
    </SidebarProvider>
  );
}
