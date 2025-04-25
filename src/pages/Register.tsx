import React from 'react';
import AuthContainer from '../components/AuthContainer';
import { Navigate } from 'react-router-dom';

const Register: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <AuthContainer initialScreen="register" />
    </div>
  );
};

export default Register;
