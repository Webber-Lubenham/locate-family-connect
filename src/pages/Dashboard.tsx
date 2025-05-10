import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { DASHBOARD_ROUTES, UserType, isValidUserType } from '@/lib/auth-redirects';

const Dashboard = () => {
  const { user, loading } = useUnifiedAuth();
  const navigate = useNavigate();

  // MCP: Log de montagem
  console.log('[MCP][Dashboard] Montando Dashboard. User:', user, 'Loading:', loading);

  useEffect(() => {
    // Log for debugging purposes
    console.log('[MCP][Dashboard] useEffect disparado. User:', user, 'Loading:', loading);
    
    // Wait until authentication state is determined
    if (loading) {
      console.log('[MCP][Dashboard] Authentication state is still loading');
      return;
    }
    
    // If not authenticated, redirect to login
    if (!user) {
      console.log('[MCP][Dashboard] User not authenticated, redirecting to login');
      navigate('/login', { replace: true });
      return;
    }
    
    // Get user type from user object or metadata
    const userTypeString = user.user_type || 
                     user.user_metadata?.user_type as string || 
                     user.app_metadata?.user_type as string;
    
    console.log('[MCP][Dashboard] User authenticated, determined user type:', userTypeString);
    
    // Redirect based on user type
    if (isValidUserType(userTypeString)) {
      const userType = userTypeString as UserType;
      const targetPath = DASHBOARD_ROUTES[userType];
      console.log(`[MCP][Dashboard] Redirecting ${userType} to ${targetPath}`);
      navigate(targetPath, { replace: true });
    } else {
      console.warn('[MCP][Dashboard] Unknown user type, showing profile page:', userTypeString);
      navigate('/profile', { replace: true });
    }
  }, [user, loading, navigate]);

  // Show loading while determining where to redirect
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Direcionando para seu dashboard...</p>
      </div>
    </div>
  );
};

export default Dashboard;
