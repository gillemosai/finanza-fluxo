import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <main className="flex-1 flex flex-col">
          <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-card/50 backdrop-blur-sm">
            <SidebarTrigger className="lg:hidden" />
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-foreground">Controle Financeiro</h1>
            </div>
          </header>
          
          <div className="flex-1 p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}