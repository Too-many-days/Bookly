"use client";

import { useState } from "react";
import { Code, Copy, Check, ExternalLink } from "lucide-react";

interface EmbedViewProps {
  userSlug: string;
  eventTypes: Array<{
    id: string;
    title: string;
    slug: string;
    color: string;
  }>;
}

export function EmbedView({ userSlug, eventTypes }: EmbedViewProps) {
  const [copied, setCopied] = useState(false);

  const embedCode = `<script src="https://widget.bookly.app/v1/embed.js" async></script>
<bookly-widget
  data-user="${userSlug}"
  data-theme="auto"
  data-accent="#6366f1"
></bookly-widget>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Embed Widget</h1>
          <p className="page-header-subtitle">
            Add Bookly to your website with a simple code snippet.
          </p>
        </div>
      </div>

      <div className="page-body">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* Code Snippet */}
          <div className="card" style={{ padding: "24px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <h3>
                <Code
                  size={18}
                  style={{
                    display: "inline",
                    verticalAlign: "middle",
                    marginRight: "8px",
                  }}
                />
                Embed Code
              </h3>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <Check size={14} /> Copied!
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Copy code
                  </>
                )}
              </button>
            </div>

            <div
              style={{
                background: "#0f172a",
                borderRadius: "var(--radius-lg)",
                padding: "24px",
                overflow: "auto",
              }}
            >
              <pre
                style={{
                  color: "#e2e8f0",
                  fontSize: "0.8125rem",
                  lineHeight: "1.8",
                  fontFamily:
                    '"SF Mono", "Fira Code", "Fira Mono", monospace',
                  margin: 0,
                }}
              >
                {embedCode}
              </pre>
            </div>

            <div
              style={{
                marginTop: "20px",
                padding: "16px",
                background: "var(--color-primary-50)",
                borderRadius: "var(--radius-md)",
                fontSize: "0.8125rem",
                color: "var(--text-secondary)",
                lineHeight: "1.6",
              }}
            >
              💡 <strong>Tip:</strong> Paste this code anywhere in your
              website&apos;s HTML where you want the booking widget to appear. It
              works on WordPress, Webflow, Squarespace, Shopify, and any custom
              site.
            </div>
          </div>

          {/* Preview */}
          <div className="card" style={{ padding: "24px" }}>
            <h3 style={{ marginBottom: "16px" }}>Preview</h3>
            <div
              style={{
                background: "var(--bg-secondary)",
                borderRadius: "var(--radius-lg)",
                padding: "32px",
                textAlign: "center",
                minHeight: "300px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                border: "2px dashed var(--border-default)",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "var(--radius-xl)",
                  background: "var(--color-primary-50)",
                  color: "var(--color-primary-500)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                }}
              >
                <Code size={28} />
              </div>
              <h4 style={{ marginBottom: "8px" }}>Widget Preview</h4>
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--text-secondary)",
                  maxWidth: "280px",
                  marginBottom: "20px",
                }}
              >
                This is where your booking widget will appear on your website.
              </p>
              {eventTypes[0] && (
                <a
                  href={`/book/${userSlug}/${eventTypes[0].slug}`}
                  className="btn btn-primary btn-sm"
                  target="_blank"
                >
                  <ExternalLink size={14} />
                  Open live preview
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Booking Links */}
        <div className="card" style={{ padding: "24px", marginTop: "24px" }}>
          <h3 style={{ marginBottom: "16px" }}>Direct Booking Links</h3>
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--text-secondary)",
              marginBottom: "20px",
            }}
          >
            Share these links directly with your clients via email, social media,
            or messaging.
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {eventTypes.map((et) => (
              <div
                key={et.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  background: "var(--bg-secondary)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: et.color,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontWeight: 500,
                    fontSize: "0.875rem",
                    minWidth: "160px",
                  }}
                >
                  {et.title}
                </span>
                <code
                  style={{
                    flex: 1,
                    fontSize: "0.8125rem",
                    color: "var(--text-secondary)",
                    fontFamily: "monospace",
                  }}
                >
                  bookly.app/book/{userSlug}/{et.slug}
                </code>
                <button className="btn btn-ghost btn-sm">
                  <Copy size={14} />
                </button>
                <a
                  href={`/book/${userSlug}/${et.slug}`}
                  className="btn btn-ghost btn-sm"
                  target="_blank"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
