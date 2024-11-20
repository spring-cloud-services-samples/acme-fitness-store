import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AppRoutes from "./Routes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./styles/tailwind.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppRoutes />
    </QueryClientProvider>
  </StrictMode>
);
