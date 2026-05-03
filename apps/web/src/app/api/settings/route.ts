import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateUser, getUserById } from "@/lib/dal";

/**
 * PUT /api/settings — Update user profile settings
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, timezone } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: "Slug must only contain lowercase letters, numbers, and hyphens" },
        { status: 400 }
      );
    }

    const updatedUser = await updateUser(session.user.id, {
      name,
      slug,
      timezone: timezone || "UTC",
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Settings PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
