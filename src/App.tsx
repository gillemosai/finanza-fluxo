import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <Layout>
              <Dashboard />
            </Layout>
          } />
          <Route path="/receitas" element={
            <Layout>
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Receitas</h1>
                <p className="text-muted-foreground">Conecte ao Supabase para gerenciar suas receitas</p>
              </div>
            </Layout>
          } />
          <Route path="/despesas" element={
            <Layout>
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Despesas</h1>
                <p className="text-muted-foreground">Conecte ao Supabase para gerenciar suas despesas</p>
              </div>
            </Layout>
          } />
          <Route path="/dividas" element={
            <Layout>
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Dívidas</h1>
                <p className="text-muted-foreground">Conecte ao Supabase para gerenciar suas dívidas</p>
              </div>
            </Layout>
          } />
          <Route path="/relatorios" element={
            <Layout>
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Relatórios</h1>
                <p className="text-muted-foreground">Conecte ao Supabase para gerar relatórios</p>
              </div>
            </Layout>
          } />
          <Route path="/configuracoes" element={
            <Layout>
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Configurações</h1>
                <p className="text-muted-foreground">Configurações do sistema</p>
              </div>
            </Layout>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
