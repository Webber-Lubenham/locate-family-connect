
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { clearAppCache } from '@/lib/utils/cache-manager';
import { useToast } from '@/components/ui/use-toast';

interface CacheClearButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const CacheClearButton: React.FC<CacheClearButtonProps> = ({ 
  variant = 'outline', 
  size = 'sm',
  className = ''
}) => {
  const [clearing, setClearing] = useState(false);
  const { toast } = useToast();

  const handleClearCache = async () => {
    if (clearing) return;
    
    setClearing(true);
    toast({
      title: "Limpando cache",
      description: "O aplicativo será recarregado em instantes...",
    });
    
    // Short timeout to allow the toast to be displayed
    setTimeout(() => {
      clearAppCache(true);
    }, 1000);
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={`gap-2 ${className}`}
      onClick={handleClearCache}
      disabled={clearing}
    >
      <Trash2 size={16} />
      {clearing ? "Limpando..." : "Limpar Cache"}
    </Button>
  );
};

export default CacheClearButton;
