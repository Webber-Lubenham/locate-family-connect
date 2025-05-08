
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
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
  const { signOut } = useUnifiedAuth();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      console.log('LogoutButton: Iniciando processo de logout...');
      
      // Importante: Desativar o botão para evitar cliques repetidos
      const button = e.currentTarget as HTMLButtonElement;
      if (button) {
        button.disabled = true;
        button.innerHTML = '<span>Saindo...</span>';
      }
      
      // Call signOut from UserContext - a função já contém redirecionamento
      await signOut();
      
      // Fallback: se o redirecionamento não ocorrer em 1.5 segundos, forçamos manualmente
      setTimeout(() => {
        if (document.location.pathname !== '/login') {
          console.log('LogoutButton: Redirecionamento de fallback ativado');
          window.location.href = '/login';
        }
      }, 1500);
    } catch (error) {
      console.error('LogoutButton: Erro ao fazer logout:', error);
      // Forçar navegação mesmo em caso de erro
      navigate('/login?error=true');
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
