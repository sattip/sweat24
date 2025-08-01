import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { ThemeProvider } from "next-themes";
import './index.css'

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
    <App />
  </ThemeProvider>
);
