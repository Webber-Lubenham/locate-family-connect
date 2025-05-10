
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import LoginPage from '@/pages/LoginPage';
import ProfilePage from '@/pages/ProfilePage';
import StudentDashboard from '@/pages/StudentDashboard';
import ParentDashboard from '@/pages/ParentDashboard';
import StudentMap from '@/pages/StudentMap';
import PasswordRecoveryPage from '@/pages/PasswordRecoveryPage';
import NotFoundPage from '@/pages/NotFoundPage';
import RegistrationPage from '@/pages/RegistrationPage';
import AuthenticatedRoute from '@/components/AuthenticatedRoute';
import WebhookAdmin from '@/pages/WebhookAdmin';
import DeveloperFlow from '@/pages/DeveloperFlow';
import DeveloperRoute from '@/components/DeveloperRoute';
import StudentMapRedirect from '@/components/StudentMapRedirect';
import Dashboard from '@/pages/Dashboard';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import Index from '@/pages/Index';

function App() {
  const { user, loading, error } = useUnifiedAuth();

  // Show a basic fallback during initial load
  if (loading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f5f5]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando aplicação...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
          {/* Root route - handles initial redirection */}
          <Route path="/" element={<Index />} />
          
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/password-recovery" element={<PasswordRecoveryPage />} />
          
          {/* Main dashboard router - will redirect to appropriate dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Student routes - standardized to /student/... format */}
          <Route path="/student/dashboard" element={
            <AuthenticatedRoute allowedUserTypes={['student']}>
              <StudentDashboard />
            </AuthenticatedRoute>
          } />
          
          {/* Backward compatibility for student routes */}
          <Route path="/student-dashboard" element={
            <Navigate to="/student/dashboard" replace />
          } />
          
          {/* Guardian routes - standardized to /guardian/... format */}
          <Route path="/guardian/dashboard" element={
            <AuthenticatedRoute allowedUserTypes={['parent', 'guardian']}>
              <ParentDashboard />
            </AuthenticatedRoute>
          } />
          
          {/* Backward compatibility for guardian/parent routes */}
          <Route path="/parent-dashboard" element={
            <Navigate to="/guardian/dashboard" replace />
          } />
          
          {/* Additional route for managing guardians */}
          <Route path="/student/guardians" element={
            <AuthenticatedRoute allowedUserTypes={['student']}>
              {/* This component doesn't exist yet - placeholder */}
              <Navigate to="/student/dashboard" replace />
            </AuthenticatedRoute>
          } />
          
          {/* Standardized map route */}
          <Route path="/guardian/student-map/:id" element={
            <AuthenticatedRoute allowedUserTypes={['parent', 'guardian']}>
              <StudentMap />
            </AuthenticatedRoute>
          } />
          
          {/* Backward compatibility for student map - using a dedicated component */}
          <Route path="/student-map/:id" element={
            <StudentMapRedirect />
          } />
          
          {/* Shared routes for all authenticated users */}
          <Route path="/profile" element={
            <AuthenticatedRoute>
              <ProfilePage />
            </AuthenticatedRoute>
          } />
          
          {/* Admin routes */}
          <Route path="/admin/webhook" element={
            <AuthenticatedRoute allowedUserTypes={['admin']}>
              <WebhookAdmin />
            </AuthenticatedRoute>
          } />
          
          {/* Backward compatibility for admin routes */}
          <Route path="/webhook-admin" element={
            <Navigate to="/admin/webhook" replace />
          } />
          
          {/* Developer routes */}
          <Route path="/developer/flow" element={
            <DeveloperRoute>
              <DeveloperFlow />
            </DeveloperRoute>
          } />
          
          {/* Fallback route */}
          <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
