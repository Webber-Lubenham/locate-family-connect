
import React from "react";
import ReactDOM from "react-dom/client";
import { 
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
    future: {
      // Type safety improved - these are valid flags but TypeScript definitions might be outdated
      v7_startTransition: true as any,
      v7_relativeSplatPath: true as any
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
