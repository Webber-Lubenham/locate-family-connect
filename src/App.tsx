
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import { Toaster } from './components/ui/toaster';
import { lazy, Suspense } from 'react';
import AppLayout from './layouts/AppLayout';
import AuthLayout from './layouts/AuthLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import StudentDashboard from './pages/StudentDashboard';
import ParentDashboard from './pages/ParentDashboard';
import StudentMap from './pages/StudentMap';
import TestUsers from './pages/TestUsers';
import NotFound from './pages/NotFound';

function App() {
  return (
    <UserProvider>
      <Router>
        <Suspense fallback={
          <div className="flex min-h-screen items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        }>
          <Routes>
            {/* Página Inicial - Redireciona para login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Rotas de Autenticação */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>
            
            {/* Rotas Protegidas com AppLayout */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/student-dashboard" element={<StudentDashboard />} />
              <Route path="/parent-dashboard" element={<ParentDashboard />} />
              <Route path="/student-map/:id" element={<StudentMap />} />
            </Route>
            
            {/* Rota de Teste Usuários - Acessível sem autenticação */}
            <Route path="/test-users" element={<TestUsers />} />
            
            {/* Rota para página não encontrada */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <Toaster />
      </Router>
    </UserProvider>
  );
}

export default App;
