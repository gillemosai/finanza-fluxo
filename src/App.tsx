import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { GlobalMonthFilterProvider } from "@/hooks/useGlobalMonthFilter";
import { AccessibilityProvider } from "@/hooks/useAccessibility";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SkipLinks } from "@/components/SkipLinks";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Receitas from "./pages/Receitas";
import Despesas from "./pages/Despesas";
import Dividas from "./pages/Dividas";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import Cartoes from "./pages/Cartoes";
import SaldosBancarios from "./pages/SaldosBancarios";
import CaseStudy from "./pages/CaseStudy";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AccessibilityProvider>
        <AuthProvider>
          <GlobalMonthFilterProvider>
            <TooltipProvider>
              <SkipLinks />
              <Toaster />
              <Sonner />
              <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/receitas" element={
              <ProtectedRoute>
                <Layout>
                  <Receitas />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/despesas" element={
              <ProtectedRoute>
                <Layout>
                  <Despesas />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/dividas" element={
              <ProtectedRoute>
                <Layout>
                  <Dividas />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/cartoes" element={
              <ProtectedRoute>
                <Layout>
                  <Cartoes />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/saldos-bancarios" element={
              <ProtectedRoute>
                <Layout>
                  <SaldosBancarios />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/relatorios" element={
              <ProtectedRoute>
                <Layout>
                  <Relatorios />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/configuracoes" element={
              <ProtectedRoute>
                <Layout>
                  <Configuracoes />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/case-study" element={<CaseStudy />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </GlobalMonthFilterProvider>
        </AuthProvider>
      </AccessibilityProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;