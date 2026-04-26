import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/google-calendar";
import { db, isDemoMode } from "@/lib/db";
import { calendarConnections } from "@/lib/db/schema";

/**
 * GET /api/integrations/google-calendar/callback
 * Handles the OAuth callback from Google, stores tokens.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // userId
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/dashboard/integrations?error=${error}`, request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/dashboard/integrations?error=missing_params", request.url)
    );
  }

  try {
    const tokens = await exchangeCodeForTokens(code);

    if (isDemoMode()) {
      console.log("📅 Calendar connected (demo mode):", {
        userId: state,
        hasAccessToken: !!tokens.access_token,
        hasRefreshToken: !!tokens.refresh_token,
      });
    } else {
      // Store the connection in the database
      await db!.insert(calendarConnections).values({
        userId: state,
        provider: "google",
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token!,
        tokenExpiresAt: tokens.expiry_date
          ? new Date(tokens.expiry_date)
          : null,
        isPrimary: true,
      });
    }

    return NextResponse.redirect(
      new URL("/dashboard/integrations?connected=google", request.url)
    );
  } catch (err) {
    console.error("Calendar OAuth error:", err);
    return NextResponse.redirect(
      new URL("/dashboard/integrations?error=token_exchange_failed", request.url)
    );
  }
}
