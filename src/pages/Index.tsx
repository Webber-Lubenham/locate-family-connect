import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UnifiedAuthContext';
import { Button } from '@/components/ui/button';
import { clearAppCache, checkCacheClearRequest } from '@/lib/utils/cache-manager';
import { RefreshCw } from 'lucide-react';
import ApiErrorBanner from '@/components/ApiErrorBanner';

const Index = () => {
  const { user, loading } = useUser();
  const navigate = useNavigate();

  // Check if there were previous errors and if there's a cache clear request
  useEffect(() => {
    // Check for cache clear request in URL
    checkCacheClearRequest();
  }, []);

  // Redirect based on auth status
  useEffect(() => {
    if (loading) return; // Wait until auth check is complete
    
    if (user) {
      // Determine where to redirect based on user type
      const userType = user.user_metadata?.user_type || 'student';
      
      switch (userType) {
        case 'student':
          navigate('/student-dashboard', { replace: true });
          break;
        case 'parent':
          navigate('/parent-dashboard', { replace: true });
          break;
        default:
          navigate('/dashboard', { replace: true });
      }
    } else {
      // Not authenticated, go to login
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  // Show loading while determining where to redirect
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  // This should only briefly appear during navigation
  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
      <div className="container max-w-md mx-auto p-4">
        <ApiErrorBanner />
        
        <div className="bg-white p-6 rounded-lg shadow-md mt-4">
          <h2 className="text-xl font-semibold mb-4">Redirecionando...</h2>
          <p className="text-gray-600 mb-4">Aguarde enquanto direcionamos você para a página correta.</p>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2 mx-auto"
            onClick={() => clearAppCache(true)}
          >
            <RefreshCw size={16} />
            Recarregar aplicação
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
