import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { UserProvider, useUser } from "./contexts/UserContext";
import { useEffect } from "react";

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
import ApiDocs from "./pages/ApiDocs";
import GuardiansPage from "./pages/GuardiansPage";
import DiagnosticTool from "./pages/DiagnosticTool";
import AddStudentPage from "./pages/AddStudentPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

console.log('[APP] Initializing application');

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
              {/* Redirecionamento com base no tipo de usuário */}
              <Route path="/student-dashboard" element={<StudentDashboard />} />
              <Route path="/parent-dashboard" element={<ParentDashboard />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/student-map" element={<StudentMap />} />
              <Route path="/student-map/:id" element={<StudentMap />} />
              <Route path="/api-docs" element={<ApiDocs />} />
              <Route path="/guardians" element={<GuardiansPage />} />
              <Route path="/diagnostic" element={<DiagnosticTool />} />
              {/* Adiciona um Route Guard explícito para garantir que a página só seja acessível para pais/responsáveis */}
              <Route 
                path="/add-student" 
                element={
                  <RequireParentAuth>
                    <AddStudentPage />
                  </RequireParentAuth>
                } 
              />
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </UserProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

// Componente de proteção de rota para garantir que apenas pais possam acessar certas páginas
function RequireParentAuth({ children }: { children: JSX.Element }) {
  const { user, profile, loading } = useUser();
  const navigate = useNavigate();
  
  // Verifica se o usuário é um pai/responsável com múltiplas condições para garantir a robustez
  const isParent = 
    profile?.user_type === "parent" || 
    user?.user_metadata?.user_type === "parent" || 
    user?.user_type === "parent";
  
  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Usuário não está autenticado
        navigate("/login", { replace: true });
      } else if (!isParent) {
        // Usuário está autenticado mas não é um pai/responsável
        console.log("[AUTH] Acesso negado - usuário não é um responsável");
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, loading, navigate, isParent]);
  
  // Enquanto verifica autenticação, mostra um indicador de carregamento
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent" />
      </div>
    );
  }
  
  // Se o usuário é um pai/responsável, renderiza o componente protegido
  return isParent ? children : null;
}

export default App;
