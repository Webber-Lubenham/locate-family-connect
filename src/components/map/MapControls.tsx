
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin } from 'lucide-react';

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
    <div className="absolute bottom-4 right-4 z-20">
      <Button
        variant="secondary"
        className="bg-white/90 hover:bg-white shadow-md"
        onClick={onUpdateLocation}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <MapPin className="h-4 w-4 mr-2" />
        )}
        Atualizar Localização
      </Button>
    </div>
  );
};

export default MapControls;
