"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Clock,
  Video,
  Globe,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ArrowLeft,
  User,
  Mail,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { demoUser, demoEventTypes, demoScheduleRules } from "@/lib/mock-data";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isBefore,
  getDay,
} from "date-fns";

type BookingStep = "calendar" | "time" | "form" | "success";

interface TimeSlotData {
  start: string;
  end: string;
  display: string;
}

interface PageProps {
  params: Promise<{ slug: string; event: string }>;
}

export default function BookingPage({ params }: PageProps) {
  // For demo, use first active event type
  const eventType = demoEventTypes.find((et) => et.isActive) || demoEventTypes[0];
  const user = demoUser;

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<TimeSlotData | null>(null);
  const [step, setStep] = useState<BookingStep>("calendar");
  const [timeSlots, setTimeSlots] = useState<TimeSlotData[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<{
    id: string;
    meetingUrl: string | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    notes: "",
  });

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);

    const days: Date[] = [];
    let day = calStart;
    while (day <= calEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  // Check if a date has available slots (client-side pre-check)
  const hasAvailableSlots = useCallback((date: Date): boolean => {
    const dayOfWeek = getDay(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isBefore(date, today)) return false;

    // Check booking window
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + (eventType?.bookingWindowDays || 60));
    if (date > maxDate) return false;

    return demoScheduleRules.some(
      (rule) => rule.dayOfWeek === dayOfWeek && !rule.isOverride
    );
  }, [eventType?.bookingWindowDays]);

  // Fetch time slots from API when date is selected
  const fetchTimeSlots = useCallback(async (date: Date) => {
    setIsLoadingSlots(true);
    setError(null);
    try {
      const dateStr = format(date, "yyyy-MM-dd");
      const res = await fetch(
        `/api/availability?slug=${user.slug}&event=${eventType.slug}&date=${dateStr}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load time slots");
        setTimeSlots([]);
        return;
      }

      setTimeSlots(data.slots || []);
    } catch (err) {
      console.error("Failed to fetch slots:", err);
      // Fallback to client-side slot generation
      const dayOfWeek = getDay(date);
      const rules = demoScheduleRules.filter(
        (r) => r.dayOfWeek === dayOfWeek && !r.isOverride
      );
      const slots: TimeSlotData[] = [];
      const duration = eventType.durationMinutes;

      for (const rule of rules) {
        const [startH, startM] = rule.startTime.split(":").map(Number);
        const [endH, endM] = rule.endTime.split(":").map(Number);
        let currentMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;

        while (currentMinutes + duration <= endMinutes) {
          const h = Math.floor(currentMinutes / 60);
          const m = currentMinutes % 60;
          const period = h >= 12 ? "PM" : "AM";
          const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
          slots.push({
            start: `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`,
            end: `${Math.floor((currentMinutes + duration) / 60).toString().padStart(2, "0")}:${((currentMinutes + duration) % 60).toString().padStart(2, "0")}`,
            display: `${displayH}:${m.toString().padStart(2, "0")} ${period}`,
          });
          currentMinutes += 30;
        }
      }
      setTimeSlots(slots);
    } finally {
      setIsLoadingSlots(false);
    }
  }, [user.slug, eventType.slug, eventType.durationMinutes]);

  const handleDateSelect = (date: Date) => {
    if (!hasAvailableSlots(date)) return;
    setSelectedDate(date);
    setSelectedTime(null);
    setStep("time");
    fetchTimeSlots(date);
  };

  const handleTimeSelect = (slot: TimeSlotData) => {
    setSelectedTime(slot);
    setStep("form");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: user.slug,
          eventSlug: eventType.slug,
          date: format(selectedDate, "yyyy-MM-dd"),
          time: selectedTime.start,
          name: formData.name,
          email: formData.email,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          notes: formData.notes || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create booking");
        return;
      }

      setBookingResult(data.booking);
      setStep("success");
    } catch (err) {
      // Fallback for demo mode
      setBookingResult({ id: `demo-${Date.now()}`, meetingUrl: eventType.locationValue });
      setStep("success");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setError(null);
    if (step === "time") {
      setStep("calendar");
      setSelectedDate(null);
    } else if (step === "form") {
      setStep("time");
      setSelectedTime(null);
    }
  };

  return (
    <div className="booking-page">
      <div className="booking-container animate-fade-in">
        {/* Left Sidebar */}
        <div className="booking-sidebar">
          <div className="booking-host-avatar">
            {user.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div className="booking-host-name">{user.name}</div>
          <div className="booking-event-title">{eventType.title}</div>

          <div className="booking-detail">
            <Clock />
            <span>{eventType.durationMinutes} minutes</span>
          </div>
          <div className="booking-detail">
            <Video />
            <span>{eventType.locationValue || eventType.locationType}</span>
          </div>
          <div className="booking-detail">
            <Globe />
            <span>{user.timezone}</span>
          </div>

          {selectedDate && (
            <div
              className="booking-detail animate-fade-in"
              style={{
                marginTop: "16px",
                paddingTop: "16px",
                borderTop: "1px solid rgba(255,255,255,0.1)",
                color: "var(--color-primary-300)",
              }}
            >
              <CalendarDays />
              <span style={{ fontWeight: 500 }}>
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
                {selectedTime && ` · ${selectedTime.display}`}
              </span>
            </div>
          )}

          <div style={{ flex: 1 }} />

          {eventType.description && (
            <p style={{ fontSize: "0.8125rem", color: "var(--color-neutral-400)", lineHeight: "1.6", marginTop: "20px" }}>
              {eventType.description}
            </p>
          )}
        </div>

        {/* Main Content */}
        <div className="booking-main">
          {step === "success" ? (
            <div className="success-screen">
              <div className="success-icon">
                <CheckCircle2 />
              </div>
              <div className="success-title">You&apos;re booked!</div>
              <p className="success-message">
                A confirmation email has been sent to{" "}
                <strong>{formData.email || "your email"}</strong> with all the details.
              </p>
              <div className="success-details">
                <div className="success-detail-row">
                  <CalendarDays />
                  <span>{selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : ""}</span>
                </div>
                <div className="success-detail-row">
                  <Clock />
                  <span>{selectedTime?.display} · {eventType.durationMinutes} minutes</span>
                </div>
                <div className="success-detail-row">
                  <Video />
                  <span>{eventType.locationValue || eventType.locationType}</span>
                </div>
              </div>
              {bookingResult?.meetingUrl && (
                <a
                  href={bookingResult.meetingUrl}
                  className="btn btn-primary"
                  style={{ marginBottom: "12px", width: "100%", maxWidth: "280px" }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Video size={16} /> Join Meeting
                </a>
              )}
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setStep("calendar");
                  setSelectedDate(null);
                  setSelectedTime(null);
                  setBookingResult(null);
                  setFormData({ name: "", email: "", notes: "" });
                }}
              >
                Book another time
              </button>
            </div>
          ) : (
            <>
              {/* Step Header */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                {step !== "calendar" && (
                  <button className="btn btn-ghost btn-sm" onClick={handleBack} style={{ padding: "6px" }}>
                    <ArrowLeft size={18} />
                  </button>
                )}
                <div className="booking-step-title" style={{ marginBottom: 0 }}>
                  {step === "calendar" && "Select a Date"}
                  {step === "time" && "Select a Time"}
                  {step === "form" && "Enter Your Details"}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div
                  style={{
                    padding: "12px 16px",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: "var(--radius-md)",
                    color: "#991b1b",
                    fontSize: "0.875rem",
                    marginBottom: "16px",
                  }}
                >
                  {error}
                </div>
              )}

              {step === "calendar" && (
                <div className="calendar-widget animate-fade-in">
                  <div className="calendar-header">
                    <span className="calendar-month">{format(currentMonth, "MMMM yyyy")}</span>
                    <div className="calendar-nav">
                      <button className="calendar-nav-btn" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                        <ChevronLeft size={16} />
                      </button>
                      <button className="calendar-nav-btn" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="calendar-grid">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                      <div key={day} className="calendar-weekday">{day}</div>
                    ))}
                    {calendarDays.map((day, i) => {
                      const isCurrentMonth = isSameMonth(day, currentMonth);
                      const isToday = isSameDay(day, new Date());
                      const isSelected = selectedDate && isSameDay(day, selectedDate);
                      const available = hasAvailableSlots(day);

                      return (
                        <button
                          key={i}
                          className={`calendar-day ${
                            !isCurrentMonth ? "calendar-day-other-month" : ""
                          } ${isToday ? "calendar-day-today" : ""} ${
                            isSelected ? "calendar-day-selected" : ""
                          } ${!available || !isCurrentMonth ? "calendar-day-disabled" : ""} ${
                            available && isCurrentMonth ? "calendar-day-has-slots" : ""
                          }`}
                          onClick={() => isCurrentMonth && handleDateSelect(day)}
                          disabled={!available || !isCurrentMonth}
                        >
                          {format(day, "d")}
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ marginTop: "20px", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8125rem", color: "var(--text-tertiary)" }}>
                    <Globe size={14} />
                    Times shown in {Intl.DateTimeFormat().resolvedOptions().timeZone}
                  </div>
                </div>
              )}

              {step === "time" && (
                <div className="animate-fade-in">
                  <div style={{ marginBottom: "16px", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                    {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}
                  </div>
                  {isLoadingSlots ? (
                    <div style={{ textAlign: "center", padding: "40px", color: "var(--text-tertiary)" }}>
                      <Loader2 size={24} style={{ animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
                      <p>Loading available times...</p>
                    </div>
                  ) : timeSlots.length > 0 ? (
                    <div className="time-slots">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.start}
                          className={`time-slot ${selectedTime?.start === slot.start ? "selected" : ""}`}
                          onClick={() => handleTimeSelect(slot)}
                        >
                          {slot.display}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <p>No available time slots for this date.</p>
                    </div>
                  )}
                </div>
              )}

              {step === "form" && (
                <form className="booking-form animate-fade-in" onSubmit={handleSubmit}>
                  <div
                    style={{
                      padding: "12px 16px",
                      background: "var(--color-primary-50)",
                      borderRadius: "var(--radius-md)",
                      fontSize: "0.875rem",
                      color: "var(--color-primary-700)",
                      marginBottom: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <CalendarDays size={16} />
                    {selectedDate && format(selectedDate, "EEEE, MMMM d")} at{" "}
                    {selectedTime?.display} · {eventType.durationMinutes} min
                  </div>

                  <div className="form-group">
                    <label className="form-label">Name <span>*</span></label>
                    <div style={{ position: "relative" }}>
                      <User size={16} style={{ position: "absolute", left: "12px", top: "12px", color: "var(--text-tertiary)" }} />
                      <input
                        className="input"
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                        required
                        style={{ paddingLeft: "36px" }}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email <span>*</span></label>
                    <div style={{ position: "relative" }}>
                      <Mail size={16} style={{ position: "absolute", left: "12px", top: "12px", color: "var(--text-tertiary)" }} />
                      <input
                        className="input"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                        required
                        style={{ paddingLeft: "36px" }}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Additional Notes</label>
                    <div style={{ position: "relative" }}>
                      <MessageSquare size={16} style={{ position: "absolute", left: "12px", top: "12px", color: "var(--text-tertiary)" }} />
                      <textarea
                        className="input"
                        placeholder="Any topics you'd like to discuss..."
                        value={formData.notes}
                        onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                        rows={3}
                        style={{ paddingLeft: "36px" }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={isSubmitting}
                    style={{ width: "100%", marginTop: "8px" }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                        Confirming...
                      </>
                    ) : (
                      "Confirm Booking"
                    )}
                  </button>

                  <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", textAlign: "center" }}>
                    By booking you agree to our Terms of Service and Privacy Policy.
                  </p>
                </form>
              )}
            </>
          )}
        </div>
      </div>

      {/* Powered by Bookly */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(10px)",
          padding: "6px 16px",
          borderRadius: "var(--radius-full)",
          fontSize: "0.75rem",
          color: "var(--text-tertiary)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        Powered by{" "}
        <a href="/" style={{ color: "var(--color-primary-500)", fontWeight: 600, textDecoration: "none" }}>
          Bookly
        </a>
      </div>
    </div>
  );
}
