
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { DASHBOARD_ROUTES, UserType, isValidUserType } from '@/lib/auth-redirects';

const Dashboard = () => {
  const { user, loading } = useUnifiedAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait until we have auth information
    if (loading) return;
    
    // If not authenticated, redirect to login
    if (!user) {
      console.log('[DASHBOARD] User not authenticated, redirecting to login');
      navigate('/login', { replace: true });
      return;
    }
    
    // Get user type from user object or metadata
    const userTypeString = user.user_type || 
                     user.user_metadata?.user_type as string || 
                     user.app_metadata?.user_type as string;
    
    console.log('[DASHBOARD] Redirecting based on user type:', userTypeString);
    
    // Redirect based on user type
    if (isValidUserType(userTypeString)) {
      const userType = userTypeString as UserType;
      navigate(DASHBOARD_ROUTES[userType], { replace: true });
    } else {
      console.warn('[DASHBOARD] Unknown user type, showing profile page:', userTypeString);
      navigate('/profile', { replace: true });
    }
  }, [user, loading, navigate]);

  // Show loading while determining where to redirect
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
};

export default Dashboard;
