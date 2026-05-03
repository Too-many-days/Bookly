"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Video,
  ChevronDown,
  ChevronUp,
  XCircle,
  Loader2,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { format, isAfter, isBefore } from "date-fns";

interface SerializedBooking {
  id: string;
  eventTypeId: string;
  userId: string;
  guestName: string;
  guestEmail: string;
  guestTimezone: string;
  guestNotes: string | null;
  startTime: string;
  endTime: string;
  status: string;
  externalCalendarEventId: string | null;
  cancellationReason: string | null;
  customFieldResponses: Record<string, string | boolean> | null;
  meetingUrl: string | null;
  createdAt: string;
  cancelledAt: string | null;
}

interface SerializedEventType {
  id: string;
  title: string;
  slug: string;
  color: string;
  durationMinutes: number;
  locationType: string;
  locationValue: string | null;
  [key: string]: unknown;
}

interface BookingsViewProps {
  bookings: SerializedBooking[];
  eventTypes: SerializedEventType[];
}

export function BookingsView({ bookings: initial, eventTypes }: BookingsViewProps) {
  const router = useRouter();
  const [bookings, setBookings] = useState(initial);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "cancelled">(
    "upcoming"
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [copiedMeetingId, setCopiedMeetingId] = useState<string | null>(null);

  const now = new Date();

  const filteredBookings = bookings
    .filter((b) => {
      const startTime = new Date(b.startTime);
      const endTime = new Date(b.endTime);
      if (activeTab === "upcoming")
        return b.status === "confirmed" && isAfter(startTime, now);
      if (activeTab === "past")
        return (
          b.status === "completed" ||
          (b.status === "confirmed" && isBefore(endTime, now))
        );
      if (activeTab === "cancelled") return b.status === "cancelled";
      return true;
    })
    .sort((a, b) => {
      const aTime = new Date(a.startTime).getTime();
      const bTime = new Date(b.startTime).getTime();
      if (activeTab === "upcoming") return aTime - bTime;
      return bTime - aTime;
    });

  const cancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setCancellingId(bookingId);
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, reason: "Cancelled by host" }),
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId
              ? {
                  ...b,
                  status: "cancelled",
                  cancellationReason: "Cancelled by host",
                  cancelledAt: new Date().toISOString(),
                }
              : b
          )
        );
        setExpandedId(null);
      }
    } catch (err) {
      console.error("Failed to cancel:", err);
    } finally {
      setCancellingId(null);
    }
  };

  const copyMeetingUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedMeetingId(id);
    setTimeout(() => setCopiedMeetingId(null), 2000);
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <span className="badge badge-success">Confirmed</span>;
      case "completed":
        return <span className="badge badge-primary">Completed</span>;
      case "cancelled":
        return <span className="badge badge-danger">Cancelled</span>;
      case "no_show":
        return <span className="badge badge-warning">No Show</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Bookings</h1>
          <p className="page-header-subtitle">
            Manage all your appointments in one place.
          </p>
        </div>
      </div>

      <div className="page-body">
        {/* Tabs */}
        <div className="tabs" style={{ display: "inline-flex" }}>
          {(["upcoming", "past", "cancelled"] as const).map((tab) => {
            const count = bookings.filter((b) => {
              const st = new Date(b.startTime);
              const et = new Date(b.endTime);
              if (tab === "upcoming")
                return b.status === "confirmed" && isAfter(st, now);
              if (tab === "past")
                return (
                  b.status === "completed" ||
                  (b.status === "confirmed" && isBefore(et, now))
                );
              if (tab === "cancelled") return b.status === "cancelled";
              return false;
            }).length;

            return (
              <button
                key={tab}
                className={`tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {count > 0 && (
                  <span
                    style={{
                      marginLeft: "6px",
                      fontSize: "0.75rem",
                      background: activeTab === tab ? "var(--color-primary-100)" : "var(--bg-tertiary)",
                      color: activeTab === tab ? "var(--color-primary-700)" : "var(--text-secondary)",
                      padding: "2px 8px",
                      borderRadius: "var(--radius-full)",
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bookings List */}
        <div className="card">
          <div className="bookings-list">
            {filteredBookings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Calendar />
                </div>
                <h3>No {activeTab} bookings</h3>
                <p>
                  {activeTab === "upcoming"
                    ? "You have no upcoming appointments. Share your booking link to get started!"
                    : activeTab === "past"
                    ? "No past bookings to show yet."
                    : "No cancelled bookings."}
                </p>
              </div>
            ) : (
              filteredBookings.map((booking, index) => {
                const eventType = eventTypes.find(
                  (e) => e.id === booking.eventTypeId
                );
                const startTime = new Date(booking.startTime);
                const endTime = new Date(booking.endTime);
                const isExpanded = expandedId === booking.id;
                const isCancelling = cancellingId === booking.id;

                return (
                  <div key={booking.id}>
                    <div
                      className={`booking-item animate-slide-up animate-slide-up-${Math.min(
                        index + 1,
                        4
                      )}`}
                      style={{
                        cursor: "pointer",
                        opacity: isCancelling ? 0.5 : 1,
                        transition: "opacity 200ms",
                      }}
                      onClick={() =>
                        setExpandedId(isExpanded ? null : booking.id)
                      }
                    >
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
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "0.8125rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        <Video size={14} />
                        {eventType?.locationValue}
                      </div>
                      <div className="booking-time">
                        <div className="booking-date">
                          {format(startTime, "EEE, MMM d")}
                        </div>
                        <div className="booking-time-range">
                          {format(startTime, "h:mm a")} –{" "}
                          {format(endTime, "h:mm a")}
                        </div>
                      </div>
                      {statusBadge(booking.status)}
                      <button className="btn btn-ghost btn-sm">
                        {isExpanded ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                      </button>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div
                        className="animate-fade-in"
                        style={{
                          padding: "16px 20px 16px 36px",
                          borderTop: "1px solid var(--border-default)",
                          background: "var(--bg-secondary)",
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "16px",
                          fontSize: "0.875rem",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              color: "var(--text-tertiary)",
                              marginBottom: "4px",
                              fontSize: "0.75rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                            }}
                          >
                            Guest Email
                          </div>
                          <div>{booking.guestEmail}</div>
                        </div>
                        <div>
                          <div
                            style={{
                              color: "var(--text-tertiary)",
                              marginBottom: "4px",
                              fontSize: "0.75rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                            }}
                          >
                            Timezone
                          </div>
                          <div>{booking.guestTimezone}</div>
                        </div>
                        {booking.guestNotes && (
                          <div style={{ gridColumn: "1 / -1" }}>
                            <div
                              style={{
                                color: "var(--text-tertiary)",
                                marginBottom: "4px",
                                fontSize: "0.75rem",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                              }}
                            >
                              Notes
                            </div>
                            <div>{booking.guestNotes}</div>
                          </div>
                        )}
                        {booking.meetingUrl && (
                          <div style={{ gridColumn: "1 / -1" }}>
                            <div
                              style={{
                                color: "var(--text-tertiary)",
                                marginBottom: "4px",
                                fontSize: "0.75rem",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                              }}
                            >
                              Meeting Link
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <a
                                href={booking.meetingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  color: "var(--color-primary-500)",
                                  textDecoration: "none",
                                }}
                              >
                                {booking.meetingUrl}
                              </a>
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyMeetingUrl(booking.meetingUrl!, booking.id);
                                }}
                              >
                                {copiedMeetingId === booking.id ? (
                                  <Check
                                    size={14}
                                    style={{ color: "var(--color-success)" }}
                                  />
                                ) : (
                                  <Copy size={14} />
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                        {booking.cancellationReason && (
                          <div style={{ gridColumn: "1 / -1" }}>
                            <div
                              style={{
                                color: "var(--text-tertiary)",
                                marginBottom: "4px",
                                fontSize: "0.75rem",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                              }}
                            >
                              Cancellation Reason
                            </div>
                            <div style={{ color: "var(--color-danger)" }}>
                              {booking.cancellationReason}
                            </div>
                          </div>
                        )}
                        {/* Actions */}
                        {booking.status === "confirmed" &&
                          isAfter(startTime, now) && (
                            <div
                              style={{
                                gridColumn: "1 / -1",
                                display: "flex",
                                gap: "8px",
                                paddingTop: "8px",
                                borderTop: "1px solid var(--border-default)",
                              }}
                            >
                              {booking.meetingUrl && (
                                <a
                                  href={booking.meetingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-primary btn-sm"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ExternalLink size={14} />
                                  Join Meeting
                                </a>
                              )}
                              <button
                                className="btn btn-sm"
                                style={{
                                  background: "var(--color-danger-50, #fef2f2)",
                                  color: "var(--color-danger, #dc2626)",
                                  border: "1px solid var(--color-danger-200, #fecaca)",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  cancelBooking(booking.id);
                                }}
                                disabled={isCancelling}
                              >
                                {isCancelling ? (
                                  <Loader2
                                    size={14}
                                    style={{
                                      animation: "spin 1s linear infinite",
                                    }}
                                  />
                                ) : (
                                  <XCircle size={14} />
                                )}
                                Cancel Booking
                              </button>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}
