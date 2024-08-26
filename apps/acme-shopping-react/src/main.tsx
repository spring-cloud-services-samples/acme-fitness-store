import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import AppProvider from "./AppProvider.tsx";
import AppRoutes from "./Routes.tsx";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <AppProvider>
        <AppRoutes/>
      </AppProvider>
  </StrictMode>
)
