import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

// Turso（libSQL）クライアントの作成
const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Drizzle ORMインスタンスの作成
export const db = drizzle(client, { schema });

// 型エクスポート
export * from './schema';
