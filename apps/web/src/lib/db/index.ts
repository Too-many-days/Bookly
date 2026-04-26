import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Connection string from environment
const connectionString = process.env.DATABASE_URL;

// Create a singleton postgres client
let client: ReturnType<typeof postgres> | null = null;

function getClient() {
  if (!connectionString) {
    // Return null if no DATABASE_URL — app runs in demo mode with mock data
    return null;
  }
  if (!client) {
    client = postgres(connectionString, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }
  return client;
}

// Export the drizzle db instance (or null for demo mode)
const pgClient = getClient();
export const db = pgClient ? drizzle(pgClient, { schema }) : null;

// Helper to check if we're in demo mode
export function isDemoMode(): boolean {
  return db === null;
}
