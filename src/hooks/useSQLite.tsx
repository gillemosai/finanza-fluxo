import { useState, useEffect, useCallback } from 'react';
import { sqliteService } from '@/services/sqlite/database';
import { syncService } from '@/services/sqlite/syncService';
import { useAuth } from '@/hooks/useAuth';
import { Capacitor } from '@capacitor/core';

export function useSQLite() {
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isNative, setIsNative] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    const initialize = async () => {
      const native = Capacitor.isNativePlatform();
      setIsNative(native);

      if (native) {
        const success = await sqliteService.initialize();
        setIsInitialized(success);

        // If we have a user, sync from Supabase on first load
        if (success && user) {
          await syncService.syncFromSupabase(user.id);
        }
      }
    };

    initialize();
  }, [user?.id]);

  const syncNow = useCallback(async () => {
    if (!user || !isInitialized) return { success: false, message: 'Não inicializado' };

    setIsSyncing(true);
    try {
      const result = await syncService.fullSync(user.id);
      if (result.success) {
        setLastSyncTime(new Date());
      }
      return result;
    } finally {
      setIsSyncing(false);
    }
  }, [user, isInitialized]);

  const exportData = useCallback(async () => {
    if (!user || !isInitialized) return null;
    return syncService.exportToJSON(user.id);
  }, [user, isInitialized]);

  const importData = useCallback(async (jsonData: string) => {
    if (!user || !isInitialized) return { success: false, imported: 0 };
    return syncService.importFromJSON(user.id, jsonData);
  }, [user, isInitialized]);

  return {
    isInitialized,
    isNative,
    isSyncing,
    lastSyncTime,
    syncNow,
    exportData,
    importData,
    sqliteService: isInitialized ? sqliteService : null
  };
}
