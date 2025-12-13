import { indexedDBService, OfflineRecord } from './database';
import { supabase } from '@/integrations/supabase/client';

type TableName = 'receitas' | 'despesas' | 'dividas' | 'saldos_bancarios' | 'categorias';

class OfflineSyncService {
  private isOnline = navigator.onLine;
  private syncInProgress = false;
  private listeners: Set<(isOnline: boolean) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnlineChange(true));
      window.addEventListener('offline', () => this.handleOnlineChange(false));
    }
  }

  private handleOnlineChange(isOnline: boolean) {
    this.isOnline = isOnline;
    this.listeners.forEach(listener => listener(isOnline));
    
    if (isOnline) {
      // Auto-sync when back online
      this.fullSync().catch(console.error);
    }
  }

  onConnectionChange(callback: (isOnline: boolean) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  async syncToSupabase(userId: string): Promise<{ success: boolean; synced: number; errors: number }> {
    if (!this.isOnline) {
      return { success: false, synced: 0, errors: 0 };
    }

    const tables: TableName[] = ['receitas', 'despesas', 'dividas', 'saldos_bancarios', 'categorias'];
    let synced = 0;
    let errors = 0;

    for (const table of tables) {
      const unsyncedItems = await indexedDBService.getUnsynced(table);
      
      for (const item of unsyncedItems) {
        try {
          // Remove local-only fields
          const { synced: _, deleted, ...data } = item;

          if (deleted) {
            // Delete from Supabase
            const { error } = await supabase
              .from(table)
              .delete()
              .eq('id', item.id);

            if (!error) {
              await indexedDBService.hardDelete(table, item.id);
              synced++;
            } else {
              errors++;
            }
          } else {
            // Upsert to Supabase
            const { error } = await supabase
              .from(table)
              .upsert(data as any);

            if (!error) {
              await indexedDBService.markAsSynced(table, item.id);
              synced++;
            } else {
              console.error(`Sync error for ${table}:`, error);
              errors++;
            }
          }
        } catch (error) {
          console.error(`Error syncing ${table}:`, error);
          errors++;
        }
      }
    }

    return { success: errors === 0, synced, errors };
  }

  async syncFromSupabase(userId: string): Promise<{ success: boolean; imported: number }> {
    if (!this.isOnline) {
      return { success: false, imported: 0 };
    }

    const tables: TableName[] = ['receitas', 'despesas', 'dividas', 'saldos_bancarios', 'categorias'];
    let imported = 0;

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq('user_id', userId);

        if (error) {
          console.error(`Error fetching ${table}:`, error);
          continue;
        }

        if (data) {
          for (const item of data) {
            const existingItem = await indexedDBService.getById(table, item.id);
            
            // Only update if server version is newer or item doesn't exist locally
            if (!existingItem || new Date(item.updated_at) > new Date(existingItem.updated_at)) {
              await indexedDBService.put(table, {
                ...item,
                synced: true,
                deleted: false,
              } as OfflineRecord);
              imported++;
            }
          }
        }
      } catch (error) {
        console.error(`Error importing ${table}:`, error);
      }
    }

    await indexedDBService.setSyncMeta('lastSync', new Date().toISOString());
    return { success: true, imported };
  }

  async fullSync(userId?: string): Promise<{ success: boolean; message: string }> {
    if (this.syncInProgress) {
      return { success: false, message: 'Sincronização já em andamento' };
    }

    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
    }

    if (!userId) {
      return { success: false, message: 'Usuário não autenticado' };
    }

    this.syncInProgress = true;

    try {
      // First, push local changes
      const pushResult = await this.syncToSupabase(userId);
      
      // Then, pull remote changes
      const pullResult = await this.syncFromSupabase(userId);

      return {
        success: pushResult.success && pullResult.success,
        message: `Sincronizado: ${pushResult.synced} enviados, ${pullResult.imported} recebidos`,
      };
    } catch (error) {
      console.error('Full sync error:', error);
      return { success: false, message: 'Erro durante sincronização' };
    } finally {
      this.syncInProgress = false;
    }
  }

  async getLastSyncTime(): Promise<Date | null> {
    const lastSync = await indexedDBService.getSyncMeta('lastSync');
    return lastSync ? new Date(lastSync as string) : null;
  }

  isSyncing(): boolean {
    return this.syncInProgress;
  }
}

export const offlineSyncService = new OfflineSyncService();
