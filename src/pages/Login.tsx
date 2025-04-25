import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ui/use-toast';
import { useUser, User } from '../contexts/UserContext';
import AuthContainer from '../components/AuthContainer';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, updateUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const queryParams = new URLSearchParams(location.search);
  const redirectMessage = queryParams.get('message');

  useEffect(() => {
    console.log('[LOGIN] Login page mounted');
    
    if (user) {
      console.log('[LOGIN] User already authenticated, redirecting:', user);
      const userType = user.user_type || 'student';
      
      // Redirect based on user type
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
    }
    
    if (redirectMessage) {
      console.log(`[LOGIN] Redirect message present: ${redirectMessage}`);
      toast({
        title: "Atenção",
        description: redirectMessage,
        variant: "default"
      });
    }
  }, [redirectMessage, toast, user, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <AuthContainer initialScreen="login" />
    </div>
  );
};

export default Login;
