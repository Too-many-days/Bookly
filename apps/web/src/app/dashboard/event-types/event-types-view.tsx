"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  Video,
  MapPin,
  Phone,
  Plus,
  Copy,
  ExternalLink,
  Check,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  Loader2,
} from "lucide-react";

interface SerializedEventType {
  id: string;
  userId: string;
  title: string;
  slug: string;
  description: string | null;
  durationMinutes: number;
  locationType: string;
  locationValue: string | null;
  color: string;
  bufferBeforeMins: number | null;
  bufferAfterMins: number | null;
  maxBookingsPerDay: number | null;
  bookingWindowDays: number;
  isActive: boolean;
  sortOrder: number;
  customFields: unknown;
  createdAt: string;
}

interface EventTypesViewProps {
  eventTypes: SerializedEventType[];
  userSlug: string;
}

const COLORS = [
  "#6366f1",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
];

export function EventTypesView({ eventTypes: initial, userSlug }: EventTypesViewProps) {
  const router = useRouter();
  const [eventTypes, setEventTypes] = useState(initial);
  const [showCreate, setShowCreate] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    durationMinutes: 30,
    locationType: "video",
    locationValue: "Google Meet",
    color: "#6366f1",
  });

  const copyLink = (slug: string, id: string) => {
    navigator.clipboard.writeText(
      `${window.location.origin}/book/${userSlug}/${slug}`
    );
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleActive = async (id: string, currentlyActive: boolean) => {
    setLoadingId(id);
    try {
      const res = await fetch("/api/event-types", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentlyActive }),
      });
      if (res.ok) {
        setEventTypes((prev) =>
          prev.map((et) =>
            et.id === id ? { ...et, isActive: !currentlyActive } : et
          )
        );
      }
    } catch (err) {
      console.error("Failed to toggle:", err);
    } finally {
      setLoadingId(null);
    }
  };

  const deleteEventType = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event type?")) return;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/event-types?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setEventTypes((prev) => prev.filter((et) => et.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete:", err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/event-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowCreate(false);
        setForm({
          title: "",
          description: "",
          durationMinutes: 30,
          locationType: "video",
          locationValue: "Google Meet",
          color: "#6366f1",
        });
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to create:", err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Event Types</h1>
          <p className="page-header-subtitle">
            Create and manage the types of meetings people can book with you.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={16} />
          New Event Type
        </button>
      </div>

      <div className="page-body">
        {/* Create Modal */}
        {showCreate && (
          <div
            className="modal-overlay"
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              backdropFilter: "blur(4px)",
            }}
            onClick={(e) => e.target === e.currentTarget && setShowCreate(false)}
          >
            <div
              className="card animate-fade-in"
              style={{
                width: "100%",
                maxWidth: "520px",
                padding: "32px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "24px",
                }}
              >
                <h2>Create Event Type</h2>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowCreate(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreate}>
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input
                    className="input"
                    placeholder="e.g. Quick Chat, Strategy Session"
                    value={form.title}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, title: e.target.value }))
                    }
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="input"
                    placeholder="Briefly describe this meeting type..."
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    rows={2}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <div className="form-group">
                    <label className="form-label">Duration (minutes)</label>
                    <select
                      className="input"
                      value={form.durationMinutes}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          durationMinutes: Number(e.target.value),
                        }))
                      }
                    >
                      <option value={15}>15 min</option>
                      <option value={30}>30 min</option>
                      <option value={45}>45 min</option>
                      <option value={60}>60 min</option>
                      <option value={90}>90 min</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <select
                      className="input"
                      value={form.locationType}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          locationType: e.target.value,
                        }))
                      }
                    >
                      <option value="video">Video Call</option>
                      <option value="phone">Phone</option>
                      <option value="in_person">In Person</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Color</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, color: c }))}
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          background: c,
                          border:
                            form.color === c
                              ? "3px solid var(--text-primary)"
                              : "3px solid transparent",
                          cursor: "pointer",
                          transition: "all 150ms ease",
                          outline: "none",
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    justifyContent: "flex-end",
                    marginTop: "24px",
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowCreate(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={creating}
                  >
                    {creating ? (
                      <>
                        <Loader2
                          size={16}
                          style={{ animation: "spin 1s linear infinite" }}
                        />
                        Creating...
                      </>
                    ) : (
                      "Create Event Type"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Event Types Grid */}
        <div className="event-types-grid">
          {eventTypes.length === 0 && !showCreate && (
            <div
              className="card"
              style={{
                padding: "48px",
                textAlign: "center",
                gridColumn: "1 / -1",
              }}
            >
              <div className="empty-state-icon" style={{ marginBottom: "16px" }}>
                <Clock />
              </div>
              <h3>No event types yet</h3>
              <p
                style={{
                  color: "var(--text-secondary)",
                  marginBottom: "16px",
                }}
              >
                Create your first event type to start receiving bookings.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => setShowCreate(true)}
              >
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
            const isLoading = loadingId === et.id;

            return (
              <div
                key={et.id}
                className={`card event-type-card animate-slide-up animate-slide-up-${Math.min(
                  index + 1,
                  4
                )}`}
                style={{ opacity: isLoading ? 0.6 : 1, transition: "opacity 200ms" }}
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
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => toggleActive(et.id, et.isActive)}
                        title={et.isActive ? "Deactivate" : "Activate"}
                        disabled={isLoading}
                        style={{ padding: "4px" }}
                      >
                        {et.isActive ? (
                          <ToggleRight size={22} style={{ color: "var(--color-success)" }} />
                        ) : (
                          <ToggleLeft size={22} style={{ color: "var(--text-tertiary)" }} />
                        )}
                      </button>
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
                      {(et.bufferBeforeMins ?? 0) > 0 && (
                        <span className="event-type-meta-item">
                          <Clock size={13} />
                          {et.bufferBeforeMins}m buffer
                        </span>
                      )}
                    </div>
                    <div className="event-type-actions">
                      <Link
                        href={`/book/${userSlug}/${et.slug}`}
                        className="btn btn-ghost btn-sm"
                        title="Preview"
                        target="_blank"
                      >
                        <ExternalLink size={14} />
                      </Link>
                      <button
                        className="btn btn-ghost btn-sm"
                        title={copiedId === et.id ? "Copied!" : "Copy link"}
                        onClick={() => copyLink(et.slug, et.id)}
                      >
                        {copiedId === et.id ? (
                          <Check size={14} style={{ color: "var(--color-success)" }} />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        title="Delete"
                        onClick={() => deleteEventType(et.id)}
                        disabled={isLoading}
                        style={{ color: "var(--color-danger)" }}
                      >
                        <Trash2 size={14} />
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
