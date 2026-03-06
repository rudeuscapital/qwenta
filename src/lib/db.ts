import pg from "pg";
const { Pool } = pg;

let pool: InstanceType<typeof Pool> | null = null;

export function getDb() {
  if (!pool) {
    pool = new Pool({ connectionString: import.meta.env.DATABASE_URL, max: 10 });
    pool.on("error", (err) => console.error("PG pool error:", err));
  }
  return pool;
}

export async function query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]> {
  const result = await getDb().query(sql, params);
  return result.rows as T[];
}

export async function queryOne<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}
