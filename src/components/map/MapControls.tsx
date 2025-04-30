
import React from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapControlsProps {
  showControls: boolean;
  onUpdateLocation: () => void;
  loading: boolean;
}

const MapControls: React.FC<MapControlsProps> = ({
  showControls,
  onUpdateLocation,
  loading
}) => {
  if (!showControls) return null;
  
  return (
    <div className="absolute bottom-4 right-4 z-10">
      <button 
        className="px-4 py-2 bg-primary text-white rounded-md shadow-md hover:bg-primary-darker disabled:opacity-50"
        onClick={onUpdateLocation}
        disabled={loading}
      >
        {loading ? "Obtendo..." : "Atualizar Localização"}
      </button>
    </div>
  );
};

export default MapControls;
