import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
}
console.log('Database URL:', connectionString);

const client = postgres(connectionString, {
    ssl: 'require'
});
export const db = drizzle(client);