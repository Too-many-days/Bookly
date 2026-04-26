import { Plug, CheckCircle2, ExternalLink } from "lucide-react";

export const metadata = {
  title: "Integrations — Bookly",
};

const integrations = [
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Two-way sync your Google Calendar to prevent double bookings and auto-create events.",
    icon: "🗓️",
    connected: true,
    category: "Calendar",
  },
  {
    id: "outlook",
    name: "Outlook / Office 365",
    description: "Connect your Microsoft calendar for seamless availability management.",
    icon: "📧",
    connected: false,
    category: "Calendar",
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Collect payments when clients book. Perfect for paid consultations.",
    icon: "💳",
    connected: false,
    category: "Payments",
  },
  {
    id: "zoom",
    name: "Zoom",
    description: "Automatically create Zoom meeting links for new bookings.",
    icon: "📹",
    connected: true,
    category: "Video",
  },
  {
    id: "google-meet",
    name: "Google Meet",
    description: "Generate Google Meet links automatically for booked appointments.",
    icon: "🎥",
    connected: true,
    category: "Video",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Get notified in Slack when bookings are made or cancelled.",
    icon: "💬",
    connected: false,
    category: "Notifications",
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Connect Bookly to 5,000+ apps with Zapier automations.",
    icon: "⚡",
    connected: false,
    category: "Automation",
  },
  {
    id: "webhooks",
    name: "Webhooks",
    description: "Send booking events to your own server via HTTP webhooks.",
    icon: "🔗",
    connected: false,
    category: "Developer",
  },
];

export default function IntegrationsPage() {
  const categories = [...new Set(integrations.map((i) => i.category))];

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Integrations</h1>
          <p className="page-header-subtitle">
            Connect Bookly with your favorite tools and services.
          </p>
        </div>
      </div>

      <div className="page-body">
        {categories.map((category) => (
          <div key={category} style={{ marginBottom: "32px" }}>
            <h3 style={{ marginBottom: "16px", color: "var(--text-secondary)", fontSize: "0.8125rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {category}
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "16px",
              }}
            >
              {integrations
                .filter((i) => i.category === category)
                .map((integration) => (
                  <div
                    key={integration.id}
                    className="card"
                    style={{
                      padding: "24px",
                      display: "flex",
                      gap: "16px",
                    }}
                  >
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "var(--radius-lg)",
                        background: "var(--bg-secondary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.5rem",
                        flexShrink: 0,
                      }}
                    >
                      {integration.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "6px",
                        }}
                      >
                        <h4 style={{ fontSize: "0.9375rem" }}>
                          {integration.name}
                        </h4>
                        {integration.connected && (
                          <span className="badge badge-success">
                            <CheckCircle2 size={12} /> Connected
                          </span>
                        )}
                      </div>
                      <p
                        style={{
                          fontSize: "0.8125rem",
                          color: "var(--text-secondary)",
                          lineHeight: "1.5",
                          marginBottom: "16px",
                        }}
                      >
                        {integration.description}
                      </p>
                      <button
                        className={`btn btn-sm ${
                          integration.connected ? "btn-secondary" : "btn-primary"
                        }`}
                      >
                        {integration.connected ? "Manage" : "Connect"}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
