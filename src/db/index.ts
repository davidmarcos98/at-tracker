import { drizzle } from 'drizzle-orm/postgres-js';
import { upstashCache } from "drizzle-orm/cache/upstash";
import * as schema from "@/db/schema";

import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;
const queryClient = postgres(connectionString as string);

export const db = drizzle(queryClient, { 
  schema: schema,
  cache: upstashCache({
    url: process.env.UPSTASH_REDIS_REST_URL as string,
    token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
    global: true,
    config: { ex: 1800 }
  }),
});
