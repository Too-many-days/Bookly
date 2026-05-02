import { getAuthUser } from "@/lib/get-auth-user";
import { getBookingsByUserId, getEventTypesByUserId } from "@/lib/dal";
import { BookingsView } from "./bookings-view";

export const metadata = {
  title: "Bookings — Bookly",
};

export default async function BookingsPage() {
  const user = await getAuthUser();
  const bookings = await getBookingsByUserId(user.id);
  const eventTypes = await getEventTypesByUserId(user.id);

  // Serialize dates for client component
  const serializedBookings = bookings.map((b) => ({
    ...b,
    startTime: b.startTime.toISOString(),
    endTime: b.endTime.toISOString(),
    createdAt: b.createdAt.toISOString(),
    cancelledAt: b.cancelledAt?.toISOString() ?? null,
  }));

  const serializedEventTypes = eventTypes.map((et) => ({
    ...et,
    createdAt: et.createdAt.toISOString(),
  }));

  return (
    <BookingsView
      bookings={serializedBookings}
      eventTypes={serializedEventTypes}
    />
  );
}
