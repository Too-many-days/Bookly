import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  time,
  date,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";

// ─── Enums ───────────────────────────────────────────────────

export const planTierEnum = pgEnum("plan_tier", ["free", "pro", "business"]);
export const bookingStatusEnum = pgEnum("booking_status", [
  "confirmed",
  "cancelled",
  "completed",
  "no_show",
]);
export const locationTypeEnum = pgEnum("location_type", [
  "video",
  "phone",
  "in_person",
  "custom",
]);
export const calendarProviderEnum = pgEnum("calendar_provider", [
  "google",
  "outlook",
]);

// ─── Users ───────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  avatarUrl: text("avatar_url"),
  timezone: varchar("timezone", { length: 100 }).notNull().default("UTC"),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  planTier: planTierEnum("plan_tier").notNull().default("free"),
  branding: jsonb("branding").$type<{
    accentColor?: string;
    logoUrl?: string;
    customCss?: string;
  }>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Event Types ─────────────────────────────────────────────

export const eventTypes = pgTable("event_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  description: text("description"),
  durationMinutes: integer("duration_minutes").notNull().default(30),
  locationType: locationTypeEnum("location_type").notNull().default("video"),
  locationValue: text("location_value"),
  color: varchar("color", { length: 7 }).notNull().default("#6366f1"),
  bufferBeforeMins: integer("buffer_before_mins").notNull().default(0),
  bufferAfterMins: integer("buffer_after_mins").notNull().default(0),
  maxBookingsPerDay: integer("max_bookings_per_day"),
  bookingWindowDays: integer("booking_window_days").notNull().default(60),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  customFields: jsonb("custom_fields").$type<
    Array<{
      id: string;
      label: string;
      type: "text" | "textarea" | "select" | "checkbox";
      required: boolean;
      options?: string[];
    }>
  >(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Availability Schedules ──────────────────────────────────

export const availabilitySchedules = pgTable("availability_schedules", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  timezone: varchar("timezone", { length: 100 }).notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Schedule Rules ──────────────────────────────────────────

export const scheduleRules = pgTable("schedule_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  scheduleId: uuid("schedule_id")
    .notNull()
    .references(() => availabilitySchedules.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week"), // 0=Sunday, 6=Saturday
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  specificDate: date("specific_date"),
  isOverride: boolean("is_override").notNull().default(false),
});

// ─── Calendar Connections ────────────────────────────────────

export const calendarConnections = pgTable("calendar_connections", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  provider: calendarProviderEnum("provider").notNull(),
  externalId: varchar("external_id", { length: 255 }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at"),
  isPrimary: boolean("is_primary").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Bookings ────────────────────────────────────────────────

export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventTypeId: uuid("event_type_id")
    .notNull()
    .references(() => eventTypes.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  guestName: varchar("guest_name", { length: 255 }).notNull(),
  guestEmail: varchar("guest_email", { length: 255 }).notNull(),
  guestTimezone: varchar("guest_timezone", { length: 100 }).notNull(),
  guestNotes: text("guest_notes"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: bookingStatusEnum("status").notNull().default("confirmed"),
  externalCalendarEventId: varchar("external_calendar_event_id", {
    length: 255,
  }),
  cancellationReason: text("cancellation_reason"),
  customFieldResponses: jsonb("custom_field_responses").$type<
    Record<string, string | boolean>
  >(),
  meetingUrl: text("meeting_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  cancelledAt: timestamp("cancelled_at"),
});

// ─── Type Exports ────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type EventType = typeof eventTypes.$inferSelect;
export type NewEventType = typeof eventTypes.$inferInsert;
export type AvailabilitySchedule = typeof availabilitySchedules.$inferSelect;
export type ScheduleRule = typeof scheduleRules.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type CalendarConnection = typeof calendarConnections.$inferSelect;
