import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider, useUser } from "./contexts/UserContext";
import { Suspense, lazy, useEffect } from "react";
import { AddStudent } from './pages/AddStudent';

// Layouts
import AuthLayout from "./layouts/AuthLayout";
import AppLayout from "./layouts/AppLayout";

// Auth Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RegisterConfirmation from "./components/RegisterConfirmation";

// Protected Pages
import Dashboard from "./pages/Dashboard";
import StudentDashboard from "./pages/StudentDashboard";
import ParentDashboard from "./pages/ParentDashboard";
import ProfilePage from "./pages/ProfilePage";
import StudentMap from "./pages/StudentMap";
import GuardiansPage from "./pages/GuardiansPage";
import NotFound from "./pages/NotFound";
import ApiDocs from "./pages/ApiDocs";
import DiagnosticTool from "./pages/DiagnosticTool";
import AddStudentPage from "./pages/AddStudentPage";

// Create a more robust query client with proper error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      meta: {
        onError: (error: Error) => {
          console.error('API Query Error:', error);
        },
      },
    },
  },
});

console.log('[APP] Initializing application');

// Route guard component
const RequireAuth = ({ children, requiredRole = null }) => {
  const { user, loading } = useUser();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user.user_type !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ 
        v7_startTransition: true,
        v7_relativeSplatPath: true 
      }}>
        <UserProvider>
          <Routes>
            {/* Public routes */}
            <Route element={<AuthLayout />}>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/register" element={<Register />} />
              <Route path="/register/confirm" element={<RegisterConfirmation />} />
              <Route path="/login" element={<Login />} />
            </Route>
            
            {/* Protected routes - require authentication */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              } />
              <Route path="/student-dashboard" element={
                <RequireAuth requiredRole="student">
                  <StudentDashboard />
                </RequireAuth>
              } />
              <Route path="/parent-dashboard" element={
                <RequireAuth requiredRole="parent">
                  <ParentDashboard />
                </RequireAuth>
              } />
              <Route path="/profile" element={
                <RequireAuth>
                  <ProfilePage />
                </RequireAuth>
              } />
              <Route path="/student-map" element={
                <RequireAuth>
                  <StudentMap />
                </RequireAuth>
              } />
              <Route path="/student-map/:id" element={
                <RequireAuth>
                  <StudentMap />
                </RequireAuth>
              } />
              <Route path="/api-docs" element={
                <RequireAuth>
                  <ApiDocs />
                </RequireAuth>
              } />
              <Route path="/guardians" element={
                <RequireAuth requiredRole="student">
                  <GuardiansPage />
                </RequireAuth>
              } />
              <Route path="/diagnostic" element={
                <RequireAuth>
                  <DiagnosticTool />
                </RequireAuth>
              } />
              <Route path="/add-student" element={<AddStudent />} />
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
