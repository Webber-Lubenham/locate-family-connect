import React from 'react';

interface MapContainerProps {
  children?: React.ReactNode;
  className?: string;
}

const MapContainer: React.FC<MapContainerProps> = ({ children, className = '' }) => {
  return (
    <div 
      className={`relative w-full h-full min-h-[400px] ${className}`}
      style={{ 
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '400px'
      }}
    >
      {children}
    </div>
  );
};

export default MapContainer; 