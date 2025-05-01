
import React from 'react';
import { useDevice } from '@/hooks/use-mobile';

interface AuthTabsProps {
  activeTab: 'student' | 'parent';
  onTabChange: (tab: 'student' | 'parent') => void;
}

const AuthTabs: React.FC<AuthTabsProps> = ({ activeTab, onTabChange }) => {
  const { isXs, isXxs, orientation } = useDevice();
  
  // Adjust font size based on device and orientation
  const getFontSize = () => {
    if (orientation === 'portrait') {
      if (isXxs) return 'text-sm';
      if (isXs) return 'text-base';
      return 'text-lg';
    } else {
      // Landscape mode
      if (isXxs) {
        return 'text-xs';
      }
      if (isXs && orientation === 'landscape') {
        return 'text-xs';
      }
      return 'text-sm';
    }
  };
  
  // Adjust padding based on device and orientation
  const getPadding = () => {
    if (orientation === 'portrait') {
      if (isXxs || isXs) return 'py-2';
      return 'py-3';
    } else {
      // Landscape mode
      if (isXxs || (isXs && orientation === 'landscape')) {
        return 'py-1';
      }
      return 'py-2';
    }
  };
  
  // Adjust margin/spacing based on device and orientation
  const getMargin = () => {
    if (orientation === 'portrait') {
      if (isXxs) return 'mb-4';
      if (isXs) return 'mb-5';
      return 'mb-6';
    } else {
      // Landscape mode
      if (isXxs || (isXs && orientation === 'landscape')) {
        return 'mb-3';
      }
      return 'mb-6';
    }
  };

  return (
    <div className={`flex ${getMargin()} border-b`}>
      <button
        onClick={() => onTabChange('student')}
        className={`flex-1 ${getPadding()} text-center ${getFontSize()} font-medium ${
          activeTab === 'student' ? 'tab-active' : 'tab-inactive'
        }`}
      >
        Estudante
      </button>
      <button
        onClick={() => onTabChange('parent')}
        className={`flex-1 ${getPadding()} text-center ${getFontSize()} font-medium ${
          activeTab === 'parent' ? 'tab-active' : 'tab-inactive'
        }`}
      >
        Responsável
      </button>
    </div>
  );
};

export default AuthTabs;
