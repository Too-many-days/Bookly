import { getUserBySlug, getEventTypeBySlug, getDefaultSchedule } from "@/lib/dal";
import { notFound } from "next/navigation";
import { BookingClient } from "./booking-client";

interface PageProps {
  params: Promise<{ slug: string; event: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug, event } = await params;
  const user = await getUserBySlug(slug);
  if (!user) return { title: "Not Found — Bookly" };

  const eventType = await getEventTypeBySlug(user.id, event);
  if (!eventType) return { title: "Not Found — Bookly" };

  return {
    title: `Book ${eventType.title} with ${user.name} — Bookly`,
    description: eventType.description || `Book a ${eventType.durationMinutes}-minute ${eventType.title} with ${user.name}`,
  };
}

export default async function BookingPage({ params }: PageProps) {
  const { slug, event } = await params;

  // Look up user by slug
  const user = await getUserBySlug(slug);
  if (!user) notFound();

  // Look up event type
  const eventType = await getEventTypeBySlug(user.id, event);
  if (!eventType || !eventType.isActive) notFound();

  // Get schedule rules for client-side pre-check
  const scheduleData = await getDefaultSchedule(user.id);
  const scheduleRules = (scheduleData?.rules ?? []).map((r) => ({
    dayOfWeek: r.dayOfWeek,
    startTime: r.startTime,
    endTime: r.endTime,
    isOverride: r.isOverride,
  }));

  return (
    <BookingClient
      user={{
        name: user.name,
        slug: user.slug,
        timezone: user.timezone,
        avatarUrl: user.avatarUrl,
      }}
      eventType={{
        id: eventType.id,
        title: eventType.title,
        slug: eventType.slug,
        description: eventType.description,
        durationMinutes: eventType.durationMinutes,
        locationType: eventType.locationType,
        locationValue: eventType.locationValue,
        bookingWindowDays: eventType.bookingWindowDays,
        color: eventType.color,
      }}
      scheduleRules={scheduleRules}
    />
  );
}
