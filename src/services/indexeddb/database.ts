import { openDB, IDBPDatabase } from 'idb';

export interface OfflineRecord {
  id: string;
  user_id: string;
  synced: boolean;
  deleted: boolean;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

class IndexedDBService {
  private db: IDBPDatabase | null = null;
  private dbName = 'finanza_offline';
  private dbVersion = 1;
  private stores = ['receitas', 'despesas', 'dividas', 'saldos_bancarios', 'categorias', 'sync_meta'] as const;

  async initialize(): Promise<boolean> {
    try {
      this.db = await openDB(this.dbName, this.dbVersion, {
        upgrade(db) {
          // Data stores
          const dataStores = ['receitas', 'despesas', 'dividas', 'saldos_bancarios', 'categorias'];
          
          for (const storeName of dataStores) {
            if (!db.objectStoreNames.contains(storeName)) {
              const store = db.createObjectStore(storeName, { keyPath: 'id' });
              store.createIndex('by-user', 'user_id');
              store.createIndex('by-synced', 'synced');
              
              if (storeName !== 'saldos_bancarios') {
                store.createIndex('by-month', ['user_id', 'mes_referencia']);
              }
              
              if (storeName === 'categorias') {
                store.createIndex('by-tipo', ['user_id', 'tipo']);
              }
            }
          }

          // Sync metadata store
          if (!db.objectStoreNames.contains('sync_meta')) {
            db.createObjectStore('sync_meta', { keyPath: 'key' });
          }
        },
      });

      console.log('IndexedDB initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
      return false;
    }
  }

  isAvailable(): boolean {
    return this.db !== null;
  }

  async getAll(storeName: string, userId: string): Promise<OfflineRecord[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const tx = this.db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const index = store.index('by-user');
    const items = await index.getAll(userId);
    return (items as OfflineRecord[]).filter(item => !item.deleted);
  }

  async getByMonth(storeName: string, userId: string, mesReferencia: string): Promise<OfflineRecord[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const tx = this.db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const index = store.index('by-month');
    const items = await index.getAll([userId, mesReferencia]);
    return (items as OfflineRecord[]).filter(item => !item.deleted);
  }

  async getById(storeName: string, id: string): Promise<OfflineRecord | undefined> {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.get(storeName, id) as Promise<OfflineRecord | undefined>;
  }

  async put(storeName: string, data: OfflineRecord): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.put(storeName, data) as Promise<string>;
  }

  async delete(storeName: string, id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    // Soft delete - mark as deleted for sync
    const item = await this.getById(storeName, id);
    if (item) {
      await this.db.put(storeName, { ...item, deleted: true, synced: false });
    }
  }

  async hardDelete(storeName: string, id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.delete(storeName, id);
  }

  async getUnsynced(storeName: string): Promise<OfflineRecord[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const tx = this.db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const index = store.index('by-synced');
    return index.getAll(IDBKeyRange.only(false)) as Promise<OfflineRecord[]>;
  }

  async markAsSynced(storeName: string, id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const item = await this.getById(storeName, id);
    if (item) {
      await this.db.put(storeName, { ...item, synced: true });
    }
  }

  async clearStore(storeName: string, userId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const items = await this.getAll(storeName, userId);
    const tx = this.db.transaction(storeName, 'readwrite');
    for (const item of items) {
      await tx.store.delete(item.id);
    }
    await tx.done;
  }

  // Sync metadata
  async getSyncMeta(key: string): Promise<string | number | boolean | null> {
    if (!this.db) throw new Error('Database not initialized');
    const meta = await this.db.get('sync_meta', key) as { key: string; value: any } | undefined;
    return meta?.value ?? null;
  }

  async setSyncMeta(key: string, value: string | number | boolean): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.put('sync_meta', { key, value });
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

export const indexedDBService = new IndexedDBService();
