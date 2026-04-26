import { NextRequest, NextResponse } from "next/server";
import {
  createBooking,
  getUserBySlug,
  getEventTypeBySlug,
  getAvailableSlots,
} from "@/lib/dal";
import { sendBookingConfirmation } from "@/lib/email";

/**
 * POST /api/bookings
 *
 * Public endpoint — creates a new booking.
 * Body: { slug, eventSlug, date, time, name, email, timezone, notes?, customFields? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, eventSlug, date, time, name, email, timezone, notes, customFields } =
      body;

    // Validate required fields
    if (!slug || !eventSlug || !date || !time || !name || !email) {
      return NextResponse.json(
        {
          error: "Missing required fields: slug, eventSlug, date, time, name, email",
        },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
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

    // Parse the booking time
    const [hours, minutes] = time.split(":").map(Number);
    const startTime = new Date(date + "T00:00:00");
    startTime.setHours(hours, minutes, 0, 0);

    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + eventType.durationMinutes);

    // Verify the slot is still available (optimistic locking)
    const availableSlots = await getAvailableSlots(
      user.id,
      new Date(date),
      eventType.id
    );
    const slotAvailable = availableSlots.some((s) => s.start === time);

    if (!slotAvailable) {
      return NextResponse.json(
        {
          error: "This time slot is no longer available. Please choose another time.",
        },
        { status: 409 }
      );
    }

    // Create the booking
    const booking = await createBooking({
      eventTypeId: eventType.id,
      userId: user.id,
      guestName: name,
      guestEmail: email,
      guestTimezone: timezone || "UTC",
      guestNotes: notes || null,
      startTime,
      endTime,
      status: "confirmed",
      customFieldResponses: customFields || null,
      meetingUrl: eventType.locationValue || null,
    });

    // Send confirmation email (non-blocking)
    sendBookingConfirmation({
      guestName: name,
      guestEmail: email,
      hostName: user.name,
      hostEmail: user.email,
      eventTitle: eventType.title,
      startTime,
      endTime,
      timezone: timezone || "UTC",
      meetingUrl: eventType.locationValue || undefined,
      notes: notes || undefined,
    }).catch((err) => {
      console.error("Failed to send confirmation email:", err);
    });

    return NextResponse.json(
      {
        success: true,
        booking: {
          id: booking.id,
          eventType: eventType.title,
          startTime: booking.startTime,
          endTime: booking.endTime,
          meetingUrl: booking.meetingUrl,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Booking API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
