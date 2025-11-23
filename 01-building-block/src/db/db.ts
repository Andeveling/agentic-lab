import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

// Crear la instancia de la base de datos
const dbUrl = process.env.DB_FILE_NAME || './drizzle/sqlite.db';
const client = createClient({
  url: dbUrl.startsWith('file:') ? dbUrl : `file:${dbUrl}`,
});

// Crear el cliente drizzle
export const db = drizzle(client);
