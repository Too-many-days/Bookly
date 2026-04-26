import Link from "next/link";
import {
  Calendar,
  Clock,
  Globe,
  Zap,
  Shield,
  Code,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function LandingPage() {
  return (
    <>
      {/* ─── Hero Section ─────────────────────────────────── */}
      <section className="landing-hero">
        <nav className="landing-nav">
          <Link href="/" className="landing-nav-logo">
            <div className="landing-nav-logo-icon">B</div>
            <span className="landing-nav-logo-text">Bookly</span>
          </Link>
          <div className="landing-nav-links">
            <Link href="#features">Features</Link>
            <Link href="#pricing">Pricing</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/dashboard" className="btn btn-primary btn-sm">
              Get Started
            </Link>
          </div>
        </nav>

        <div className="landing-hero-content">
          <div className="landing-badge animate-slide-up">
            <span className="landing-badge-dot"></span>
            Now in public beta
          </div>
          <h1 className="animate-slide-up animate-slide-up-1">
            Scheduling made <span>beautifully simple</span>
          </h1>
          <p className="landing-hero-subtitle animate-slide-up animate-slide-up-2">
            Drop a single line of code on your website and let your clients book
            appointments 24/7. No back-and-forth emails. No double bookings.
          </p>
          <div className="landing-hero-actions animate-slide-up animate-slide-up-3">
            <Link href="/dashboard" className="btn btn-primary btn-lg">
              Start for free <ArrowRight size={18} />
            </Link>
            <Link href="/book/jane-cooper/strategy-session" className="btn btn-secondary btn-lg">
              See live demo
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Features Section ─────────────────────────────── */}
      <section className="landing-features" id="features">
        <div className="landing-features-header">
          <h2>Everything you need to manage bookings</h2>
          <p>
            Powerful features designed for freelancers and small businesses who
            want a professional scheduling experience.
          </p>
        </div>
        <div className="landing-features-grid">
          <div className="landing-feature-card">
            <div className="landing-feature-icon">
              <Code />
            </div>
            <h3>Embeddable Widget</h3>
            <p>
              Add a beautiful booking widget to any website with a single line of
              code. Works with WordPress, Webflow, Shopify, and more.
            </p>
          </div>
          <div className="landing-feature-card">
            <div className="landing-feature-icon">
              <Calendar />
            </div>
            <h3>Calendar Sync</h3>
            <p>
              Two-way sync with Google Calendar and Outlook. Your availability
              updates automatically — no more double bookings.
            </p>
          </div>
          <div className="landing-feature-card">
            <div className="landing-feature-icon">
              <Globe />
            </div>
            <h3>Timezone Smart</h3>
            <p>
              Automatic timezone detection for your guests. Time slots are
              always shown in the viewer&apos;s local time.
            </p>
          </div>
          <div className="landing-feature-card">
            <div className="landing-feature-icon">
              <Zap />
            </div>
            <h3>Instant Confirmations</h3>
            <p>
              Automated confirmation and reminder emails for both you and your
              guests. Never miss a meeting again.
            </p>
          </div>
          <div className="landing-feature-card">
            <div className="landing-feature-icon">
              <Shield />
            </div>
            <h3>Payment Collection</h3>
            <p>
              Require payment when booking with Stripe integration. Perfect for
              paid consultations and coaching sessions.
            </p>
          </div>
          <div className="landing-feature-card">
            <div className="landing-feature-icon">
              <Sparkles />
            </div>
            <h3>Custom Branding</h3>
            <p>
              Match your brand with custom colors, logos, and booking questions.
              Make it feel like your own.
            </p>
          </div>
        </div>
      </section>

      {/* ─── How it Works ─────────────────────────────────── */}
      <section
        style={{
          padding: "100px 48px",
          background: "var(--bg-secondary)",
        }}
      >
        <div className="landing-features-header">
          <h2>Up and running in 3 minutes</h2>
          <p>
            No complex setup. No learning curve. Just create your event types,
            set your availability, and share your link.
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "48px",
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          {[
            {
              step: "01",
              title: "Create event types",
              description:
                'Define your meeting types — "15-min intro", "1-hour consultation", etc. Set duration, buffer times, and location.',
            },
            {
              step: "02",
              title: "Set your availability",
              description:
                "Define your working hours, lunch breaks, and blocked dates. Bookly only shows available slots.",
            },
            {
              step: "03",
              title: "Share & embed",
              description:
                "Share your booking link or embed the widget on your website. Clients can book 24/7.",
            },
          ].map((item) => (
            <div key={item.step} style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "var(--radius-full)",
                  background:
                    "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "700",
                  fontSize: "1.125rem",
                  margin: "0 auto 20px",
                }}
              >
                {item.step}
              </div>
              <h3 style={{ marginBottom: "8px" }}>{item.title}</h3>
              <p
                style={{
                  fontSize: "0.9375rem",
                  color: "var(--text-secondary)",
                  lineHeight: "1.6",
                }}
              >
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Embed Code Preview ───────────────────────────── */}
      <section
        style={{
          padding: "100px 48px",
          background: "var(--bg-primary)",
          textAlign: "center",
        }}
      >
        <div className="landing-features-header">
          <h2>One line of code. That&apos;s it.</h2>
          <p>
            Embed Bookly on any website in seconds. Zero dependencies, zero
            conflicts, under 30KB.
          </p>
        </div>
        <div
          style={{
            maxWidth: "700px",
            margin: "0 auto",
            background: "#0f172a",
            borderRadius: "var(--radius-xl)",
            padding: "32px",
            textAlign: "left",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: "#ef4444",
              }}
            ></div>
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: "#f59e0b",
              }}
            ></div>
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: "#10b981",
              }}
            ></div>
          </div>
          <pre
            style={{
              color: "#e2e8f0",
              fontSize: "0.9375rem",
              lineHeight: "1.8",
              fontFamily:
                '"SF Mono", "Fira Code", "Fira Mono", "Roboto Mono", monospace',
              overflow: "auto",
            }}
          >
            <code>
              <span style={{ color: "#94a3b8" }}>
                {`<!-- Add this to your website -->`}
              </span>
              {"\n"}
              <span style={{ color: "#818cf8" }}>{`<script`}</span>
              {" "}
              <span style={{ color: "#a5b4fc" }}>src</span>
              <span style={{ color: "#94a3b8" }}>=</span>
              <span style={{ color: "#86efac" }}>
                {`"https://widget.bookly.app/v1/embed.js"`}
              </span>
              <span style={{ color: "#818cf8" }}>{`>`}</span>
              <span style={{ color: "#818cf8" }}>{`</script>`}</span>
              {"\n"}
              <span style={{ color: "#818cf8" }}>{`<bookly-widget`}</span>
              {"\n"}
              {"  "}
              <span style={{ color: "#a5b4fc" }}>data-user</span>
              <span style={{ color: "#94a3b8" }}>=</span>
              <span style={{ color: "#86efac" }}>{`"jane-cooper"`}</span>
              {"\n"}
              {"  "}
              <span style={{ color: "#a5b4fc" }}>data-theme</span>
              <span style={{ color: "#94a3b8" }}>=</span>
              <span style={{ color: "#86efac" }}>{`"auto"`}</span>
              {"\n"}
              {"  "}
              <span style={{ color: "#a5b4fc" }}>data-accent</span>
              <span style={{ color: "#94a3b8" }}>=</span>
              <span style={{ color: "#86efac" }}>{`"#6366f1"`}</span>
              {"\n"}
              <span style={{ color: "#818cf8" }}>{`/>`}</span>
            </code>
          </pre>
        </div>
      </section>

      {/* ─── Social Proof ─────────────────────────────────── */}
      <section
        style={{
          padding: "80px 48px",
          background: "var(--bg-secondary)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "60px",
            flexWrap: "wrap",
          }}
        >
          {[
            { value: "2,500+", label: "Active Users" },
            { value: "45,000+", label: "Bookings Made" },
            { value: "99.9%", label: "Uptime" },
            { value: "4.9/5", label: "User Rating" },
          ].map((stat) => (
            <div key={stat.label}>
              <div
                style={{
                  fontSize: "2.25rem",
                  fontWeight: "800",
                  letterSpacing: "-0.03em",
                  background:
                    "linear-gradient(135deg, var(--color-primary-600), #a855f7)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: "0.9375rem",
                  color: "var(--text-secondary)",
                  marginTop: "4px",
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA Section ──────────────────────────────────── */}
      <section className="landing-cta">
        <h2>Ready to simplify your scheduling?</h2>
        <p>
          Join thousands of freelancers and businesses who save hours every week
          with Bookly.
        </p>
        <Link href="/dashboard" className="btn btn-primary btn-lg">
          Get started — it&apos;s free <ArrowRight size={18} />
        </Link>
      </section>

      {/* ─── Footer ───────────────────────────────────────── */}
      <footer className="landing-footer">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            className="landing-nav-logo-icon"
            style={{ width: "28px", height: "28px", fontSize: "0.9rem" }}
          >
            B
          </div>
          <span className="landing-footer-text">
            © 2026 Bookly. All rights reserved.
          </span>
        </div>
        <div
          style={{
            display: "flex",
            gap: "24px",
          }}
        >
          <a
            href="#"
            style={{
              color: "var(--color-neutral-500)",
              fontSize: "0.875rem",
              textDecoration: "none",
            }}
          >
            Privacy
          </a>
          <a
            href="#"
            style={{
              color: "var(--color-neutral-500)",
              fontSize: "0.875rem",
              textDecoration: "none",
            }}
          >
            Terms
          </a>
          <a
            href="#"
            style={{
              color: "var(--color-neutral-500)",
              fontSize: "0.875rem",
              textDecoration: "none",
            }}
          >
            Contact
          </a>
        </div>
      </footer>
    </>
  );
}
