"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDemoLogin = async () => {
    setIsLoading(true);
    await signIn("credentials", {
      email: email || "jane@bookly.app",
      callbackUrl: "/dashboard",
    });
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    await signIn("google", {
      callbackUrl: "/dashboard",
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          top: "-50%",
          left: "-50%",
          width: "200%",
          height: "200%",
          background:
            "radial-gradient(circle at 30% 50%, rgba(99,102,241,0.12) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(168,85,247,0.08) 0%, transparent 40%)",
        }}
      />

      <div
        className="animate-slide-up"
        style={{
          width: "100%",
          maxWidth: "420px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "40px",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "var(--radius-md)",
              background: "linear-gradient(135deg, var(--color-primary-400), var(--color-primary-600))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "1.2rem",
              color: "white",
            }}
          >
            B
          </div>
          <span
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "white",
              letterSpacing: "-0.03em",
            }}
          >
            Bookly
          </span>
        </div>

        {/* Card */}
        <div
          className="card"
          style={{
            padding: "40px",
            background: "white",
          }}
        >
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              textAlign: "center",
              marginBottom: "8px",
            }}
          >
            Welcome back
          </h1>
          <p
            style={{
              textAlign: "center",
              fontSize: "0.9375rem",
              color: "var(--text-secondary)",
              marginBottom: "32px",
            }}
          >
            Sign in to manage your bookings
          </p>

          {/* Google Sign In */}
          <button
            className="btn btn-secondary"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "14px",
              fontSize: "0.9375rem",
              marginBottom: "16px",
              gap: "12px",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              margin: "24px 0",
            }}
          >
            <div
              style={{ flex: 1, height: "1px", background: "var(--border-default)" }}
            />
            <span
              style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)" }}
            >
              or
            </span>
            <div
              style={{ flex: 1, height: "1px", background: "var(--border-default)" }}
            />
          </div>

          {/* Demo Login */}
          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label className="form-label">Email</label>
            <div style={{ position: "relative" }}>
              <Mail
                size={16}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "12px",
                  color: "var(--text-tertiary)",
                }}
              />
              <input
                className="input"
                type="email"
                placeholder="jane@bookly.app"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: "36px" }}
              />
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleDemoLogin}
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "14px",
              fontSize: "0.9375rem",
            }}
          >
            {isLoading ? "Signing in..." : "Sign in with Demo"}
            {!isLoading && <ArrowRight size={16} />}
          </button>

          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--text-tertiary)",
              textAlign: "center",
              marginTop: "20px",
              lineHeight: "1.5",
            }}
          >
            Don&apos;t have an account?{" "}
            <Link
              href="/login"
              style={{
                color: "var(--color-primary-500)",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Sign up for free
            </Link>
          </p>
        </div>

        {/* Back to home */}
        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <Link
            href="/"
            style={{
              fontSize: "0.875rem",
              color: "rgba(255,255,255,0.5)",
              textDecoration: "none",
            }}
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
