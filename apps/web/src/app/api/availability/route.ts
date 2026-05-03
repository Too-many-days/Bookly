import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots, getUserBySlug, getEventTypeBySlug, getDefaultSchedule, createSchedule, upsertScheduleRules } from "@/lib/dal";
import { auth } from "@/lib/auth";

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

/**
 * PUT /api/availability — Save schedule rules
 * Body: { rules: Array<{ dayOfWeek: number, startTime: string, endTime: string }> }
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { rules } = body;

    if (!Array.isArray(rules)) {
      return NextResponse.json(
        { error: "Rules array is required" },
        { status: 400 }
      );
    }

    // Get or create default schedule
    let scheduleData = await getDefaultSchedule(session.user.id);

    if (!scheduleData) {
      const newSchedule = await createSchedule({
        userId: session.user.id,
        name: "Working Hours",
        timezone: "UTC",
        isDefault: true,
      });
      scheduleData = { schedule: newSchedule, rules: [] };
    }

    // Upsert the rules
    const updatedRules = await upsertScheduleRules(
      scheduleData.schedule.id,
      rules
    );

    return NextResponse.json({
      schedule: scheduleData.schedule,
      rules: updatedRules,
    });
  } catch (error) {
    console.error("Availability PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
