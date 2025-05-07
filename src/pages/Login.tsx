
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useUser } from '@/contexts/UnifiedAuthContext';
import AuthContainer from '@/components/AuthContainer';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, loading } = useUser();
  const [error, setError] = useState('');
  
  const queryParams = new URLSearchParams(location.search);
  const redirectMessage = queryParams.get('message');

  // Handle redirect message if present
  useEffect(() => {
    if (redirectMessage) {
      console.log(`[LOGIN] Redirect message present: ${redirectMessage}`);
      toast({
        title: "Atenção",
        description: redirectMessage,
        variant: "default"
      });
    }
  }, [redirectMessage, toast]);

  // Handle authenticated users - redirect to appropriate dashboard
  useEffect(() => {
    if (loading) return; // Wait until auth check completes
    
    if (user) {
      console.log('[LOGIN] User already authenticated, redirecting:', user);
      // Get user type from user metadata or userProfile
      const userType = user.user_type || 'student';
      
      // Redirect based on user type
      switch (userType) {
        case 'student':
          navigate('/student/dashboard', { replace: true });
          break;
        case 'parent':
          navigate('/guardian/dashboard', { replace: true });
          break;
        default:
          navigate('/dashboard', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  // Display loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4" data-cy="login-page">
      {error && (
        <Alert variant="destructive" className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md" data-cy="login-error">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <AuthContainer initialScreen="login" data-cy="login-container" />
    </div>
  );
};

export default Login;
