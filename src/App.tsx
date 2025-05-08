import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import ApiDocsPage from './pages/ApiDocsPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import StudentDashboard from './pages/StudentDashboard';
import ParentDashboard from './pages/ParentDashboard';
import StudentMap from './pages/StudentMap';
import PasswordRecoveryPage from './pages/PasswordRecoveryPage';
import NotFoundPage from './pages/NotFoundPage';
import RegistrationPage from './pages/RegistrationPage';
import AuthenticatedRoute from './components/AuthenticatedRoute';
import WebhookAdmin from './pages/WebhookAdmin';
import DeveloperFlow from './pages/DeveloperFlow';
import DeveloperRoute from './components/DeveloperRoute';
import StudentMapRedirect from './components/StudentMapRedirect';
import Dashboard from './pages/Dashboard';
import { useUnifiedAuth } from './contexts/UnifiedAuthContext';

function App() {
  const { user, loading } = useUnifiedAuth();

  const router = createBrowserRouter([
    {
      path: '/login',
      element: <LoginPage />
    },
    {
      path: '/register',
      element: <RegistrationPage />
    },
    {
      path: '/password-recovery',
      element: <PasswordRecoveryPage />
    },
    {
      path: '/dashboard',
      element: <Dashboard />
    },
    {
      path: '/student/dashboard',
      element: (
        <AuthenticatedRoute allowedUserTypes={['student']}>
          <StudentDashboard />
        </AuthenticatedRoute>
      )
    },
    {
      path: '/student-dashboard',
      element: <Navigate to="/student/dashboard" replace />
    },
    {
      path: '/guardian/dashboard',
      element: (
        <AuthenticatedRoute allowedUserTypes={['parent', 'guardian']}>
          <ParentDashboard />
        </AuthenticatedRoute>
      )
    },
    {
      path: '/student/map/:id',
      element: (
        <AuthenticatedRoute allowedUserTypes={['student']}>
          <StudentMap />
        </AuthenticatedRoute>
      )
    },
    {
      path: '/webhook-admin',
      element: (
        <DeveloperRoute>
          <WebhookAdmin />
        </DeveloperRoute>
      )
    },
    {
      path: '/developer-flow',
      element: (
        <DeveloperRoute>
          <DeveloperFlow />
        </DeveloperRoute>
      )
    },
    {
      path: '/api-docs',
      element: (
        <AuthenticatedRoute allowedUserTypes={['developer']}>
          <ApiDocsPage />
        </AuthenticatedRoute>
      )
    },
    {
      path: '*',
      element: <NotFoundPage />
    }
  ]);

  return (
    <RouterProvider router={router} />
  );
}

export default App;
