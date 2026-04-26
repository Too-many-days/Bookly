import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

interface TimeSlot {
  start: string;
  end: string;
  display: string;
}

type Step = "calendar" | "time" | "form" | "success";

/**
 * <bookly-widget> — Embeddable booking widget
 *
 * Usage:
 *   <script src="https://widget.bookly.app/v1/embed.js" async></script>
 *   <bookly-widget
 *     data-user="jane-cooper"
 *     data-event="strategy-session"
 *     data-accent="#6366f1"
 *     data-api="https://bookly.app"
 *   ></bookly-widget>
 */
@customElement("bookly-widget")
export class BooklyWidget extends LitElement {
  @property({ attribute: "data-user" }) userSlug = "";
  @property({ attribute: "data-event" }) eventSlug = "";
  @property({ attribute: "data-accent" }) accent = "#6366f1";
  @property({ attribute: "data-api" }) apiBase = "http://localhost:3000";
  @property({ attribute: "data-theme" }) theme = "light";

  @state() private step: Step = "calendar";
  @state() private currentMonth = new Date();
  @state() private selectedDate: Date | null = null;
  @state() private selectedSlot: TimeSlot | null = null;
  @state() private timeSlots: TimeSlot[] = [];
  @state() private isLoading = false;
  @state() private isSubmitting = false;
  @state() private error = "";
  @state() private formName = "";
  @state() private formEmail = "";
  @state() private formNotes = "";
  @state() private eventInfo: {
    title: string;
    durationMinutes: number;
    locationType: string;
    locationValue: string;
  } | null = null;
  @state() private hostInfo: { name: string; timezone: string } | null = null;

  static styles = css`
    :host {
      display: block;
      font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
        Roboto, sans-serif;
      line-height: 1.5;
      color: #0f172a;
      --accent: #6366f1;
      --accent-light: #eef2ff;
      --accent-dark: #4f46e5;
      --border: #e2e8f0;
      --bg: #ffffff;
      --bg-secondary: #f8fafc;
      --text: #0f172a;
      --text-secondary: #475569;
      --text-muted: #94a3b8;
      --radius: 10px;
      --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.07),
        0 2px 4px -2px rgb(0 0 0 / 0.05);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    .widget-container {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      box-shadow: var(--shadow);
      overflow: hidden;
      max-width: 440px;
      margin: 0 auto;
    }

    .widget-header {
      padding: 20px 24px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .widget-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--accent), #a855f7);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 14px;
      flex-shrink: 0;
    }

    .widget-host-name {
      font-size: 13px;
      color: var(--text-muted);
    }

    .widget-event-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text);
    }

    .widget-meta {
      padding: 12px 24px;
      display: flex;
      gap: 16px;
      font-size: 13px;
      color: var(--text-secondary);
      border-bottom: 1px solid var(--border);
      background: var(--bg-secondary);
    }

    .widget-meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .widget-body {
      padding: 24px;
    }

    /* Step Title */
    .step-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 20px;
    }

    .step-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--text);
    }

    .back-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-secondary);
      padding: 4px;
      border-radius: 6px;
      display: flex;
    }

    .back-btn:hover {
      background: var(--bg-secondary);
    }

    /* Calendar */
    .cal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .cal-month {
      font-size: 15px;
      font-weight: 600;
    }

    .cal-nav {
      display: flex;
      gap: 4px;
    }

    .cal-nav-btn {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      border: 1px solid var(--border);
      background: var(--bg);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
      font-size: 14px;
    }

    .cal-nav-btn:hover {
      background: var(--bg-secondary);
    }

    .cal-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 2px;
    }

    .cal-weekday {
      padding: 6px;
      text-align: center;
      font-size: 11px;
      font-weight: 500;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .cal-day {
      aspect-ratio: 1;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      background: none;
      color: var(--text);
      position: relative;
      font-family: inherit;
    }

    .cal-day:hover:not(.disabled):not(.selected) {
      background: var(--accent-light);
      color: var(--accent);
    }

    .cal-day.today {
      border: 2px solid var(--accent-light);
    }

    .cal-day.selected {
      background: var(--accent) !important;
      color: white !important;
    }

    .cal-day.disabled {
      color: #cbd5e1;
      cursor: default;
    }

    .cal-day.has-slots::after {
      content: "";
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: var(--accent);
      position: absolute;
      bottom: 3px;
    }

    .cal-day.selected.has-slots::after {
      background: white;
    }

    /* Time Slots */
    .time-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      max-height: 300px;
      overflow-y: auto;
    }

    .time-btn {
      padding: 10px;
      border: 1px solid var(--border);
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      text-align: center;
      background: var(--bg);
      color: var(--text);
      font-family: inherit;
      transition: all 150ms ease;
    }

    .time-btn:hover {
      border-color: var(--accent);
      background: var(--accent-light);
      color: var(--accent);
    }

    .time-btn.selected {
      background: var(--accent);
      color: white;
      border-color: var(--accent);
    }

    /* Form */
    .form-group {
      margin-bottom: 14px;
    }

    .form-label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 5px;
      color: var(--text);
    }

    .form-label .required {
      color: #ef4444;
    }

    .form-input {
      width: 100%;
      padding: 9px 12px;
      font-size: 14px;
      font-family: inherit;
      color: var(--text);
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      outline: none;
      transition: border-color 150ms ease;
    }

    .form-input:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    .form-input::placeholder {
      color: var(--text-muted);
    }

    textarea.form-input {
      resize: vertical;
      min-height: 70px;
    }

    /* Buttons */
    .submit-btn {
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, var(--accent), var(--accent-dark));
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      font-family: inherit;
      transition: all 150ms ease;
    }

    .submit-btn:hover:not(:disabled) {
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
      transform: translateY(-1px);
    }

    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Success */
    .success {
      text-align: center;
      padding: 20px 0;
    }

    .success-icon {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #ecfdf5, #d1fae5);
      color: #10b981;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
    }

    .success h2 {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 6px;
    }

    .success p {
      font-size: 14px;
      color: var(--text-secondary);
      margin-bottom: 20px;
    }

    .success-details {
      background: var(--bg-secondary);
      border-radius: 8px;
      padding: 16px;
      text-align: left;
      margin-bottom: 20px;
    }

    .success-row {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--text-secondary);
      margin-bottom: 8px;
    }

    .success-row:last-child {
      margin-bottom: 0;
    }

    .secondary-btn {
      padding: 10px 20px;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--bg);
      color: var(--text);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      font-family: inherit;
    }

    .secondary-btn:hover {
      background: var(--bg-secondary);
    }

    /* Error */
    .error-msg {
      padding: 10px 14px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      color: #991b1b;
      font-size: 13px;
      margin-bottom: 16px;
    }

    .loading {
      text-align: center;
      padding: 30px;
      color: var(--text-muted);
      font-size: 13px;
    }

    /* Footer */
    .widget-footer {
      padding: 12px 24px;
      text-align: center;
      font-size: 11px;
      color: var(--text-muted);
      border-top: 1px solid var(--border);
    }

    .widget-footer a {
      color: var(--accent);
      font-weight: 600;
      text-decoration: none;
    }

    .selected-info {
      padding: 10px 14px;
      background: var(--accent-light);
      border-radius: 8px;
      font-size: 13px;
      color: var(--accent-dark);
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    .spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      margin-right: 6px;
      vertical-align: middle;
    }
  `;

  // ─── Calendar Helpers ───────────────────────────────────

  private get calendarDays(): Array<{ date: Date; isCurrentMonth: boolean }> {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();

    const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];

    // Previous month padding
    for (let i = startDay - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({ date: d, isCurrentMonth: false });
    }

    // Current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    // Next month padding
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return days;
  }

  private isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  private isAvailableDay(date: Date): boolean {
    const day = date.getDay();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return false;
    // Weekdays only (Mon–Fri = 1–5)
    return day >= 1 && day <= 5;
  }

  private formatMonth(date: Date): string {
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  private formatShortDate(date: Date): string {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }

  // ─── API Calls ──────────────────────────────────────────

  private async fetchSlots(date: Date) {
    this.isLoading = true;
    this.error = "";
    try {
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      const res = await fetch(
        `${this.apiBase}/api/availability?slug=${this.userSlug}&event=${this.eventSlug}&date=${dateStr}`
      );
      const data = await res.json();
      if (!res.ok) {
        this.error = data.error || "Failed to load times";
        this.timeSlots = [];
      } else {
        this.timeSlots = data.slots || [];
        if (data.eventType && !this.eventInfo) {
          this.eventInfo = data.eventType;
        }
        if (data.user && !this.hostInfo) {
          this.hostInfo = data.user;
        }
      }
    } catch {
      this.error = "Failed to connect. Please try again.";
      this.timeSlots = [];
    }
    this.isLoading = false;
  }

  private async submitBooking() {
    if (!this.selectedDate || !this.selectedSlot) return;
    this.isSubmitting = true;
    this.error = "";

    try {
      const dateStr = `${this.selectedDate.getFullYear()}-${String(this.selectedDate.getMonth() + 1).padStart(2, "0")}-${String(this.selectedDate.getDate()).padStart(2, "0")}`;
      const res = await fetch(`${this.apiBase}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: this.userSlug,
          eventSlug: this.eventSlug,
          date: dateStr,
          time: this.selectedSlot.start,
          name: this.formName,
          email: this.formEmail,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          notes: this.formNotes || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        this.error = data.error || "Booking failed";
      } else {
        this.step = "success";
      }
    } catch {
      this.error = "Failed to submit. Please try again.";
    }
    this.isSubmitting = false;
  }

  // ─── Event Handlers ─────────────────────────────────────

  private selectDate(date: Date) {
    if (!this.isAvailableDay(date)) return;
    this.selectedDate = date;
    this.selectedSlot = null;
    this.step = "time";
    this.fetchSlots(date);
  }

  private selectTime(slot: TimeSlot) {
    this.selectedSlot = slot;
    this.step = "form";
  }

  private goBack() {
    this.error = "";
    if (this.step === "time") {
      this.step = "calendar";
      this.selectedDate = null;
    } else if (this.step === "form") {
      this.step = "time";
      this.selectedSlot = null;
    }
  }

  private prevMonth() {
    const d = new Date(this.currentMonth);
    d.setMonth(d.getMonth() - 1);
    this.currentMonth = d;
  }

  private nextMonth() {
    const d = new Date(this.currentMonth);
    d.setMonth(d.getMonth() + 1);
    this.currentMonth = d;
  }

  private reset() {
    this.step = "calendar";
    this.selectedDate = null;
    this.selectedSlot = null;
    this.formName = "";
    this.formEmail = "";
    this.formNotes = "";
    this.error = "";
  }

  private handleSubmit(e: Event) {
    e.preventDefault();
    this.submitBooking();
  }

  // ─── Templates ──────────────────────────────────────────

  private renderCalendar() {
    const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const today = new Date();

    return html`
      <div class="cal-header">
        <span class="cal-month">${this.formatMonth(this.currentMonth)}</span>
        <div class="cal-nav">
          <button class="cal-nav-btn" @click=${this.prevMonth}>‹</button>
          <button class="cal-nav-btn" @click=${this.nextMonth}>›</button>
        </div>
      </div>
      <div class="cal-grid">
        ${weekdays.map((d) => html`<div class="cal-weekday">${d}</div>`)}
        ${this.calendarDays.map(({ date, isCurrentMonth }) => {
          const isToday = this.isSameDay(date, today);
          const isSelected =
            this.selectedDate && this.isSameDay(date, this.selectedDate);
          const available = isCurrentMonth && this.isAvailableDay(date);

          const classes = [
            "cal-day",
            isToday ? "today" : "",
            isSelected ? "selected" : "",
            !available ? "disabled" : "",
            available ? "has-slots" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return html`
            <button
              class=${classes}
              @click=${() => available && this.selectDate(date)}
              ?disabled=${!available}
            >
              ${date.getDate()}
            </button>
          `;
        })}
      </div>
    `;
  }

  private renderTimeSlots() {
    return html`
      <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px;">
        ${this.selectedDate ? this.formatDate(this.selectedDate) : ""}
      </div>
      ${this.isLoading
        ? html`<div class="loading">Loading available times...</div>`
        : this.timeSlots.length > 0
        ? html`
            <div class="time-grid">
              ${this.timeSlots.map(
                (slot) => html`
                  <button
                    class="time-btn ${this.selectedSlot?.start === slot.start
                      ? "selected"
                      : ""}"
                    @click=${() => this.selectTime(slot)}
                  >
                    ${slot.display}
                  </button>
                `
              )}
            </div>
          `
        : html`<div class="loading">No available times for this date.</div>`}
    `;
  }

  private renderForm() {
    return html`
      <form @submit=${this.handleSubmit}>
        ${this.selectedDate && this.selectedSlot
          ? html`
              <div class="selected-info">
                📅 ${this.formatShortDate(this.selectedDate)} at
                ${this.selectedSlot.display}
                ${this.eventInfo ? ` · ${this.eventInfo.durationMinutes} min` : ""}
              </div>
            `
          : nothing}

        <div class="form-group">
          <label class="form-label"
            >Name <span class="required">*</span></label
          >
          <input
            class="form-input"
            placeholder="Your full name"
            .value=${this.formName}
            @input=${(e: Event) => (this.formName = (e.target as HTMLInputElement).value)}
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label"
            >Email <span class="required">*</span></label
          >
          <input
            class="form-input"
            type="email"
            placeholder="your@email.com"
            .value=${this.formEmail}
            @input=${(e: Event) => (this.formEmail = (e.target as HTMLInputElement).value)}
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">Notes</label>
          <textarea
            class="form-input"
            placeholder="Anything you'd like to discuss..."
            .value=${this.formNotes}
            @input=${(e: Event) => (this.formNotes = (e.target as HTMLTextAreaElement).value)}
            rows="3"
          ></textarea>
        </div>

        <button class="submit-btn" type="submit" ?disabled=${this.isSubmitting}>
          ${this.isSubmitting
            ? html`<span class="spinner"></span>Confirming...`
            : "Confirm Booking"}
        </button>
      </form>
    `;
  }

  private renderSuccess() {
    return html`
      <div class="success">
        <div class="success-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 6 9 17l-5-5"/>
          </svg>
        </div>
        <h2>You're booked!</h2>
        <p>A confirmation email has been sent to <strong>${this.formEmail}</strong>.</p>

        ${this.selectedDate && this.selectedSlot
          ? html`
              <div class="success-details">
                <div class="success-row">📅 ${this.formatDate(this.selectedDate)}</div>
                <div class="success-row">🕐 ${this.selectedSlot.display}${this.eventInfo ? ` · ${this.eventInfo.durationMinutes} min` : ""}</div>
                ${this.eventInfo ? html`<div class="success-row">📋 ${this.eventInfo.title}</div>` : nothing}
              </div>
            `
          : nothing}

        <button class="secondary-btn" @click=${this.reset}>
          Book another time
        </button>
      </div>
    `;
  }

  // ─── Main Render ────────────────────────────────────────

  render() {
    const initials = (this.hostInfo?.name || "")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "B";

    return html`
      <div class="widget-container">
        <!-- Header -->
        <div class="widget-header">
          <div class="widget-avatar">${initials}</div>
          <div>
            <div class="widget-host-name">${this.hostInfo?.name || this.userSlug}</div>
            <div class="widget-event-title">${this.eventInfo?.title || this.eventSlug || "Book a Time"}</div>
          </div>
        </div>

        <!-- Meta -->
        ${this.eventInfo
          ? html`
              <div class="widget-meta">
                <span class="widget-meta-item">🕐 ${this.eventInfo.durationMinutes} min</span>
                <span class="widget-meta-item">📹 ${this.eventInfo.locationValue || this.eventInfo.locationType}</span>
              </div>
            `
          : nothing}

        <!-- Body -->
        <div class="widget-body">
          ${this.step !== "success"
            ? html`
                <div class="step-header">
                  ${this.step !== "calendar"
                    ? html`<button class="back-btn" @click=${this.goBack}>←</button>`
                    : nothing}
                  <span class="step-title">
                    ${this.step === "calendar"
                      ? "Select a Date"
                      : this.step === "time"
                      ? "Select a Time"
                      : "Your Details"}
                  </span>
                </div>
              `
            : nothing}

          ${this.error
            ? html`<div class="error-msg">${this.error}</div>`
            : nothing}

          ${this.step === "calendar"
            ? this.renderCalendar()
            : this.step === "time"
            ? this.renderTimeSlots()
            : this.step === "form"
            ? this.renderForm()
            : this.renderSuccess()}
        </div>

        <!-- Footer -->
        <div class="widget-footer">
          Powered by <a href="https://bookly.app" target="_blank">Bookly</a>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "bookly-widget": BooklyWidget;
  }
}
