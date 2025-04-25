
import React from 'react';
import { BookOpen } from 'lucide-react'; // Using BookOpen icon from lucide-react

const Logo = () => {
  return (
    <div className="text-center mb-6">
      <div className="flex items-center justify-center space-x-2">
        <BookOpen className="h-10 w-10 text-[#4a90e2]" />
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#4a90e2] to-[#805ad5] text-transparent bg-clip-text">
          EduConnect
        </h1>
      </div>
      <p className="text-sm text-gray-500 mt-2">Sistema de Localização de Alunos</p>
    </div>
  );
};

export default Logo;
