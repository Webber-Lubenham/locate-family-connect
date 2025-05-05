
import React from 'react';

interface PendingLocationsNotificationProps {
  hasPendingLocations: boolean;
  onSyncClick: () => void;
}

const PendingLocationsNotification: React.FC<PendingLocationsNotificationProps> = ({ 
  hasPendingLocations, 
  onSyncClick 
}) => {
  if (!hasPendingLocations) return null;
  
  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4">
      <div className="flex items-center">
        <div className="flex-shrink-0 text-amber-500">
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-amber-700">Existem localizações pendentes de compartilhamento.</p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              onClick={onSyncClick}
              className="inline-flex bg-amber-50 rounded-md p-1.5 text-amber-500 hover:bg-amber-100 focus:outline-none"
            >
              <span>Sincronizar agora</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingLocationsNotification;
