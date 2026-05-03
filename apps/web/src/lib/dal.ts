/**
 * Data Access Layer
 * ─────────────────
 * All database queries go through here. When DATABASE_URL is not set,
 * these functions return mock data for development / demo purposes.
 */

import { db, isDemoMode } from "./db";
import { eq, and, gte, lte, asc, desc, sql } from "drizzle-orm";
import {
  users,
  eventTypes,
  bookings,
  availabilitySchedules,
  scheduleRules,
  type User,
  type EventType,
  type Booking,
  type NewBooking,
  type NewEventType,
  type AvailabilitySchedule,
  type ScheduleRule,
} from "./db/schema";
import {
  demoUser,
  demoEventTypes,
  demoBookings,
  demoSchedule,
  demoScheduleRules,
} from "./mock-data";

// ─── Users ───────────────────────────────────────────────────

export async function getUserBySlug(slug: string): Promise<User | null> {
  if (isDemoMode()) {
    return demoUser.slug === slug ? demoUser : null;
  }
  const result = await db!.select().from(users).where(eq(users.slug, slug)).limit(1);
  return result[0] ?? null;
}

export async function getUserById(id: string): Promise<User | null> {
  if (isDemoMode()) {
    return demoUser.id === id ? demoUser : null;
  }
  const result = await db!.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] ?? null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  if (isDemoMode()) {
    return demoUser.email === email ? demoUser : null;
  }
  const result = await db!.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] ?? null;
}

export async function createUser(data: {
  email: string;
  name: string;
  slug: string;
  avatarUrl?: string;
  timezone?: string;
}): Promise<User> {
  if (isDemoMode()) {
    return { ...demoUser, ...data };
  }
  const result = await db!.insert(users).values(data).returning();
  return result[0];
}

export async function updateUser(
  id: string,
  data: Partial<Omit<User, "id" | "createdAt">>
): Promise<User | null> {
  if (isDemoMode()) {
    return { ...demoUser, ...data };
  }
  const result = await db!
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return result[0] ?? null;
}

// ─── Event Types ─────────────────────────────────────────────

export async function getEventTypesByUserId(userId: string): Promise<EventType[]> {
  if (isDemoMode()) {
    return demoEventTypes.filter((et) => et.userId === userId);
  }
  return db!
    .select()
    .from(eventTypes)
    .where(eq(eventTypes.userId, userId))
    .orderBy(asc(eventTypes.sortOrder));
}

export async function getEventTypeBySlug(
  userId: string,
  slug: string
): Promise<EventType | null> {
  if (isDemoMode()) {
    return (
      demoEventTypes.find((et) => et.userId === userId && et.slug === slug) ??
      null
    );
  }
  const result = await db!
    .select()
    .from(eventTypes)
    .where(and(eq(eventTypes.userId, userId), eq(eventTypes.slug, slug)))
    .limit(1);
  return result[0] ?? null;
}

export async function getEventTypeById(id: string): Promise<EventType | null> {
  if (isDemoMode()) {
    return demoEventTypes.find((et) => et.id === id) ?? null;
  }
  const result = await db!
    .select()
    .from(eventTypes)
    .where(eq(eventTypes.id, id))
    .limit(1);
  return result[0] ?? null;
}

export async function createEventType(data: NewEventType): Promise<EventType> {
  if (isDemoMode()) {
    const newET: EventType = {
      id: `evt-${Date.now()}`,
      userId: data.userId,
      title: data.title,
      slug: data.slug,
      description: data.description ?? null,
      durationMinutes: data.durationMinutes ?? 30,
      locationType: data.locationType ?? "video",
      locationValue: data.locationValue ?? null,
      color: data.color ?? "#6366f1",
      bufferBeforeMins: data.bufferBeforeMins ?? 0,
      bufferAfterMins: data.bufferAfterMins ?? 0,
      maxBookingsPerDay: data.maxBookingsPerDay ?? null,
      bookingWindowDays: data.bookingWindowDays ?? 60,
      isActive: data.isActive ?? true,
      sortOrder: data.sortOrder ?? 0,
      customFields: data.customFields ?? null,
      createdAt: new Date(),
    };
    demoEventTypes.push(newET);
    return newET;
  }
  const result = await db!.insert(eventTypes).values(data).returning();
  return result[0];
}

export async function updateEventType(
  id: string,
  data: Partial<Omit<EventType, "id" | "userId" | "createdAt">>
): Promise<EventType | null> {
  if (isDemoMode()) {
    const idx = demoEventTypes.findIndex((et) => et.id === id);
    if (idx === -1) return null;
    Object.assign(demoEventTypes[idx], data);
    return demoEventTypes[idx];
  }
  const result = await db!
    .update(eventTypes)
    .set(data)
    .where(eq(eventTypes.id, id))
    .returning();
  return result[0] ?? null;
}

export async function deleteEventType(id: string): Promise<boolean> {
  if (isDemoMode()) {
    const idx = demoEventTypes.findIndex((et) => et.id === id);
    if (idx === -1) return false;
    demoEventTypes.splice(idx, 1);
    return true;
  }
  const result = await db!
    .delete(eventTypes)
    .where(eq(eventTypes.id, id))
    .returning();
  return result.length > 0;
}

// ─── Availability ────────────────────────────────────────────

export async function getDefaultSchedule(
  userId: string
): Promise<{ schedule: AvailabilitySchedule; rules: ScheduleRule[] } | null> {
  if (isDemoMode()) {
    return {
      schedule: demoSchedule,
      rules: demoScheduleRules,
    };
  }
  const schedule = await db!
    .select()
    .from(availabilitySchedules)
    .where(
      and(
        eq(availabilitySchedules.userId, userId),
        eq(availabilitySchedules.isDefault, true)
      )
    )
    .limit(1);

  if (!schedule[0]) return null;

  const rules = await db!
    .select()
    .from(scheduleRules)
    .where(eq(scheduleRules.scheduleId, schedule[0].id));

  return { schedule: schedule[0], rules };
}

export async function getScheduleRules(scheduleId: string): Promise<ScheduleRule[]> {
  if (isDemoMode()) {
    return demoScheduleRules.filter((r) => r.scheduleId === scheduleId);
  }
  return db!
    .select()
    .from(scheduleRules)
    .where(eq(scheduleRules.scheduleId, scheduleId));
}

export async function createSchedule(data: {
  userId: string;
  name: string;
  timezone: string;
  isDefault: boolean;
}): Promise<AvailabilitySchedule> {
  if (isDemoMode()) {
    return { ...demoSchedule, ...data };
  }
  const result = await db!
    .insert(availabilitySchedules)
    .values(data)
    .returning();
  return result[0];
}

export async function upsertScheduleRules(
  scheduleId: string,
  rules: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>
): Promise<ScheduleRule[]> {
  if (isDemoMode()) {
    return demoScheduleRules;
  }
  // Delete existing non-override rules for this schedule
  await db!
    .delete(scheduleRules)
    .where(
      and(
        eq(scheduleRules.scheduleId, scheduleId),
        eq(scheduleRules.isOverride, false)
      )
    );

  if (rules.length === 0) return [];

  // Insert new rules
  const result = await db!
    .insert(scheduleRules)
    .values(
      rules.map((r) => ({
        scheduleId,
        dayOfWeek: r.dayOfWeek,
        startTime: r.startTime,
        endTime: r.endTime,
        isOverride: false,
      }))
    )
    .returning();

  return result;
}

// ─── Bookings ────────────────────────────────────────────────

export async function getBookingsByUserId(
  userId: string,
  options?: {
    status?: string;
    from?: Date;
    to?: Date;
    limit?: number;
  }
): Promise<Booking[]> {
  if (isDemoMode()) {
    let filtered = demoBookings.filter((b) => b.userId === userId);
    if (options?.status) {
      filtered = filtered.filter((b) => b.status === options.status);
    }
    if (options?.from) {
      filtered = filtered.filter((b) => b.startTime >= options.from!);
    }
    if (options?.to) {
      filtered = filtered.filter((b) => b.startTime <= options.to!);
    }
    filtered.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    if (options?.limit) {
      filtered = filtered.slice(0, options.limit);
    }
    return filtered;
  }

  let query = db!
    .select()
    .from(bookings)
    .where(eq(bookings.userId, userId))
    .orderBy(asc(bookings.startTime));

  // Note: more complex filters would use `and()` with conditions
  return query;
}

export async function getBookingsByDateRange(
  userId: string,
  start: Date,
  end: Date
): Promise<Booking[]> {
  if (isDemoMode()) {
    return demoBookings.filter(
      (b) =>
        b.userId === userId &&
        b.status === "confirmed" &&
        b.startTime >= start &&
        b.endTime <= end
    );
  }
  return db!
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.userId, userId),
        eq(bookings.status, "confirmed"),
        gte(bookings.startTime, start),
        lte(bookings.endTime, end)
      )
    );
}

export async function createBooking(data: NewBooking): Promise<Booking> {
  if (isDemoMode()) {
    const newBooking: Booking = {
      id: `book-${Date.now()}`,
      eventTypeId: data.eventTypeId,
      userId: data.userId,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestTimezone: data.guestTimezone,
      guestNotes: data.guestNotes ?? null,
      startTime: data.startTime,
      endTime: data.endTime,
      status: data.status ?? "confirmed",
      externalCalendarEventId: null,
      cancellationReason: null,
      customFieldResponses: data.customFieldResponses ?? null,
      meetingUrl: data.meetingUrl ?? null,
      createdAt: new Date(),
      cancelledAt: null,
    };
    demoBookings.push(newBooking);
    return newBooking;
  }
  const result = await db!.insert(bookings).values(data).returning();
  return result[0];
}

export async function cancelBooking(
  id: string,
  reason?: string
): Promise<Booking | null> {
  if (isDemoMode()) {
    const booking = demoBookings.find((b) => b.id === id);
    if (!booking) return null;
    booking.status = "cancelled";
    booking.cancellationReason = reason ?? null;
    booking.cancelledAt = new Date();
    return booking;
  }
  const result = await db!
    .update(bookings)
    .set({
      status: "cancelled",
      cancellationReason: reason ?? null,
      cancelledAt: new Date(),
    })
    .where(eq(bookings.id, id))
    .returning();
  return result[0] ?? null;
}

// ─── Availability Engine ─────────────────────────────────────

export interface TimeSlot {
  start: string; // HH:mm
  end: string; // HH:mm
  display: string; // "10:00 AM"
}

/**
 * Calculate available time slots for a given date.
 * Merges schedule rules with existing bookings to return open slots.
 */
export async function getAvailableSlots(
  userId: string,
  date: Date,
  eventTypeId: string
): Promise<TimeSlot[]> {
  // Get event type for duration
  const eventType = await getEventTypeById(eventTypeId);
  if (!eventType || !eventType.isActive) return [];

  // Get schedule rules for this day
  const scheduleData = await getDefaultSchedule(userId);
  if (!scheduleData) return [];

  const dayOfWeek = date.getDay();
  const dayRules = scheduleData.rules.filter(
    (r) => r.dayOfWeek === dayOfWeek && !r.isOverride
  );

  if (dayRules.length === 0) return [];

  // Get existing bookings for this day
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const existingBookings = await getBookingsByDateRange(userId, dayStart, dayEnd);

  // Generate slots
  const slots: TimeSlot[] = [];
  const duration = eventType.durationMinutes;
  const bufferBefore = eventType.bufferBeforeMins;
  const bufferAfter = eventType.bufferAfterMins;

  for (const rule of dayRules) {
    const [startH, startM] = rule.startTime.split(":").map(Number);
    const [endH, endM] = rule.endTime.split(":").map(Number);

    let currentMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    while (currentMinutes + duration <= endMinutes) {
      const slotStart = currentMinutes;
      const slotEnd = currentMinutes + duration;

      // Check for conflicts with existing bookings
      const slotStartDate = new Date(date);
      slotStartDate.setHours(Math.floor(slotStart / 60), slotStart % 60, 0, 0);
      const slotEndDate = new Date(date);
      slotEndDate.setHours(Math.floor(slotEnd / 60), slotEnd % 60, 0, 0);

      const hasConflict = existingBookings.some((booking) => {
        const bookingStart = booking.startTime.getTime() - bufferBefore * 60000;
        const bookingEnd = booking.endTime.getTime() + bufferAfter * 60000;
        return (
          slotStartDate.getTime() < bookingEnd &&
          slotEndDate.getTime() > bookingStart
        );
      });

      // Skip past slots for today
      const now = new Date();
      const isPast =
        date.toDateString() === now.toDateString() &&
        slotStartDate.getTime() <= now.getTime();

      if (!hasConflict && !isPast) {
        const h = Math.floor(slotStart / 60);
        const m = slotStart % 60;
        const period = h >= 12 ? "PM" : "AM";
        const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;

        slots.push({
          start: `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`,
          end: `${Math.floor(slotEnd / 60).toString().padStart(2, "0")}:${(slotEnd % 60).toString().padStart(2, "0")}`,
          display: `${displayH}:${m.toString().padStart(2, "0")} ${period}`,
        });
      }

      currentMinutes += 30; // 30-minute increment between slot starts
    }
  }

  // Apply max bookings per day limit
  if (eventType.maxBookingsPerDay) {
    const dayBookingCount = existingBookings.filter(
      (b) => b.eventTypeId === eventTypeId
    ).length;
    if (dayBookingCount >= eventType.maxBookingsPerDay) {
      return [];
    }
  }

  return slots;
}
