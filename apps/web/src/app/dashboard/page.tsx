import {
  Calendar,
  Clock,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Video,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { getAuthUser } from "@/lib/get-auth-user";
import { getBookingsByUserId, getEventTypesByUserId } from "@/lib/dal";
import { format, isAfter, isBefore, addDays } from "date-fns";

export const metadata = {
  title: "Dashboard — Bookly",
};

export default async function DashboardPage() {
  const user = await getAuthUser();
  const allBookings = await getBookingsByUserId(user.id);
  const eventTypes = await getEventTypesByUserId(user.id);

  const now = new Date();
  const upcoming = allBookings
    .filter((b) => b.status === "confirmed" && isAfter(b.startTime, now))
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  const activeEventTypes = eventTypes.filter((e) => e.isActive);
  const totalBookings = allBookings.length;
  const completedBookings = allBookings.filter(
    (b) => b.status === "completed"
  ).length;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Welcome back, {user.name.split(" ")[0]} 👋</h1>
          <p className="page-header-subtitle">
            Here&apos;s what&apos;s happening with your bookings today.
          </p>
        </div>
        <Link href="/dashboard/event-types" className="btn btn-primary">
          <Clock size={16} />
          New Event Type
        </Link>
      </div>

      <div className="page-body">
        {/* Stats */}
        <div className="stats-grid">
          <div className="card stat-card animate-slide-up animate-slide-up-1">
            <div className="stat-icon stat-icon-primary">
              <Calendar />
            </div>
            <div>
              <div className="stat-value">{upcoming.length}</div>
              <div className="stat-label">Upcoming Bookings</div>
              <div className="stat-trend stat-trend-up">
                <ArrowUpRight size={14} /> Active
              </div>
            </div>
          </div>

          <div className="card stat-card animate-slide-up animate-slide-up-2">
            <div className="stat-icon stat-icon-success">
              <Users />
            </div>
            <div>
              <div className="stat-value">{totalBookings}</div>
              <div className="stat-label">Total Bookings</div>
            </div>
          </div>

          <div className="card stat-card animate-slide-up animate-slide-up-3">
            <div className="stat-icon stat-icon-warning">
              <Clock />
            </div>
            <div>
              <div className="stat-value">{activeEventTypes.length}</div>
              <div className="stat-label">Active Event Types</div>
            </div>
          </div>

          <div className="card stat-card animate-slide-up animate-slide-up-4">
            <div className="stat-icon stat-icon-info">
              <TrendingUp />
            </div>
            <div>
              <div className="stat-value">
                {totalBookings > 0
                  ? Math.round((completedBookings / totalBookings) * 100)
                  : 0}
                %
              </div>
              <div className="stat-label">Show-up Rate</div>
              {totalBookings > 0 && (
                <div className="stat-trend stat-trend-up">
                  <ArrowUpRight size={14} /> Excellent
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "24px" }}>
          {/* Upcoming Bookings */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <h2>Upcoming Bookings</h2>
              <Link
                href="/dashboard/bookings"
                className="btn btn-ghost btn-sm"
              >
                View all <ChevronRight size={14} />
              </Link>
            </div>
            <div className="card">
              <div className="bookings-list">
                {upcoming.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <Calendar />
                    </div>
                    <h3>No upcoming bookings</h3>
                    <p>
                      Share your booking link to start receiving appointments.
                    </p>
                  </div>
                ) : (
                  upcoming.slice(0, 5).map((booking) => {
                    const eventType = eventTypes.find(
                      (e) => e.id === booking.eventTypeId
                    );
                    return (
                      <div key={booking.id} className="booking-item">
                        <div
                          className="booking-color-dot"
                          style={{
                            background: eventType?.color || "#6366f1",
                          }}
                        />
                        <div className="booking-info">
                          <div className="booking-guest-name">
                            {booking.guestName}
                          </div>
                          <div className="booking-event-name">
                            {eventType?.title} · {eventType?.durationMinutes}min
                          </div>
                        </div>
                        <div className="booking-time">
                          <div className="booking-date">
                            {format(booking.startTime, "MMM d, yyyy")}
                          </div>
                          <div className="booking-time-range">
                            {format(booking.startTime, "h:mm a")} –{" "}
                            {format(booking.endTime, "h:mm a")}
                          </div>
                        </div>
                        <span className="badge badge-success">Confirmed</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions Sidebar */}
          <div>
            <h2 style={{ marginBottom: "16px" }}>Your Booking Links</h2>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {activeEventTypes.map((et) => (
                <Link
                  key={et.id}
                  href={`/book/${user.slug}/${et.slug}`}
                  className="card"
                  style={{
                    padding: "16px 20px",
                    textDecoration: "none",
                    color: "inherit",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    transition: "all 200ms ease",
                  }}
                >
                  <div
                    style={{
                      width: "10px",
                      height: "36px",
                      borderRadius: "var(--radius-full)",
                      background: et.color,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "0.9375rem",
                        marginBottom: "2px",
                      }}
                    >
                      {et.title}
                    </div>
                    <div
                      style={{
                        fontSize: "0.8125rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {et.durationMinutes} min · {et.locationType}
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    style={{ color: "var(--text-tertiary)" }}
                  />
                </Link>
              ))}

              {activeEventTypes.length === 0 && (
                <div className="card" style={{ padding: "24px", textAlign: "center" }}>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                    No event types yet. Create one to start receiving bookings.
                  </p>
                  <Link href="/dashboard/event-types" className="btn btn-primary btn-sm" style={{ marginTop: "12px" }}>
                    Create Event Type
                  </Link>
                </div>
              )}
            </div>

            {/* Embed Code Card */}
            <div
              className="card"
              style={{
                padding: "24px",
                marginTop: "24px",
                background:
                  "linear-gradient(135deg, var(--color-primary-50), #faf5ff)",
                borderColor: "var(--color-primary-100)",
              }}
            >
              <h4 style={{ marginBottom: "8px" }}>Embed on your website</h4>
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--text-secondary)",
                  marginBottom: "16px",
                }}
              >
                Copy this snippet and add it to your website&apos;s HTML.
              </p>
              <Link
                href="/dashboard/embed"
                className="btn btn-primary btn-sm"
                style={{ width: "100%" }}
              >
                Get embed code
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
