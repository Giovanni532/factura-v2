import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from '@/db/schema';

// Configuration Drizzle avec LibSQL (compatible avec tous les environnements)
const client = createClient({
  url: `file:${process.env.DB_FILE_NAME || 'local.db'}`
});

export const db = drizzle(client, { schema }); 