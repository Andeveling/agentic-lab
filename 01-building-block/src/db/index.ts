import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

// Crea la instancia de la base de datos
const sqlite = new Database('./drizzle/sqlite.db');

// Crea el cliente drizzle
export const db = drizzle(sqlite);
