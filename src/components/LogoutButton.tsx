
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  className, 
  variant = 'destructive',
  size = 'default'
}) => {
  const navigate = useNavigate();
  const { signOut } = useUser();

  const handleLogout = async () => {
    try {
      await signOut();
      // No need to navigate here, signOut function already redirects to /login
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Button 
      onClick={handleLogout} 
      className={className}
      variant={variant}
      size={size}
    >
      {size === 'icon' ? (
        <LogOut className="h-5 w-5" />
      ) : (
        <>
          <LogOut className="h-5 w-5 mr-2" />
          Sair
        </>
      )}
    </Button>
  );
};

export default LogoutButton;
