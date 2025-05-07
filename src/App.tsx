
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { UnifiedAuthProvider } from './contexts/UnifiedAuthContext';
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

function App() {
  return (
    <UnifiedAuthProvider>
      <>
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/password-recovery" element={<PasswordRecoveryPage />} />
            
            {/* Protected routes */}
            <Route path="/student/dashboard" element={
              <AuthenticatedRoute allowedUserTypes={['student']}>
                <StudentDashboard />
              </AuthenticatedRoute>
            } />
            
            {/* Backward compatibility */}
            <Route path="/student-dashboard" element={
              <Navigate to="/student/dashboard" replace />
            } />
            
            <Route path="/guardian/dashboard" element={
              <AuthenticatedRoute allowedUserTypes={['parent', 'guardian']}>
                <ParentDashboard />
              </AuthenticatedRoute>
            } />
            
            {/* Backward compatibility */}
            <Route path="/parent-dashboard" element={
              <Navigate to="/guardian/dashboard" replace />
            } />
            
            <Route path="/profile" element={
              <AuthenticatedRoute>
                <ProfilePage />
              </AuthenticatedRoute>
            } />
            
            <Route path="/student-map/:id" element={
              <AuthenticatedRoute>
                <StudentMap />
              </AuthenticatedRoute>
            } />
            
            <Route path="/webhook-admin" element={
              <AuthenticatedRoute allowedUserTypes={['admin']}>
                <WebhookAdmin />
              </AuthenticatedRoute>
            } />
            
            <Route path="/developer/flow" element={
              <DeveloperRoute>
                <DeveloperFlow />
              </DeveloperRoute>
            } />
            
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Toaster />
      </>
    </UnifiedAuthProvider>
  );
}

export default App;
