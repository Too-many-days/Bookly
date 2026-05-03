import { getAuthUser } from "@/lib/get-auth-user";
import { SettingsView } from "./settings-view";

export const metadata = {
  title: "Settings — Bookly",
};

export default async function SettingsPage() {
  const user = await getAuthUser();

  return (
    <SettingsView
      user={{
        name: user.name,
        email: user.email,
        slug: user.slug,
        timezone: user.timezone,
        avatarUrl: user.avatarUrl,
        branding: user.branding as { accentColor?: string; logoUrl?: string } | null,
      }}
    />
  );
}
