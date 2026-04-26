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
} from "lucide-react";
import { demoUser } from "@/lib/mock-data";

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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
            {demoUser.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{demoUser.name}</div>
            <div className="sidebar-user-email">{demoUser.email}</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">{children}</main>
    </div>
  );
}
