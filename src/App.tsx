
import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import StudentDashboard from '@/pages/StudentDashboard';
import ParentDashboard from '@/pages/ParentDashboard';
import Dashboard from '@/pages/Dashboard';
import ProfilePage from '@/pages/ProfilePage';
import EmailDiagnostic from '@/pages/EmailDiagnostic';
import PasswordResetTest from '@/pages/PasswordResetTest';
import RegisterConfirmation from '@/pages/RegisterConfirmation';
import { Toaster } from "@/components/ui/toaster";
import ResetPassword from '@/pages/ResetPassword';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/confirm" element={<RegisterConfirmation />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/parent-dashboard" element={<ParentDashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/email-diagnostic" element={<EmailDiagnostic />} />
        <Route path="/password-reset-test" element={<PasswordResetTest />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
