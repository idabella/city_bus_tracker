// src/utils/oracle.ts
import oracledb from 'oracledb';
import dotenv from 'dotenv';

dotenv.config();

try {
  oracledb.initOracleClient({ 
    libDir: 'C:\\Program Files\\Oracle\\instantclient_21_19' 
  });
  console.log('✅ Oracle Instant Client 21_19 initialized');
} catch (err: any) {
  console.error('⚠️ Oracle Client init error:', err.message);
}

const oracleConfig = {
  user: process.env.VITE_ORACLE_USER || 'SYSTEM',
  password: process.env.VITE_ORACLE_PASSWORD || 'asensio21',
  connectString: process.env.VITE_ORACLE_CONNECT_STRING || 'localhost:1521/XEPDB1',
};

console.log('Oracle Config:', {
  user: oracleConfig.user,
  connectString: oracleConfig.connectString
});

let pool: oracledb.Pool | null = null;

export async function initializePool() {
  if (pool) {
    console.log('Pool already initialized');
    return pool;
  }

  try {
    pool = await oracledb.createPool({
      ...oracleConfig,
      poolMin: 2,
      poolMax: 10,
      poolIncrement: 1,
      poolTimeout: 60,
      enableStatistics: true,
    });
    console.log('✅ Oracle connection pool initialized');
    return pool;
  } catch (err: any) {
    console.error('❌ Error initializing Oracle pool:', err);
    throw err;
  }
}

export async function getConnection() {
  try {
    if (!pool) {
      await initializePool();
    }
    const connection = await pool!.getConnection();
    console.log('✅ Connection acquired from pool');
    return connection;
  } catch (err: any) {
    console.error('❌ Error getting connection:', err.message);
    throw err;
  }
}

export async function closePool() {
  if (pool) {
    try {
      await pool.close(10);
      pool = null;
      console.log('✅ Pool closed');
    } catch (err: any) {
      console.error('❌ Error closing pool:', err.message);
    }
  }
}

// ✅ Convertir les colonnes Oracle en minuscules
function convertKeysToLowercase(rows: any[]): any[] {
  if (!rows || !Array.isArray(rows)) return [];
  
  return rows.map(row => {
    const newRow: any = {};
    for (const key in row) {
      newRow[key.toLowerCase()] = row[key];
    }
    return newRow;
  });
}

// ✅ Convertir les dates au format Oracle
function convertDateToOracle(dateStr: string | null): string | null {
  if (!dateStr) return null;
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error converting date:', error);
    return null;
  }
}

// ✅ CORRECTION PRINCIPALE : Mapper les noms de colonnes frontend -> Oracle
function mapColumnNames(table: string, data: Record<string, any>): Record<string, any> {
  const mapped: Record<string, any> = {};
  
  // ✅ Mapping spécial pour STATIONS
  if (table === 'STATIONS') {
    for (const [key, value] of Object.entries(data)) {
      if (key.toLowerCase() === 'city_id') {
        // ✅ CORRECTION: city_id -> CITY_ID (pas ID_CITY)
        mapped['CITY_ID'] = value;
        console.log(`✅ Mapped city_id -> CITY_ID: ${value}`);
      } else {
        mapped[key.toUpperCase()] = value;
      }
    }
    return mapped;
  }
  
  // ✅ Mapping spécial pour BUS_LINES
  if (table === 'BUS_LINES') {
    for (const [key, value] of Object.entries(data)) {
      if (key.toLowerCase() === 'origin_station_id') {
        mapped['ORIGIN_STATION_ID'] = value;
        console.log(`✅ Mapped origin_station_id -> ORIGIN_STATION_ID: ${value}`);
      } else if (key.toLowerCase() === 'destination_station_id') {
        mapped['DESTINATION_STATION_ID'] = value;
        console.log(`✅ Mapped destination_station_id -> DESTINATION_STATION_ID: ${value}`);
      } else {
        mapped[key.toUpperCase()] = value;
      }
    }
    return mapped;
  }

  // ✅ Pour les autres tables, conversion simple en majuscules + conversion des dates
  for (const [key, value] of Object.entries(data)) {
    const upperKey = key.toUpperCase();
    
    if (key.toLowerCase().includes('date') && value && typeof value === 'string') {
      const oracleDate = convertDateToOracle(value);
      if (oracleDate) {
        mapped[upperKey] = oracleDate;
        console.log(`✅ Converted date ${key}: ${value} -> ${oracleDate}`);
      } else {
        mapped[upperKey] = null;
      }
    } else {
      mapped[upperKey] = value;
    }
  }
  
  return mapped;
}

export const oracle = {
  async select(table: string, columns = '*', where?: string) {
    const conn = await getConnection();
    try {
      const sql = `SELECT ${columns} FROM ${table}${where ? ` WHERE ${where}` : ''}`;
      console.log('Executing SELECT:', sql);
      
      const result = await conn.execute(sql, [], { 
        outFormat: oracledb.OUT_FORMAT_OBJECT 
      });
      
      const convertedRows = convertKeysToLowercase(result.rows as any[]);
      
      console.log(`✅ Found ${convertedRows.length} rows`);
      if (convertedRows.length > 0) {
        console.log('Sample row keys:', Object.keys(convertedRows[0]));
        console.log('Sample row:', convertedRows[0]);
      }
      
      return { data: convertedRows, error: null };
    } catch (error: any) {
      console.error('❌ SELECT Error:', error.message);
      return { data: null, error: error.message };
    } finally {
      await conn.close();
    }
  },

  async insert(table: string, data: Record<string, any>) {
    const conn = await getConnection();
    try {
      console.log('=== INSERT DEBUG ===');
      console.log('Table:', table);
      console.log('Input data:', data);
      
      const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);
      
      console.log('Clean data:', cleanData);
      
      const mappedData = mapColumnNames(table, cleanData);
      
      console.log('Mapped data:', mappedData);

      const columns: string[] = [];
      const placeholders: string[] = [];
      const values: any[] = [];
      
      Object.entries(mappedData).forEach(([key, value], index) => {
        columns.push(key);
        
        if (key.includes('DATE') && typeof value === 'string' && value.includes('-')) {
          placeholders.push(`TO_DATE(:${index + 1}, 'DD-MON-YYYY')`);
        } else {
          placeholders.push(`:${index + 1}`);
        }
        
        values.push(value);
      });
      
      const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;
      
      console.log('SQL:', sql);
      console.log('Values:', values);
      
      const result = await conn.execute(
        sql, 
        values, 
        { autoCommit: true }
      );
      
      console.log('✅ Insert successful, rows affected:', result.rowsAffected);
      
      const returnData = Object.entries(mappedData).reduce((acc, [key, value]) => {
        acc[key.toLowerCase()] = value;
        return acc;
      }, {} as Record<string, any>);
      
      return { data: returnData, error: null };
    } catch (error: any) {
      console.error('❌ INSERT Error:', error.message);
      console.error('Error details:', error);
      return { data: null, error: error.message };
    } finally {
      await conn.close();
    }
  },

  async update(table: string, data: Record<string, any>, where: string) {
    const conn = await getConnection();
    try {
      const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      const mappedData = mapColumnNames(table, cleanData);

      const sets: string[] = [];
      const values: any[] = [];
      
      Object.entries(mappedData).forEach(([key, value], index) => {
        if (key.includes('DATE') && typeof value === 'string' && value.includes('-')) {
          sets.push(`${key} = TO_DATE(:${index + 1}, 'DD-MON-YYYY')`);
        } else {
          sets.push(`${key} = :${index + 1}`);
        }
        values.push(value);
      });
      
      const sql = `UPDATE ${table} SET ${sets.join(', ')} WHERE ${where}`;
      
      console.log('Executing UPDATE:', sql, values);
      
      const result = await conn.execute(
        sql, 
        values, 
        { autoCommit: true }
      );
      
      console.log('✅ Update successful:', result.rowsAffected);
      return { data: mappedData, error: null };
    } catch (error: any) {
      console.error('❌ UPDATE Error:', error.message);
      return { data: null, error: error.message };
    } finally {
      await conn.close();
    }
  },

  async delete(table: string, where: string) {
    const conn = await getConnection();
    try {
      const sql = `DELETE FROM ${table} WHERE ${where}`;
      console.log('Executing DELETE:', sql);
      
      const result = await conn.execute(sql, [], { autoCommit: true });
      
      console.log('✅ Delete successful:', result.rowsAffected);
      return { data: true, error: null };
    } catch (error: any) {
      console.error('❌ DELETE Error:', error.message);
      return { data: null, error: error.message };
    } finally {
      await conn.close();
    }
  },

  from(table: string) {
    return {
      select: async (columns = '*') => {
        return oracle.select(table, columns);
      },
      insert: async (data: Record<string, any> | Record<string, any>[]) => {
        const dataToInsert = Array.isArray(data) ? data[0] : data;
        return oracle.insert(table, dataToInsert);
      },
      update: (data: Record<string, any>) => ({
        eq: async (column: string, value: any) => {
          const upperColumn = column.toUpperCase();
          const whereClause = typeof value === 'string' 
            ? `${upperColumn} = '${value.replace(/'/g, "''")}'`
            : `${upperColumn} = ${value}`;
          return oracle.update(table, data, whereClause);
        }
      }),
      delete: () => ({
        eq: async (column: string, value: any) => {
          const upperColumn = column.toUpperCase();
          const whereClause = typeof value === 'string' 
            ? `${upperColumn} = '${value.replace(/'/g, "''")}'`
            : `${upperColumn} = ${value}`;
          return oracle.delete(table, whereClause);
        }
      })
    };
  },

  async testConnection() {
    try {
      const conn = await getConnection();
      const result = await conn.execute('SELECT 1 FROM DUAL');
      await conn.close();
      console.log('✅ Oracle connection test successful');
      return { success: true, error: null };
    } catch (error: any) {
      console.error('❌ Oracle connection test failed:', error.message);
      return { success: false, error: error.message };
    }
  }
};

initializePool().catch((err) => {
  console.error('Failed to initialize pool on startup:', err);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing pool...');
  await closePool();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing pool...');
  await closePool();
  process.exit(0);
});