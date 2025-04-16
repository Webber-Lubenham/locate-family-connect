
import React from 'react';

interface AuthTabsProps {
  activeTab: 'student' | 'parent';
  onTabChange: (tab: 'student' | 'parent') => void;
}

const AuthTabs: React.FC<AuthTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex mb-6 border-b">
      <button
        onClick={() => onTabChange('student')}
        className={`flex-1 py-2 text-center font-medium ${
          activeTab === 'student' ? 'tab-active' : 'tab-inactive'
        }`}
      >
        Estudante
      </button>
      <button
        onClick={() => onTabChange('parent')}
        className={`flex-1 py-2 text-center font-medium ${
          activeTab === 'parent' ? 'tab-active' : 'tab-inactive'
        }`}
      >
        Responsável
      </button>
    </div>
  );
};

export default AuthTabs;
