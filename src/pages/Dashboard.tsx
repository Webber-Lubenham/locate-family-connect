
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';

const Dashboard = () => {
  const { user, profile } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    // Redireciona o usuário com base no tipo
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    
    const userType = profile?.user_type || user?.user_type || 'student';
    console.log(`[DASHBOARD] Redirecting based on user type: ${userType}`);
    
    if (userType === 'student') {
      navigate('/student-dashboard', { replace: true });
    } else if (userType === 'parent') {
      navigate('/parent-dashboard', { replace: true });
    } else {
      // Caso de fallback
      console.log('[DASHBOARD] Unknown user type, defaulting to login');
      navigate('/login', { replace: true });
    }
  }, [user, profile, navigate]);

  // Este componente é apenas para redirecionamento, então não renderiza nada significativo
  return null;
};

export default Dashboard;
