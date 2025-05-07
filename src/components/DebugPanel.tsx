
import React from 'react';

interface DebugPanelProps {
  info: Record<string, any>;
  title?: string;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ info, title = 'Debug Info' }) => {
  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 max-w-sm p-3 bg-black/80 text-white rounded shadow-lg z-50 text-xs">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">{title}</h3>
      </div>
      <div className="overflow-auto max-h-60">
        <pre className="whitespace-pre-wrap">{JSON.stringify(info, null, 2)}</pre>
      </div>
    </div>
  );
};
