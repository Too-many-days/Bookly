import { getAuthUser } from "@/lib/get-auth-user";
import { DashboardShell } from "./dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();

  return (
    <DashboardShell
      userName={user.name}
      userEmail={user.email}
      userSlug={user.slug}
      userAvatar={user.avatarUrl}
    >
      {children}
    </DashboardShell>
  );
}
