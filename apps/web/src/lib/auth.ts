import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import { getUserByEmail, createUser } from "./dal";

// Generate a slug from the user's name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    + "-" + Math.random().toString(36).slice(2, 6);
}

// Build providers list dynamically
const providers: NextAuthConfig["providers"] = [];

// Only add Google if both env vars are set
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    })
  );
}

// Always add credentials provider
providers.push(
  Credentials({
    name: "Demo Login",
    credentials: {
      email: { label: "Email", type: "email", placeholder: "jane@bookly.app" },
    },
    async authorize(credentials) {
      const email = credentials?.email as string;
      if (!email) return null;

      return {
        id: "user-001",
        email,
        name: email.split("@")[0].replace(/[.-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        image: null,
      };
    },
  })
);

export const authConfig: NextAuthConfig = {
  providers,
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      // Check if user exists in our DB, if not create them
      try {
        const existingUser = await getUserByEmail(user.email);
        if (!existingUser) {
          await createUser({
            email: user.email,
            name: user.name || "User",
            slug: generateSlug(user.name || "user"),
            avatarUrl: user.image || undefined,
            timezone: "America/New_York",
          });
        }
      } catch (err) {
        // In demo mode, this is fine
        console.log("Auth: user lookup skipped (demo mode)");
      }

      return true;
    },
    async session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        // Look up our internal user ID
        try {
          const dbUser = await getUserByEmail(user.email!);
          if (dbUser) {
            token.sub = dbUser.id;
          }
        } catch {
          token.sub = user.id;
        }
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  debug: process.env.NODE_ENV === "development",
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
