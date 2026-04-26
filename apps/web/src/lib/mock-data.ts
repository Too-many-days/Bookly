// Mock data store for demo purposes
// This will be replaced with real Drizzle + Supabase queries

import type { User, EventType, Booking, AvailabilitySchedule, ScheduleRule } from "./db/schema";

// ─── Demo User ───────────────────────────────────────────────

export const demoUser: User = {
  id: "user-001",
  email: "jane@bookly.app",
  name: "Jane Cooper",
  slug: "jane-cooper",
  avatarUrl: null,
  timezone: "America/New_York",
  stripeCustomerId: null,
  planTier: "pro",
  branding: { accentColor: "#6366f1" },
  createdAt: new Date("2025-01-15"),
  updatedAt: new Date("2026-04-20"),
};

// ─── Demo Event Types ────────────────────────────────────────

export const demoEventTypes: EventType[] = [
  {
    id: "evt-001",
    userId: "user-001",
    title: "Quick Chat",
    slug: "quick-chat",
    description: "A brief 15-minute introductory call to discuss your needs.",
    durationMinutes: 15,
    locationType: "video",
    locationValue: "Google Meet",
    color: "#06b6d4",
    bufferBeforeMins: 5,
    bufferAfterMins: 5,
    maxBookingsPerDay: 8,
    bookingWindowDays: 30,
    isActive: true,
    sortOrder: 0,
    customFields: null,
    createdAt: new Date("2025-02-01"),
  },
  {
    id: "evt-002",
    userId: "user-001",
    title: "Strategy Session",
    slug: "strategy-session",
    description: "A 30-minute deep-dive into your business strategy and growth plans.",
    durationMinutes: 30,
    locationType: "video",
    locationValue: "Zoom",
    color: "#6366f1",
    bufferBeforeMins: 10,
    bufferAfterMins: 10,
    maxBookingsPerDay: 4,
    bookingWindowDays: 60,
    isActive: true,
    sortOrder: 1,
    customFields: [
      { id: "q1", label: "What topics would you like to discuss?", type: "textarea", required: true },
    ],
    createdAt: new Date("2025-02-05"),
  },
  {
    id: "evt-003",
    userId: "user-001",
    title: "Full Consultation",
    slug: "full-consultation",
    description: "A comprehensive 60-minute consultation session with detailed follow-up.",
    durationMinutes: 60,
    locationType: "video",
    locationValue: "Google Meet",
    color: "#f59e0b",
    bufferBeforeMins: 15,
    bufferAfterMins: 15,
    maxBookingsPerDay: 2,
    bookingWindowDays: 90,
    isActive: true,
    sortOrder: 2,
    customFields: [
      { id: "q1", label: "What is your main goal?", type: "text", required: true },
      { id: "q2", label: "Company size", type: "select", required: false, options: ["1-5", "6-20", "21-50", "51+"] },
    ],
    createdAt: new Date("2025-02-10"),
  },
  {
    id: "evt-004",
    userId: "user-001",
    title: "Portfolio Review",
    slug: "portfolio-review",
    description: "Review and feedback on your portfolio, website, or marketing materials.",
    durationMinutes: 45,
    locationType: "video",
    locationValue: "Google Meet",
    color: "#ec4899",
    bufferBeforeMins: 5,
    bufferAfterMins: 10,
    maxBookingsPerDay: 3,
    bookingWindowDays: 45,
    isActive: false,
    sortOrder: 3,
    customFields: null,
    createdAt: new Date("2025-03-01"),
  },
];

// ─── Demo Schedule ───────────────────────────────────────────

export const demoSchedule: AvailabilitySchedule = {
  id: "sched-001",
  userId: "user-001",
  name: "Working Hours",
  timezone: "America/New_York",
  isDefault: true,
  createdAt: new Date("2025-01-15"),
};

export const demoScheduleRules: ScheduleRule[] = [
  // Monday - Friday: 9am to 5pm
  { id: "rule-001", scheduleId: "sched-001", dayOfWeek: 1, startTime: "09:00", endTime: "12:00", specificDate: null, isOverride: false },
  { id: "rule-002", scheduleId: "sched-001", dayOfWeek: 1, startTime: "13:00", endTime: "17:00", specificDate: null, isOverride: false },
  { id: "rule-003", scheduleId: "sched-001", dayOfWeek: 2, startTime: "09:00", endTime: "12:00", specificDate: null, isOverride: false },
  { id: "rule-004", scheduleId: "sched-001", dayOfWeek: 2, startTime: "13:00", endTime: "17:00", specificDate: null, isOverride: false },
  { id: "rule-005", scheduleId: "sched-001", dayOfWeek: 3, startTime: "09:00", endTime: "12:00", specificDate: null, isOverride: false },
  { id: "rule-006", scheduleId: "sched-001", dayOfWeek: 3, startTime: "13:00", endTime: "17:00", specificDate: null, isOverride: false },
  { id: "rule-007", scheduleId: "sched-001", dayOfWeek: 4, startTime: "09:00", endTime: "12:00", specificDate: null, isOverride: false },
  { id: "rule-008", scheduleId: "sched-001", dayOfWeek: 4, startTime: "13:00", endTime: "17:00", specificDate: null, isOverride: false },
  { id: "rule-009", scheduleId: "sched-001", dayOfWeek: 5, startTime: "09:00", endTime: "12:00", specificDate: null, isOverride: false },
  { id: "rule-010", scheduleId: "sched-001", dayOfWeek: 5, startTime: "13:00", endTime: "17:00", specificDate: null, isOverride: false },
];

// ─── Demo Bookings ───────────────────────────────────────────

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const dayAfter = new Date(today);
dayAfter.setDate(dayAfter.getDate() + 2);
const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 7);

function makeDate(base: Date, hours: number, minutes: number): Date {
  const d = new Date(base);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

export const demoBookings: Booking[] = [
  {
    id: "book-001",
    eventTypeId: "evt-002",
    userId: "user-001",
    guestName: "Alex Rivera",
    guestEmail: "alex@example.com",
    guestTimezone: "America/Los_Angeles",
    guestNotes: "Would love to discuss Q3 growth strategy",
    startTime: makeDate(tomorrow, 10, 0),
    endTime: makeDate(tomorrow, 10, 30),
    status: "confirmed",
    externalCalendarEventId: null,
    cancellationReason: null,
    customFieldResponses: { q1: "Growth strategy and team scaling" },
    meetingUrl: "https://meet.google.com/abc-defg-hij",
    createdAt: new Date(),
    cancelledAt: null,
  },
  {
    id: "book-002",
    eventTypeId: "evt-001",
    userId: "user-001",
    guestName: "Sam Chen",
    guestEmail: "sam@example.com",
    guestTimezone: "Asia/Tokyo",
    guestNotes: null,
    startTime: makeDate(tomorrow, 14, 0),
    endTime: makeDate(tomorrow, 14, 15),
    status: "confirmed",
    externalCalendarEventId: null,
    cancellationReason: null,
    customFieldResponses: null,
    meetingUrl: "https://meet.google.com/klm-nopq-rst",
    createdAt: new Date(),
    cancelledAt: null,
  },
  {
    id: "book-003",
    eventTypeId: "evt-003",
    userId: "user-001",
    guestName: "Morgan Taylor",
    guestEmail: "morgan@example.com",
    guestTimezone: "Europe/London",
    guestNotes: "Full business review needed",
    startTime: makeDate(dayAfter, 11, 0),
    endTime: makeDate(dayAfter, 12, 0),
    status: "confirmed",
    externalCalendarEventId: null,
    cancellationReason: null,
    customFieldResponses: { q1: "Expanding to EU market", q2: "21-50" },
    meetingUrl: "https://zoom.us/j/123456789",
    createdAt: new Date(),
    cancelledAt: null,
  },
  {
    id: "book-004",
    eventTypeId: "evt-002",
    userId: "user-001",
    guestName: "Jordan Lee",
    guestEmail: "jordan@example.com",
    guestTimezone: "America/Chicago",
    guestNotes: null,
    startTime: makeDate(nextWeek, 15, 0),
    endTime: makeDate(nextWeek, 15, 30),
    status: "confirmed",
    externalCalendarEventId: null,
    cancellationReason: null,
    customFieldResponses: { q1: "Marketing automation setup" },
    meetingUrl: "https://meet.google.com/uvw-xyza-bcd",
    createdAt: new Date(),
    cancelledAt: null,
  },
  {
    id: "book-005",
    eventTypeId: "evt-001",
    userId: "user-001",
    guestName: "Casey Brown",
    guestEmail: "casey@example.com",
    guestTimezone: "America/New_York",
    guestNotes: "Quick intro chat",
    startTime: makeDate(new Date(today.getTime() - 86400000 * 3), 9, 0),
    endTime: makeDate(new Date(today.getTime() - 86400000 * 3), 9, 15),
    status: "completed",
    externalCalendarEventId: null,
    cancellationReason: null,
    customFieldResponses: null,
    meetingUrl: null,
    createdAt: new Date(today.getTime() - 86400000 * 5),
    cancelledAt: null,
  },
  {
    id: "book-006",
    eventTypeId: "evt-003",
    userId: "user-001",
    guestName: "Drew Martinez",
    guestEmail: "drew@example.com",
    guestTimezone: "America/Denver",
    guestNotes: "Need to reschedule",
    startTime: makeDate(new Date(today.getTime() - 86400000 * 1), 13, 0),
    endTime: makeDate(new Date(today.getTime() - 86400000 * 1), 14, 0),
    status: "cancelled",
    externalCalendarEventId: null,
    cancellationReason: "Scheduling conflict",
    customFieldResponses: null,
    meetingUrl: null,
    createdAt: new Date(today.getTime() - 86400000 * 4),
    cancelledAt: new Date(today.getTime() - 86400000 * 2),
  },
];
