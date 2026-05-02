import { getAuthUser } from "@/lib/get-auth-user";
import { getEventTypesByUserId } from "@/lib/dal";
import { EmbedView } from "./embed-view";

export const metadata = {
  title: "Embed Widget — Bookly",
};

export default async function EmbedPage() {
  const user = await getAuthUser();
  const eventTypes = await getEventTypesByUserId(user.id);
  const activeEventTypes = eventTypes.filter((et) => et.isActive);

  return (
    <EmbedView
      userSlug={user.slug}
      eventTypes={activeEventTypes.map((et) => ({
        id: et.id,
        title: et.title,
        slug: et.slug,
        color: et.color,
      }))}
    />
  );
}
