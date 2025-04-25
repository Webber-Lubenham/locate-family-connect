import { useLocation, useNavigate } from 'react-router-dom';
import LoginForm from '@/components/auth/Login';
import RegisterForm from '@/components/auth/Register';
import ForgotPasswordForm from '@/components/auth/ForgotPassword';
import ResetPassword from '@/components/auth/ResetPassword';

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {location.pathname === '/auth/login' ? 'Sign in to your account' :
             location.pathname === '/auth/register' ? 'Create your account' :
             location.pathname === '/auth/forgot-password' ? 'Forgot your password?' :
             'Reset your password'}
          </h2>
        </div>
        <div className="mt-8 space-y-6">
          {location.pathname === '/auth/login' && (
            <LoginForm 
              userType="student" 
              onRegisterClick={() => navigate('/auth/register')} 
              onForgotPasswordClick={() => navigate('/auth/forgot-password')} 
            />
          )}
          {location.pathname === '/auth/register' && (
            <RegisterForm 
              userType="student" 
              onLoginClick={() => navigate('/auth/login')} 
            />
          )}
          {location.pathname === '/auth/forgot-password' && (
            <ForgotPasswordForm 
              userType="student" 
              onBackToLogin={() => navigate('/auth/login')} 
            />
          )}
          {location.pathname === '/auth/reset-password' && (
            <ResetPassword 
              userType="student" 
              onBackToLogin={() => navigate('/auth/login')} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
