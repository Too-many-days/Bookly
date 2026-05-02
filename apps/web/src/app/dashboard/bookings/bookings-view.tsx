"use client";

import { useState } from "react";
import { Calendar, Video, ChevronDown } from "lucide-react";
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

export function BookingsView({ bookings, eventTypes }: BookingsViewProps) {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "cancelled">(
    "upcoming"
  );

  const now = new Date();

  const filteredBookings = bookings
    .filter((b) => {
      const startTime = new Date(b.startTime);
      const endTime = new Date(b.endTime);
      if (activeTab === "upcoming")
        return b.status === "confirmed" && isAfter(startTime, now);
      if (activeTab === "past")
        return b.status === "completed" || (b.status === "confirmed" && isBefore(endTime, now));
      if (activeTab === "cancelled") return b.status === "cancelled";
      return true;
    })
    .sort((a, b) => {
      const aTime = new Date(a.startTime).getTime();
      const bTime = new Date(b.startTime).getTime();
      if (activeTab === "upcoming") return aTime - bTime;
      return bTime - aTime;
    });

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
          {(["upcoming", "past", "cancelled"] as const).map((tab) => (
            <button
              key={tab}
              className={`tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
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
                return (
                  <div
                    key={booking.id}
                    className={`booking-item animate-slide-up animate-slide-up-${
                      Math.min(index + 1, 4)
                    }`}
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
                      <ChevronDown size={14} />
                    </button>
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
