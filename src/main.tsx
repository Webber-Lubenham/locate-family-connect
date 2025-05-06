
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/UnifiedAuthContext";
import { Toaster } from "./components/ui/toaster";

import "./styles/index.css";
import "./styles/animations.css"; // Import our animations

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
