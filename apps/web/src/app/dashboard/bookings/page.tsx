"use client";

import { useState } from "react";
import { Calendar, Filter, Search, Video, ChevronDown } from "lucide-react";
import { demoBookings, demoEventTypes } from "@/lib/mock-data";
import { format, isAfter, isBefore } from "date-fns";

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "cancelled">(
    "upcoming"
  );

  const now = new Date();

  const filteredBookings = demoBookings
    .filter((b) => {
      if (activeTab === "upcoming")
        return b.status === "confirmed" && isAfter(b.startTime, now);
      if (activeTab === "past")
        return b.status === "completed" || (b.status === "confirmed" && isBefore(b.endTime, now));
      if (activeTab === "cancelled") return b.status === "cancelled";
      return true;
    })
    .sort((a, b) => {
      if (activeTab === "upcoming")
        return a.startTime.getTime() - b.startTime.getTime();
      return b.startTime.getTime() - a.startTime.getTime();
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
                const eventType = demoEventTypes.find(
                  (e) => e.id === booking.eventTypeId
                );
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
                        {format(booking.startTime, "EEE, MMM d")}
                      </div>
                      <div className="booking-time-range">
                        {format(booking.startTime, "h:mm a")} –{" "}
                        {format(booking.endTime, "h:mm a")}
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
