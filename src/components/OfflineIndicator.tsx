import { useState, useEffect } from 'react';
import { offlineSyncService } from '@/services/indexeddb/syncService';
import { Wifi, WifiOff, RefreshCw, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';

export function OfflineIndicator() {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const unsubscribe = offlineSyncService.onConnectionChange((online) => {
      setIsOnline(online);
      if (online) {
        toast.success('Conexão restaurada! Sincronizando dados...');
      } else {
        toast.warning('Você está offline. Os dados serão salvos localmente.');
      }
    });

    // Get initial last sync time
    offlineSyncService.getLastSyncTime().then(setLastSync);

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSync = async () => {
    if (!user) {
      toast.error('Faça login para sincronizar');
      return;
    }

    setIsSyncing(true);
    try {
      const result = await offlineSyncService.fullSync(user.id);
      if (result.success) {
        setLastSync(new Date());
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={isOnline ? 'default' : 'destructive'} 
            className="gap-1 cursor-help"
          >
            {isOnline ? (
              <>
                <Wifi className="h-3 w-3" />
                <span className="hidden sm:inline">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                <span className="hidden sm:inline">Offline</span>
              </>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          {isOnline 
            ? 'Conectado - dados sincronizados com a nuvem'
            : 'Sem conexão - dados salvos localmente'
          }
          {lastSync && (
            <div className="text-xs mt-1 opacity-70">
              Última sincronização: {format(lastSync, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </div>
          )}
        </TooltipContent>
      </Tooltip>

      {isOnline && user && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleSync}
              disabled={isSyncing}
            >
              {showSuccess ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isSyncing ? 'Sincronizando...' : 'Sincronizar agora'}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
