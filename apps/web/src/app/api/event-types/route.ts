import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getEventTypesByUserId,
  createEventType,
  updateEventType,
  deleteEventType,
} from "@/lib/dal";

/**
 * GET /api/event-types — List event types for authenticated user
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const eventTypes = await getEventTypesByUserId(session.user.id);
    return NextResponse.json({ eventTypes });
  } catch (error) {
    console.error("Event types GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/event-types — Create a new event type
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, durationMinutes, locationType, locationValue, color } =
      body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    const eventType = await createEventType({
      userId: session.user.id,
      title,
      slug,
      description: description || null,
      durationMinutes: durationMinutes || 30,
      locationType: locationType || "video",
      locationValue: locationValue || null,
      color: color || "#6366f1",
    });

    return NextResponse.json({ eventType }, { status: 201 });
  } catch (error) {
    console.error("Event types POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/event-types — Update an event type
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Event type ID is required" },
        { status: 400 }
      );
    }

    const eventType = await updateEventType(id, data);
    if (!eventType) {
      return NextResponse.json(
        { error: "Event type not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ eventType });
  } catch (error) {
    console.error("Event types PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/event-types — Delete an event type
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Event type ID is required" },
        { status: 400 }
      );
    }

    const deleted = await deleteEventType(id);
    if (!deleted) {
      return NextResponse.json(
        { error: "Event type not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Event types DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
