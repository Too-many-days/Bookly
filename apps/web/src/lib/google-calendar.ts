/**
 * Google Calendar Integration
 * ────────────────────────────
 * Handles OAuth flow, event creation/deletion, and busy-time checks.
 */

import { google, calendar_v3 } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
  process.env.AUTH_GOOGLE_ID,
  process.env.AUTH_GOOGLE_SECRET,
  `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/google-calendar/callback`
);

const SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.readonly",
];

// ─── OAuth Flow ──────────────────────────────────────────

/**
 * Generate the Google OAuth URL for calendar access.
 */
export function getCalendarAuthUrl(userId: string): string {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
    state: userId, // pass userId through OAuth state
  });
}

/**
 * Exchange auth code for tokens.
 */
export async function exchangeCodeForTokens(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

/**
 * Create an authenticated calendar client from stored tokens.
 */
function getCalendarClient(accessToken: string, refreshToken: string): calendar_v3.Calendar {
  const auth = new google.auth.OAuth2(
    process.env.AUTH_GOOGLE_ID,
    process.env.AUTH_GOOGLE_SECRET
  );
  auth.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  return google.calendar({ version: "v3", auth });
}

// ─── Event Management ────────────────────────────────────

interface CalendarEventData {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  guestEmail: string;
  guestName: string;
  hostEmail: string;
  meetingUrl?: string;
  timezone: string;
}

/**
 * Create a Google Calendar event when a booking is confirmed.
 * Returns the event ID for later cancellation.
 */
export async function createCalendarEvent(
  accessToken: string,
  refreshToken: string,
  data: CalendarEventData
): Promise<string | null> {
  try {
    const calendar = getCalendarClient(accessToken, refreshToken);

    const event = await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: data.title,
        description: [
          `Booking with ${data.guestName} (${data.guestEmail})`,
          data.description || "",
          data.meetingUrl ? `\nMeeting Link: ${data.meetingUrl}` : "",
          "\n—\nScheduled via Bookly",
        ]
          .filter(Boolean)
          .join("\n"),
        start: {
          dateTime: data.startTime.toISOString(),
          timeZone: data.timezone,
        },
        end: {
          dateTime: data.endTime.toISOString(),
          timeZone: data.timezone,
        },
        attendees: [
          { email: data.hostEmail, responseStatus: "accepted" },
          { email: data.guestEmail, responseStatus: "needsAction" },
        ],
        conferenceData: data.meetingUrl
          ? undefined
          : {
              createRequest: {
                requestId: `bookly-${Date.now()}`,
                conferenceSolutionKey: { type: "hangoutsMeet" },
              },
            },
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 60 },
            { method: "popup", minutes: 15 },
          ],
        },
      },
      conferenceDataVersion: data.meetingUrl ? 0 : 1,
      sendUpdates: "all",
    });

    return event.data.id || null;
  } catch (error) {
    console.error("Failed to create calendar event:", error);
    return null;
  }
}

/**
 * Delete a Google Calendar event when a booking is cancelled.
 */
export async function deleteCalendarEvent(
  accessToken: string,
  refreshToken: string,
  eventId: string
): Promise<boolean> {
  try {
    const calendar = getCalendarClient(accessToken, refreshToken);
    await calendar.events.delete({
      calendarId: "primary",
      eventId,
      sendUpdates: "all",
    });
    return true;
  } catch (error) {
    console.error("Failed to delete calendar event:", error);
    return false;
  }
}

// ─── Busy Time Check ─────────────────────────────────────

interface BusySlot {
  start: Date;
  end: Date;
}

/**
 * Get busy times from Google Calendar for conflict detection.
 * Used by the availability engine to filter out booked slots.
 */
export async function getBusyTimes(
  accessToken: string,
  refreshToken: string,
  timeMin: Date,
  timeMax: Date
): Promise<BusySlot[]> {
  try {
    const calendar = getCalendarClient(accessToken, refreshToken);

    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        items: [{ id: "primary" }],
      },
    });

    const busySlots =
      response.data.calendars?.primary?.busy?.map((slot) => ({
        start: new Date(slot.start!),
        end: new Date(slot.end!),
      })) || [];

    return busySlots;
  } catch (error) {
    console.error("Failed to get busy times:", error);
    return [];
  }
}

/**
 * Refresh an expired access token using the refresh token.
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<{ accessToken: string; expiresAt: Date } | null> {
  try {
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await oauth2Client.refreshAccessToken();
    return {
      accessToken: credentials.access_token!,
      expiresAt: new Date(credentials.expiry_date!),
    };
  } catch (error) {
    console.error("Failed to refresh token:", error);
    return null;
  }
}
