
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
import { UnifiedAuthProvider } from "./contexts/UnifiedAuthContext";
import { Toaster } from "./components/ui/toaster";

import "./index.css";
import "./styles/animations.css"; // Import our animations

// Create router with future flags enabled
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="*" element={
      <ThemeProvider>
        <UnifiedAuthProvider>
          <App />
        </UnifiedAuthProvider>
      </ThemeProvider>
    } />
  ),
  {
    // Enable supported React Router future flags
    future: {
      // Use only officially supported future flags
      v7_normalizeFormMethod: true
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
