import { getAuthUser } from "@/lib/get-auth-user";
import { getEventTypesByUserId } from "@/lib/dal";
import { EventTypesView } from "./event-types-view";

export const metadata = {
  title: "Event Types — Bookly",
};

export default async function EventTypesPage() {
  const user = await getAuthUser();
  const eventTypes = await getEventTypesByUserId(user.id);

  const serialized = eventTypes.map((et) => ({
    ...et,
    createdAt: et.createdAt.toISOString(),
  }));

  return <EventTypesView eventTypes={serialized} userSlug={user.slug} />;
}
