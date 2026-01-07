import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from "@/db/schema";

import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;
const queryClient = postgres(connectionString as string, {ssl: true});

export const db = drizzle(queryClient, { schema });
