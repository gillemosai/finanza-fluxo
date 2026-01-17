import { useState, useEffect, useCallback, useRef } from 'react';
import { indexedDBService, OfflineRecord } from '@/services/indexeddb/database';
import { offlineSyncService } from '@/services/indexeddb/syncService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

type TableName = 'receitas' | 'despesas' | 'dividas' | 'saldos_bancarios' | 'categorias';

export function useOfflineData() {
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [dataVersion, setDataVersion] = useState(0);
  const initRef = useRef(false);

  // Trigger a data refresh across components
  const refreshData = useCallback(() => {
    setDataVersion(v => v + 1);
  }, []);

  useEffect(() => {
    // Prevent double initialization in React 18 StrictMode
    if (initRef.current) return;
    
    const initialize = async () => {
      if (!user) return;
      
      initRef.current = true;
      const success = await indexedDBService.initialize();
      setIsInitialized(success);

      if (success) {
        const lastSync = await offlineSyncService.getLastSyncTime();
        setLastSyncTime(lastSync);

        if (navigator.onLine) {
          try {
            await offlineSyncService.fullSync(user.id);
            setLastSyncTime(new Date());
            refreshData();
          } catch (error) {
            console.error('Initial sync error:', error);
          }
        }
      }
    };

    initialize();
    const unsubscribe = offlineSyncService.onConnectionChange((online) => {
      setIsOnline(online);
      if (online && user) {
        refreshData();
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [user?.id, refreshData]);

  const syncNow = useCallback(async () => {
    if (!user) return { success: false, message: 'Usuário não autenticado' };
    setIsSyncing(true);
    try {
      const result = await offlineSyncService.fullSync(user.id);
      if (result.success) setLastSyncTime(new Date());
      return result;
    } finally {
      setIsSyncing(false);
    }
  }, [user]);

  const getData = useCallback(async (table: TableName, options?: { mesReferencia?: string }): Promise<any[]> => {
    if (!user) return [];

    if (isOnline && indexedDBService.isAvailable()) {
      try {
        // Use type assertion to avoid deep instantiation
        const client = supabase as any;
        let query = client.from(table).select('*').eq('user_id', user.id);
        
        if (options?.mesReferencia && table !== 'saldos_bancarios' && table !== 'categorias') {
          query = query.eq('mes_referencia', options.mesReferencia);
        }
        
        const result = await query;
        if (!result.error && result.data) {
          for (const item of result.data) {
            await indexedDBService.put(table, { ...item, synced: true, deleted: false } as OfflineRecord);
          }
          return result.data;
        }
      } catch (error) {
        console.log('Online fetch failed, falling back to offline:', error);
      }
    }

    if (indexedDBService.isAvailable()) {
      if (options?.mesReferencia && (table === 'receitas' || table === 'despesas' || table === 'dividas')) {
        return indexedDBService.getByMonth(table, user.id, options.mesReferencia);
      }
      return indexedDBService.getAll(table, user.id);
    }
    return [];
  }, [user, isOnline]);

  const saveData = useCallback(async (table: TableName, data: Record<string, any>) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };

    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const fullData = { ...data, id, user_id: user.id, created_at: now, updated_at: now };

    if (indexedDBService.isAvailable()) {
      await indexedDBService.put(table, { ...fullData, synced: false, deleted: false } as OfflineRecord);
    }

    if (isOnline) {
      try {
        const client = supabase as any;
        const { error } = await client.from(table).insert(fullData);
        if (!error && indexedDBService.isAvailable()) {
          await indexedDBService.markAsSynced(table, id);
        }
      } catch (error) {
        console.log('Online save failed:', error);
      }
    }
    return { success: true, data: fullData };
  }, [user, isOnline]);

  const updateData = useCallback(async (table: TableName, id: string, data: Record<string, any>) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };

    const updatePayload = { ...data, updated_at: new Date().toISOString() };

    if (indexedDBService.isAvailable()) {
      const existing = await indexedDBService.getById(table, id);
      if (existing) {
        await indexedDBService.put(table, { ...existing, ...updatePayload, synced: false } as OfflineRecord);
      }
    }

    if (isOnline) {
      try {
        const client = supabase as any;
        const { error } = await client.from(table).update(updatePayload).eq('id', id);
        if (!error && indexedDBService.isAvailable()) {
          await indexedDBService.markAsSynced(table, id);
        }
      } catch (error) {
        console.log('Online update failed:', error);
      }
    }
    return { success: true };
  }, [user, isOnline]);

  const deleteData = useCallback(async (table: TableName, id: string) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };

    if (indexedDBService.isAvailable()) {
      await indexedDBService.delete(table, id);
    }

    if (isOnline) {
      try {
        const client = supabase as any;
        const { error } = await client.from(table).delete().eq('id', id);
        if (!error && indexedDBService.isAvailable()) {
          await indexedDBService.hardDelete(table, id);
        }
      } catch (error) {
        console.log('Online delete failed:', error);
      }
    }
    return { success: true };
  }, [user, isOnline]);

  return { isInitialized, isOnline, isSyncing, lastSyncTime, dataVersion, syncNow, getData, saveData, updateData, deleteData, refreshData };
}
