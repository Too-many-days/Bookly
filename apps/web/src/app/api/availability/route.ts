import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots, getUserBySlug, getEventTypeBySlug } from "@/lib/dal";

/**
 * GET /api/availability?slug=jane-cooper&event=strategy-session&date=2026-04-28
 *
 * Public endpoint — returns available time slots for a specific date.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const eventSlug = searchParams.get("event");
    const dateStr = searchParams.get("date");

    if (!slug || !eventSlug || !dateStr) {
      return NextResponse.json(
        { error: "Missing required params: slug, event, date" },
        { status: 400 }
      );
    }

    // Look up user
    const user = await getUserBySlug(slug);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Look up event type
    const eventType = await getEventTypeBySlug(user.id, eventSlug);
    if (!eventType || !eventType.isActive) {
      return NextResponse.json(
        { error: "Event type not found or inactive" },
        { status: 404 }
      );
    }

    // Parse date
    const date = new Date(dateStr + "T00:00:00");
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    // Check booking window
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const maxDate = new Date(now);
    maxDate.setDate(maxDate.getDate() + eventType.bookingWindowDays);

    if (date < now) {
      return NextResponse.json({ slots: [], message: "Date is in the past" });
    }
    if (date > maxDate) {
      return NextResponse.json({
        slots: [],
        message: "Date is outside booking window",
      });
    }

    // Get available slots
    const slots = await getAvailableSlots(user.id, date, eventType.id);

    return NextResponse.json({
      slots,
      eventType: {
        id: eventType.id,
        title: eventType.title,
        durationMinutes: eventType.durationMinutes,
        locationType: eventType.locationType,
        locationValue: eventType.locationValue,
      },
      user: {
        name: user.name,
        timezone: user.timezone,
      },
    });
  } catch (error) {
    console.error("Availability API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
