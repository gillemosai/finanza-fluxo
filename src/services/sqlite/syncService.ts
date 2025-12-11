import { sqliteService } from './database';
import { supabase } from '@/integrations/supabase/client';

type TableName = 'receitas' | 'despesas' | 'dividas' | 'saldos_bancarios' | 'categorias';

class SyncService {
  private syncInProgress = false;

  async syncToSupabase(userId: string): Promise<{ success: boolean; synced: number; errors: number }> {
    if (this.syncInProgress || !sqliteService.isAvailable()) {
      return { success: false, synced: 0, errors: 0 };
    }

    this.syncInProgress = true;
    let synced = 0;
    let errors = 0;

    const tables: TableName[] = ['receitas', 'despesas', 'dividas', 'saldos_bancarios', 'categorias'];

    try {
      for (const table of tables) {
        const unsyncedRecords = await sqliteService.getUnsynced(table);
        
        for (const record of unsyncedRecords) {
          try {
            // Remove SQLite-specific fields
            const { synced: _, ...cleanRecord } = record;
            
            // Convert boolean fields for Supabase
            if (table === 'despesas') {
              cleanRecord.recorrente = Boolean(cleanRecord.recorrente);
              cleanRecord.alerta_ativo = Boolean(cleanRecord.alerta_ativo);
            }

            const { error } = await supabase
              .from(table)
              .upsert(cleanRecord, { onConflict: 'id' });

            if (error) {
              console.error(`Sync error for ${table}:`, error);
              errors++;
            } else {
              await sqliteService.markAsSynced(table, record.id);
              synced++;
            }
          } catch (err) {
            console.error(`Error syncing record in ${table}:`, err);
            errors++;
          }
        }
      }

      return { success: true, synced, errors };
    } catch (error) {
      console.error('Sync to Supabase failed:', error);
      return { success: false, synced, errors };
    } finally {
      this.syncInProgress = false;
    }
  }

  async syncFromSupabase(userId: string): Promise<{ success: boolean; imported: number }> {
    if (!sqliteService.isAvailable()) {
      return { success: false, imported: 0 };
    }

    let imported = 0;

    const tables: TableName[] = ['receitas', 'despesas', 'dividas', 'saldos_bancarios', 'categorias'];

    try {
      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq('user_id', userId);

        if (error) {
          console.error(`Error fetching ${table} from Supabase:`, error);
          continue;
        }

        if (data) {
          for (const record of data) {
            // Convert boolean fields for SQLite
            const sqliteRecord: Record<string, any> = { ...record, synced: 1 };
            
            if (table === 'despesas' && 'recorrente' in record && 'alerta_ativo' in record) {
              sqliteRecord.recorrente = record.recorrente ? 1 : 0;
              sqliteRecord.alerta_ativo = record.alerta_ativo ? 1 : 0;
            }

            await sqliteService.insert(table, sqliteRecord);
            imported++;
          }
        }
      }

      return { success: true, imported };
    } catch (error) {
      console.error('Sync from Supabase failed:', error);
      return { success: false, imported };
    }
  }

  async fullSync(userId: string): Promise<{ success: boolean; message: string }> {
    // First, sync local changes to Supabase
    const uploadResult = await this.syncToSupabase(userId);
    
    // Then, download any new data from Supabase
    const downloadResult = await this.syncFromSupabase(userId);

    if (uploadResult.success && downloadResult.success) {
      return {
        success: true,
        message: `Sincronizado: ${uploadResult.synced} enviados, ${downloadResult.imported} recebidos`
      };
    }

    return {
      success: false,
      message: 'Erro durante sincronização. Alguns dados podem não ter sido sincronizados.'
    };
  }

  async exportToJSON(userId: string): Promise<string> {
    const tables: TableName[] = ['receitas', 'despesas', 'dividas', 'saldos_bancarios', 'categorias'];
    const data: Record<string, any[]> = {};

    for (const table of tables) {
      data[table] = await sqliteService.getAll(table, userId);
    }

    return JSON.stringify(data, null, 2);
  }

  async importFromJSON(userId: string, jsonData: string): Promise<{ success: boolean; imported: number }> {
    try {
      const data = JSON.parse(jsonData);
      let imported = 0;

      for (const [table, records] of Object.entries(data)) {
        if (Array.isArray(records)) {
          for (const record of records) {
            await sqliteService.insert(table, { ...record, user_id: userId, synced: 0 });
            imported++;
          }
        }
      }

      return { success: true, imported };
    } catch (error) {
      console.error('Import from JSON failed:', error);
      return { success: false, imported: 0 };
    }
  }
}

export const syncService = new SyncService();
