import Link from "next/link";
import {
  Clock,
  Video,
  MapPin,
  Phone,
  MoreHorizontal,
  Plus,
  Copy,
  ExternalLink,
} from "lucide-react";
import { getAuthUser } from "@/lib/get-auth-user";
import { getEventTypesByUserId } from "@/lib/dal";

export const metadata = {
  title: "Event Types — Bookly",
};

export default async function EventTypesPage() {
  const user = await getAuthUser();
  const eventTypes = await getEventTypesByUserId(user.id);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Event Types</h1>
          <p className="page-header-subtitle">
            Create and manage the types of meetings people can book with you.
          </p>
        </div>
        <button className="btn btn-primary">
          <Plus size={16} />
          New Event Type
        </button>
      </div>

      <div className="page-body">
        <div className="event-types-grid">
          {eventTypes.length === 0 && (
            <div className="card" style={{ padding: "48px", textAlign: "center", gridColumn: "1 / -1" }}>
              <div className="empty-state-icon" style={{ marginBottom: "16px" }}>
                <Clock />
              </div>
              <h3>No event types yet</h3>
              <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>
                Create your first event type to start receiving bookings.
              </p>
              <button className="btn btn-primary">
                <Plus size={16} /> Create Event Type
              </button>
            </div>
          )}
          {eventTypes.map((et, index) => {
            const locationIcon =
              et.locationType === "video" ? (
                <Video size={14} />
              ) : et.locationType === "phone" ? (
                <Phone size={14} />
              ) : (
                <MapPin size={14} />
              );

            return (
              <div
                key={et.id}
                className={`card event-type-card animate-slide-up animate-slide-up-${
                  Math.min(index + 1, 4)
                }`}
              >
                <div
                  className="event-type-accent"
                  style={{ background: et.color }}
                />
                <div className="event-type-body">
                  <div className="event-type-header">
                    <div>
                      <div className="event-type-title">{et.title}</div>
                      <div className="event-type-duration">
                        <Clock
                          size={13}
                          style={{
                            display: "inline",
                            verticalAlign: "middle",
                            marginRight: "4px",
                          }}
                        />
                        {et.durationMinutes} min
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        className={`badge ${
                          et.isActive ? "badge-success" : "badge-neutral"
                        }`}
                      >
                        {et.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  <p className="event-type-description">{et.description}</p>

                  <div className="event-type-footer">
                    <div className="event-type-meta">
                      <span className="event-type-meta-item">
                        {locationIcon}
                        {et.locationValue || et.locationType}
                      </span>
                      {et.bufferBeforeMins > 0 && (
                        <span className="event-type-meta-item">
                          <Clock size={13} />
                          {et.bufferBeforeMins}m buffer
                        </span>
                      )}
                    </div>
                    <div className="event-type-actions">
                      <Link
                        href={`/book/${user.slug}/${et.slug}`}
                        className="btn btn-ghost btn-sm"
                        title="Preview"
                      >
                        <ExternalLink size={14} />
                      </Link>
                      <button className="btn btn-ghost btn-sm" title="Copy link">
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
