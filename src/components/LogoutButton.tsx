import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface LogoutButtonProps {
  className?: string;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ className }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login'); // Redirect to login page after logout
    } catch (error) {
      console.error('Logout error:', error);
      // Optional: Add user-friendly error handling
    }
  };

  return (
    <button 
      onClick={handleLogout} 
      className={`bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition ${className}`}
    >
      Sair
    </button>
  );
};
