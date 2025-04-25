import React from 'react';
import RegisterForm from '../components/RegisterForm';

const Register: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <RegisterForm userType="student" onLoginClick={() => window.location.href = '/login'} />
    </div>
  );
};

export default Register;
