import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MenuLayoutProvider } from "@/hooks/useMenuLayout";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MenuLayoutProvider>
      <App />
    </MenuLayoutProvider>
  </StrictMode>,
);
