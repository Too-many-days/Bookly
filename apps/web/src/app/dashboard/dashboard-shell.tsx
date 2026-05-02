"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Settings,
  LinkIcon,
  BarChart3,
  Plug,
  CreditCard,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/bookings", label: "Bookings", icon: Calendar },
  { href: "/dashboard/event-types", label: "Event Types", icon: Clock },
  { href: "/dashboard/availability", label: "Availability", icon: Clock },
];

const settingsItems = [
  { href: "/dashboard/embed", label: "Embed Widget", icon: LinkIcon },
  { href: "/dashboard/integrations", label: "Integrations", icon: Plug },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface DashboardShellProps {
  userName: string;
  userEmail: string;
  userSlug: string;
  userAvatar: string | null;
  children: React.ReactNode;
}

export function DashboardShell({
  userName,
  userEmail,
  userSlug,
  userAvatar,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">B</div>
          <span className="sidebar-logo-text">Bookly</span>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-title">Menu</div>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${
                pathname === item.href ? "active" : ""
              }`}
            >
              <item.icon />
              {item.label}
            </Link>
          ))}

          <div className="sidebar-section-title">Configuration</div>
          {settingsItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${
                pathname === item.href ? "active" : ""
              }`}
            >
              <item.icon />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "inherit",
                  objectFit: "cover",
                }}
              />
            ) : (
              userName
                .split(" ")
                .map((n) => n[0])
                .join("")
            )}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{userName}</div>
            <div className="sidebar-user-email">{userEmail}</div>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign out"
            style={{ marginLeft: "auto", padding: "6px" }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">{children}</main>
    </div>
  );
}
