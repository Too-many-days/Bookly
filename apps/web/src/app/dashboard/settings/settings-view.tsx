"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Palette, Bell, Check, Loader2 } from "lucide-react";

interface SettingsViewProps {
  user: {
    name: string;
    email: string;
    slug: string;
    timezone: string;
    avatarUrl: string | null;
    branding: { accentColor?: string; logoUrl?: string } | null;
  };
}

const PRESET_COLORS = [
  "#6366f1",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#ef4444",
];

export function SettingsView({ user }: SettingsViewProps) {
  const router = useRouter();
  const [profile, setProfile] = useState({
    name: user.name,
    slug: user.slug,
    timezone: user.timezone,
  });
  const [accentColor, setAccentColor] = useState(
    user.branding?.accentColor || "#6366f1"
  );
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState({
    bookingMade: true,
    bookingCancelled: true,
    reminder24h: true,
    reminder1h: false,
    dailySummary: false,
  });

  const saveProfile = async () => {
    setSavingProfile(true);
    setProfileError(null);
    setProfileSaved(false);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) {
        const data = await res.json();
        setProfileError(data.error || "Failed to save");
        return;
      }
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
      router.refresh();
    } catch (err) {
      setProfileError("Something went wrong");
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p className="page-header-subtitle">
            Manage your account, branding, and preferences.
          </p>
        </div>
      </div>

      <div className="page-body">
        {/* Profile */}
        <div className="card" style={{ padding: "32px", marginBottom: "24px" }}>
          <h3
            style={{
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <User size={18} /> Profile
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              maxWidth: "600px",
            }}
          >
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="input"
                value={profile.name}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="input"
                defaultValue={user.email}
                type="email"
                disabled
                style={{ opacity: 0.6, cursor: "not-allowed" }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Booking URL Slug</label>
              <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
                <span
                  style={{
                    padding: "10px 12px",
                    fontSize: "0.875rem",
                    background: "var(--bg-tertiary)",
                    border: "1px solid var(--border-default)",
                    borderRight: "none",
                    borderRadius:
                      "var(--radius-md) 0 0 var(--radius-md)",
                    color: "var(--text-secondary)",
                    whiteSpace: "nowrap",
                  }}
                >
                  /book/
                </span>
                <input
                  className="input"
                  value={profile.slug}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      slug: e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, ""),
                    }))
                  }
                  style={{
                    borderRadius:
                      "0 var(--radius-md) var(--radius-md) 0",
                  }}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Timezone</label>
              <select
                className="input"
                value={profile.timezone}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, timezone: e.target.value }))
                }
              >
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Europe/Paris">Paris (CET)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>

          {profileError && (
            <div
              style={{
                marginTop: "16px",
                padding: "10px 16px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "var(--radius-md)",
                color: "#991b1b",
                fontSize: "0.875rem",
              }}
            >
              {profileError}
            </div>
          )}

          <div style={{ marginTop: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              className="btn btn-primary"
              onClick={saveProfile}
              disabled={savingProfile}
            >
              {savingProfile ? (
                <>
                  <Loader2
                    size={16}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  Saving...
                </>
              ) : profileSaved ? (
                <>
                  <Check size={16} />
                  Saved!
                </>
              ) : (
                "Save Changes"
              )}
            </button>
            {profileSaved && (
              <span style={{ color: "var(--color-success)", fontSize: "0.875rem" }}>
                Profile updated successfully
              </span>
            )}
          </div>
        </div>

        {/* Branding */}
        <div className="card" style={{ padding: "32px", marginBottom: "24px" }}>
          <h3
            style={{
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Palette size={18} /> Branding
          </h3>
          <div style={{ maxWidth: "600px" }}>
            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label className="form-label">Accent Color</label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  style={{
                    width: "44px",
                    height: "44px",
                    border: "2px solid var(--border-default)",
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                    padding: "2px",
                  }}
                />
                <input
                  className="input"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  style={{ maxWidth: "120px" }}
                />
                <div style={{ display: "flex", gap: "6px" }}>
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setAccentColor(color)}
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "var(--radius-full)",
                        background: color,
                        cursor: "pointer",
                        border:
                          accentColor === color
                            ? "3px solid var(--text-primary)"
                            : "3px solid transparent",
                        transition: "all var(--transition-fast)",
                        outline: "none",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Logo</label>
              <div
                style={{
                  padding: "32px",
                  border: "2px dashed var(--border-default)",
                  borderRadius: "var(--radius-lg)",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                }}
              >
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Drag and drop your logo here, or{" "}
                  <span
                    style={{
                      color: "var(--color-primary-500)",
                      fontWeight: 500,
                    }}
                  >
                    click to upload
                  </span>
                </p>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-tertiary)",
                    marginTop: "4px",
                  }}
                >
                  PNG, JPG, SVG up to 2MB
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card" style={{ padding: "32px" }}>
          <h3
            style={{
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Bell size={18} /> Notifications
          </h3>
          <div
            style={{
              maxWidth: "600px",
              display: "flex",
              flexDirection: "column",
              gap: "0",
            }}
          >
            {[
              {
                key: "bookingMade" as const,
                label: "Email me when a booking is made",
              },
              {
                key: "bookingCancelled" as const,
                label: "Email me when a booking is cancelled",
              },
              {
                key: "reminder24h" as const,
                label: "Send reminder 24 hours before",
              },
              {
                key: "reminder1h" as const,
                label: "Send reminder 1 hour before",
              },
              {
                key: "dailySummary" as const,
                label: "Daily booking summary",
              },
            ].map((item) => (
              <div
                key={item.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 0",
                  borderBottom: "1px solid var(--border-default)",
                  cursor: "pointer",
                }}
                onClick={() =>
                  setNotifications((n) => ({
                    ...n,
                    [item.key]: !n[item.key],
                  }))
                }
              >
                <span style={{ fontSize: "0.9375rem" }}>{item.label}</span>
                <div
                  style={{
                    width: "44px",
                    height: "24px",
                    borderRadius: "12px",
                    background: notifications[item.key]
                      ? "var(--color-primary-500)"
                      : "var(--bg-tertiary)",
                    position: "relative",
                    transition: "background 200ms ease",
                    border: "1px solid var(--border-default)",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      background: "white",
                      position: "absolute",
                      top: "2px",
                      left: notifications[item.key] ? "22px" : "2px",
                      transition: "left 200ms ease",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
