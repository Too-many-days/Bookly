import { User, Globe, Palette, Bell } from "lucide-react";
import { demoUser } from "@/lib/mock-data";

export const metadata = {
  title: "Settings — Bookly",
};

export default function SettingsPage() {
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
          <h3 style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
            <User size={18} /> Profile
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", maxWidth: "600px" }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="input" defaultValue={demoUser.name} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="input" defaultValue={demoUser.email} type="email" />
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
                    borderRadius: "var(--radius-md) 0 0 var(--radius-md)",
                    color: "var(--text-secondary)",
                    whiteSpace: "nowrap",
                  }}
                >
                  bookly.app/book/
                </span>
                <input
                  className="input"
                  defaultValue={demoUser.slug}
                  style={{ borderRadius: "0 var(--radius-md) var(--radius-md) 0" }}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Timezone</label>
              <select className="input" defaultValue={demoUser.timezone}>
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Europe/Paris">Paris (CET)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: "24px" }}>
            <button className="btn btn-primary">Save Changes</button>
          </div>
        </div>

        {/* Branding */}
        <div className="card" style={{ padding: "32px", marginBottom: "24px" }}>
          <h3 style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Palette size={18} /> Branding
          </h3>
          <div style={{ maxWidth: "600px" }}>
            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label className="form-label">Accent Color</label>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <input
                  type="color"
                  defaultValue="#6366f1"
                  style={{
                    width: "44px",
                    height: "44px",
                    border: "2px solid var(--border-default)",
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                    padding: "2px",
                  }}
                />
                <input className="input" defaultValue="#6366f1" style={{ maxWidth: "120px" }} />
                <div style={{ display: "flex", gap: "6px" }}>
                  {["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ec4899", "#ef4444"].map((color) => (
                    <div
                      key={color}
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "var(--radius-full)",
                        background: color,
                        cursor: "pointer",
                        border: "2px solid transparent",
                        transition: "all var(--transition-fast)",
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
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                  Drag and drop your logo here, or{" "}
                  <span style={{ color: "var(--color-primary-500)", fontWeight: 500 }}>
                    click to upload
                  </span>
                </p>
                <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: "4px" }}>
                  PNG, JPG, SVG up to 2MB
                </p>
              </div>
            </div>
          </div>
          <div style={{ marginTop: "24px" }}>
            <button className="btn btn-primary">Save Branding</button>
          </div>
        </div>

        {/* Notifications */}
        <div className="card" style={{ padding: "32px" }}>
          <h3 style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Bell size={18} /> Notifications
          </h3>
          <div style={{ maxWidth: "600px", display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              { label: "Email me when a booking is made", enabled: true },
              { label: "Email me when a booking is cancelled", enabled: true },
              { label: "Send reminder 24 hours before", enabled: true },
              { label: "Send reminder 1 hour before", enabled: false },
              { label: "Daily booking summary", enabled: false },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 0",
                  borderBottom: "1px solid var(--border-default)",
                }}
              >
                <span style={{ fontSize: "0.9375rem" }}>{item.label}</span>
                <div className={`toggle ${item.enabled ? "active" : ""}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
