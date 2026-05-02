/**
 * Server-side helper to get the authenticated user from the session.
 * Use in server components and API routes.
 */

import { auth } from "./auth";
import { getUserByEmail, getUserById } from "./dal";
import { redirect } from "next/navigation";
import type { User } from "./db/schema";

/**
 * Get the authenticated user's DB record.
 * Redirects to /login if not authenticated.
 */
export async function getAuthUser(): Promise<User> {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  // Try by ID first (if the session has a DB UUID), then fall back to email
  let user = null;

  if (session.user.id) {
    user = await getUserById(session.user.id);
  }

  if (!user && session.user.email) {
    user = await getUserByEmail(session.user.email);
  }

  if (!user) {
    // User authenticated but not in DB — redirect to login
    // This can happen if the DB was reset
    redirect("/login");
  }

  return user;
}

/**
 * Get the authenticated user or null (doesn't redirect).
 * Useful for layouts or optional auth checks.
 */
export async function getOptionalAuthUser(): Promise<User | null> {
  const session = await auth();

  if (!session?.user?.email) {
    return null;
  }

  let user = null;

  if (session.user.id) {
    user = await getUserById(session.user.id);
  }

  if (!user && session.user.email) {
    user = await getUserByEmail(session.user.email);
  }

  return user;
}
