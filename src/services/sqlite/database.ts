import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

class SQLiteService {
  private sqlite: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;
  private isNative: boolean;
  private dbName = 'finanza_db';

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
    this.isNative = Capacitor.isNativePlatform();
  }

  async initialize(): Promise<boolean> {
    if (!this.isNative) {
      console.log('SQLite: Running on web, skipping native SQLite initialization');
      return false;
    }

    try {
      // Check connection consistency
      const retCC = await this.sqlite.checkConnectionsConsistency();
      const isConn = (await this.sqlite.isConnection(this.dbName, false)).result;

      if (retCC.result && isConn) {
        this.db = await this.sqlite.retrieveConnection(this.dbName, false);
      } else {
        this.db = await this.sqlite.createConnection(
          this.dbName,
          false,
          'no-encryption',
          1,
          false
        );
      }

      await this.db.open();
      await this.createTables();
      
      console.log('SQLite: Database initialized successfully');
      return true;
    } catch (error) {
      console.error('SQLite: Error initializing database:', error);
      return false;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) return;

    const createTableStatements = `
      CREATE TABLE IF NOT EXISTS receitas (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        descricao TEXT NOT NULL,
        valor REAL NOT NULL,
        categoria TEXT NOT NULL,
        data_recebimento TEXT NOT NULL,
        mes_referencia TEXT NOT NULL,
        observacoes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        synced INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS despesas (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        descricao TEXT NOT NULL,
        valor REAL NOT NULL,
        categoria TEXT NOT NULL,
        data_pagamento TEXT NOT NULL,
        data_vencimento TEXT,
        mes_referencia TEXT NOT NULL,
        status TEXT DEFAULT 'a_pagar',
        recorrente INTEGER DEFAULT 0,
        frequencia_recorrencia TEXT DEFAULT 'mensal',
        proxima_cobranca TEXT,
        alerta_ativo INTEGER DEFAULT 0,
        observacoes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        synced INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS dividas (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        descricao TEXT NOT NULL,
        valor_total REAL NOT NULL,
        valor_pago REAL DEFAULT 0,
        valor_restante REAL NOT NULL,
        categoria TEXT,
        data_vencimento TEXT,
        mes_referencia TEXT,
        status TEXT DEFAULT 'pendente',
        observacoes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        synced INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS saldos_bancarios (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        banco TEXT NOT NULL,
        tipo_conta TEXT DEFAULT 'corrente',
        saldo REAL DEFAULT 0,
        agencia TEXT,
        numero_conta TEXT,
        observacoes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        synced INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS categorias (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        nome TEXT NOT NULL,
        tipo TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        synced INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS sync_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_name TEXT NOT NULL,
        record_id TEXT NOT NULL,
        operation TEXT NOT NULL,
        synced_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await this.db.execute(createTableStatements);
  }

  async query<T>(sql: string, values?: any[]): Promise<T[]> {
    if (!this.db || !this.isNative) return [];

    try {
      const result = await this.db.query(sql, values);
      return (result.values || []) as T[];
    } catch (error) {
      console.error('SQLite: Query error:', error);
      return [];
    }
  }

  async run(sql: string, values?: any[]): Promise<boolean> {
    if (!this.db || !this.isNative) return false;

    try {
      await this.db.run(sql, values);
      return true;
    } catch (error) {
      console.error('SQLite: Run error:', error);
      return false;
    }
  }

  async insert(table: string, data: Record<string, any>): Promise<boolean> {
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);

    return this.run(
      `INSERT OR REPLACE INTO ${table} (${columns}) VALUES (${placeholders})`,
      values
    );
  }

  async update(table: string, data: Record<string, any>, whereClause: string, whereValues: any[]): Promise<boolean> {
    const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), ...whereValues];

    return this.run(
      `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`,
      values
    );
  }

  async delete(table: string, whereClause: string, whereValues: any[]): Promise<boolean> {
    return this.run(`DELETE FROM ${table} WHERE ${whereClause}`, whereValues);
  }

  async getAll<T>(table: string, userId: string): Promise<T[]> {
    return this.query<T>(`SELECT * FROM ${table} WHERE user_id = ?`, [userId]);
  }

  async getByMonth<T>(table: string, userId: string, mesReferencia: string): Promise<T[]> {
    return this.query<T>(
      `SELECT * FROM ${table} WHERE user_id = ? AND mes_referencia = ?`,
      [userId, mesReferencia]
    );
  }

  async getUnsynced(table: string): Promise<any[]> {
    return this.query(`SELECT * FROM ${table} WHERE synced = 0`, []);
  }

  async markAsSynced(table: string, id: string): Promise<boolean> {
    return this.run(`UPDATE ${table} SET synced = 1 WHERE id = ?`, [id]);
  }

  async clearTable(table: string, userId: string): Promise<boolean> {
    return this.run(`DELETE FROM ${table} WHERE user_id = ?`, [userId]);
  }

  isAvailable(): boolean {
    return this.isNative && this.db !== null;
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      await this.sqlite.closeConnection(this.dbName, false);
      this.db = null;
    }
  }
}

export const sqliteService = new SQLiteService();
