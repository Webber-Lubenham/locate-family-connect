
import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import { useAuth } from './contexts/UnifiedAuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import ParentDashboard from './pages/ParentDashboard';
import Dashboard from './pages/Dashboard';
import RegisterConfirmation from './pages/RegisterConfirmation';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { Toaster } from '@/components/ui/toaster';
import { UserType } from '@/lib/types/user-types';
import { getUserTypeFromMetadata, getDefaultRouteForUserType } from '@/lib/types/user-types';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import { UnifiedAuthProvider } from './contexts/UnifiedAuthContext';
import EmailDiagnostic from './pages/EmailDiagnostic';

interface AuthRouteProps {
  children: React.ReactNode;
  userType: UserType;
}

const AuthRoute: React.FC<AuthRouteProps> = ({ children, userType }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!session?.user) {
    return <Navigate to="/login" replace />;
  }

  const actualUserType = getUserTypeFromMetadata(session.user.user_metadata);

  if (actualUserType !== userType) {
    const defaultRoute = getDefaultRouteForUserType(actualUserType);
    navigate(defaultRoute, { replace: true });
    return null;
  }

  return <>{children}</>;
};

interface DeveloperRouteProps {
  children: React.ReactNode;
}

const DeveloperRoute: React.FC<DeveloperRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!session?.user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <UnifiedAuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/confirm" element={<RegisterConfirmation />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/student-dashboard"
            element={
              <AuthRoute userType="student">
                <StudentDashboard />
              </AuthRoute>
            }
          />
          <Route
            path="/parent-dashboard"
            element={
              <AuthRoute userType="parent">
                <ParentDashboard />
              </AuthRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <AuthRoute userType="developer">
                <Dashboard />
              </AuthRoute>
            }
          />
          <Route
            path="/email-diagnostic"
            element={<DeveloperRoute><EmailDiagnostic /></DeveloperRoute>}
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster />
      </Router>
    </UnifiedAuthProvider>
  );
};

export default App;
