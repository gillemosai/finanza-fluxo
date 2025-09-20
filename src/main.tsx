import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter } from "react-router-dom";
import { MenuLayoutProvider } from "@/hooks/useMenuLayout";
import App from "./App.tsx";
import "./index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MenuLayoutProvider>
        <TooltipProvider>
          <BrowserRouter>
            <App />
            <Toaster />
            <Sonner />
          </BrowserRouter>
        </TooltipProvider>
      </MenuLayoutProvider>
    </QueryClientProvider>
  </StrictMode>,
);
