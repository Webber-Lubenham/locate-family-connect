
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UnifiedAuthContext';
import { DASHBOARD_ROUTES } from '@/lib/auth-redirects';
import { UserType } from '@/lib/auth-redirects'; 

const Dashboard = () => {
  const { user, loading } = useUser();
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
    const userType = user.user_type || 
                     user.user_metadata?.user_type as UserType || 
                     user.app_metadata?.user_type as UserType;
    
    console.log('[DASHBOARD] Redirecting based on user type:', userType);
    
    // Redirect based on user type
    if (userType === 'student') {
      navigate(DASHBOARD_ROUTES.student, { replace: true });
    } else if (userType === 'parent' || userType === 'guardian') {
      navigate(DASHBOARD_ROUTES.guardian, { replace: true });
    } else if (userType === 'developer') {
      navigate(DASHBOARD_ROUTES.developer, { replace: true });
    } else if (userType === 'admin') {
      navigate(DASHBOARD_ROUTES.admin, { replace: true });
    } else {
      console.warn('[DASHBOARD] Unknown user type, showing profile page:', userType);
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
