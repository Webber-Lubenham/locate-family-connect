
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import '@/App.css';
import AppLayout from './layouts/AppLayout';
import AuthLayout from './layouts/AuthLayout';
import { UnifiedAuthProvider } from './contexts/UnifiedAuthContext';
import DeveloperRoute from './components/DeveloperRoute';
import EmailDiagnostic from './pages/EmailDiagnostic';

// Lazy loaded pages
const Index = lazy(() => import('./pages/Index'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const RegisterConfirmation = lazy(() => import('./pages/RegisterConfirmation'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const ParentDashboard = lazy(() => import('./pages/ParentDashboard'));
const DevDashboard = lazy(() => import('./pages/DevDashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const StudentMap = lazy(() => import('./pages/StudentMap'));
const AddStudent = lazy(() => import('./pages/AddStudent'));
const GuardiansPage = lazy(() => import('./pages/GuardiansPage'));
const DiagnosticTool = lazy(() => import('./pages/DiagnosticTool'));
const ApiDocs = lazy(() => import('./pages/ApiDocs'));

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UnifiedAuthProvider>
        <Router>
          <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center"><div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div></div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              
              {/* Auth routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/register/confirm" element={<RegisterConfirmation />} />
                <Route path="/reset-password" element={<ResetPassword />} />
              </Route>
              
              {/* App routes */}
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/student-dashboard" element={<StudentDashboard />} />
                <Route path="/parent-dashboard" element={<ParentDashboard />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/student-map" element={<StudentMap />} />
                <Route path="/guardians" element={<GuardiansPage />} />
                <Route path="/add-student" element={<AddStudent />} />

                {/* Diagnostic tools */}
                <Route path="/email-diagnostic" element={<EmailDiagnostic />} />
                <Route path="/diagnostic" element={<DiagnosticTool />} />
                
                {/* Developer routes */}
                <Route element={<DeveloperRoute />}>
                  <Route path="/dev" element={<DevDashboard />} />
                  <Route path="/api-docs" element={<ApiDocs />} />
                </Route>
              </Route>

              {/* Handle not found */}
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </Suspense>
        </Router>
        <Toaster />
      </UnifiedAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
