
import React from "react";
import ReactDOM from "react-dom/client";
import { 
  BrowserRouter, 
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route
} from "react-router-dom";
import App from "./App";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./lib/auth";
import { Toaster } from "./components/ui/toaster";

import "./index.css";
import "./styles/animations.css"; // Import our animations

// Create router with future flags enabled
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="*" element={
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    } />
  ),
  {
    // Enable React Router v7 future flags to address warnings
    // @ts-ignore - As flags v7_startTransition e v7_relativeSplatPath são suportadas pelo React Router, 
    // mas o TypeScript ainda não tem os tipos atualizados
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  </React.StrictMode>
);
