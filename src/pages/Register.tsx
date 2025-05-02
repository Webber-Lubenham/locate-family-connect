import React, { useEffect, useState } from 'react';
import AuthContainer from '../components/AuthContainer';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useUser } from '@/contexts/UnifiedAuthContext';

const Register: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.client.auth.getSession();
        
        if (data?.session?.user) {
          console.log('[REGISTER] User already authenticated, redirecting');
          const userType = data.session.user.user_metadata?.user_type || 'student';
          
          // Redirecionar com base no tipo de usuário
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
          setIsChecking(false);
        }
      } catch (error) {
        console.error('[REGISTER] Error checking session:', error);
        setIsChecking(false);
      }
    };
    
    if (user) {
      const userType = user.user_metadata?.user_type || 'student';
      
      // Redirecionar com base no tipo de usuário
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
      checkSession();
    }
  }, [user, navigate]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <AuthContainer initialScreen="register" />
    </div>
  );
};

export default Register;
