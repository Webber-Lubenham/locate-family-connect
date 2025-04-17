
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";

import AuthLayout from "./layouts/AuthLayout";
import AppLayout from "./layouts/AppLayout";

import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import StudentDashboard from "./pages/StudentDashboard";
import ParentDashboard from "./pages/ParentDashboard";
import ProfilePage from "./pages/ProfilePage";
import StudentMap from "./pages/StudentMap";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";
import RegisterConfirmation from "./components/RegisterConfirmation";
import Login from "./pages/Login";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <UserProvider>
          <Routes>
            {/* Auth routes */}
            <Route element={<AuthLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/register" element={<Register />} />
              <Route path="/register/confirm" element={<RegisterConfirmation />} />
              <Route path="/login" element={<Login />} />
            </Route>
            
            {/* App routes - require authentication */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/student-dashboard" element={<StudentDashboard />} />
              <Route path="/parent-dashboard" element={<ParentDashboard />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/student-map" element={<StudentMap />} />
              <Route path="/student-map/:id" element={<StudentMap />} />
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </UserProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
