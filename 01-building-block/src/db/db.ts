import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

// Crear la instancia de la base de datos
const client = createClient({
  url: process.env.DB_FILE_NAME || 'file:./drizzle/sqlite.db',
});

// Crear el cliente drizzle
export const db = drizzle(client);
