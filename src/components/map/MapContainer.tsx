
import React from 'react';

interface MapContainerProps {
  children: React.ReactNode;
}

const MapContainer: React.FC<MapContainerProps> = ({ children }) => {
  return (
    <div className="w-full h-[400px] relative rounded-lg overflow-hidden">
      {children}
    </div>
  );
};

export default MapContainer;
