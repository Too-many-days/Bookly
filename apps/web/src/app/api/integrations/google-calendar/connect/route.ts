import { NextRequest, NextResponse } from "next/server";
import { getCalendarAuthUrl } from "@/lib/google-calendar";
import { auth } from "@/lib/auth";

/**
 * GET /api/integrations/google-calendar/connect
 * Redirects the user to Google's OAuth consent screen for Calendar access.
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const authUrl = getCalendarAuthUrl(session.user.id);
  return NextResponse.redirect(authUrl);
}
