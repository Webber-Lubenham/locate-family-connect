
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children?: React.ReactNode;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  className, 
  variant = 'destructive',
  size = 'default',
  children
}) => {
  const navigate = useNavigate();
  const { signOut } = useUser();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      console.log('Iniciando logout...');
      // Call signOut from UserContext
      await signOut();
      
      // If the signOut function doesn't redirect, we'll do it here
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Show error toast if available
      navigate('/login'); // Fallback redirection on error
    }
  };

  // Se children for fornecido, use-o; caso contrário, use o conteúdo padrão
  const buttonContent = children || (
    <>
      {size === 'icon' ? (
        <LogOut className="h-5 w-5" />
      ) : (
        <>
          <LogOut className="h-5 w-5 mr-2" />
          Sair
        </>
      )}
    </>
  );

  return (
    <Button 
      onClick={handleLogout} 
      className={className}
      variant={variant}
      size={size}
    >
      {buttonContent}
    </Button>
  );
};

export default LogoutButton;
