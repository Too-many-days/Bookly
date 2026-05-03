"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Clock, Save, Check, Loader2, Plus, Trash2 } from "lucide-react";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface RuleData {
  id: string;
  dayOfWeek: number | null;
  startTime: string;
  endTime: string;
  isOverride: boolean;
}

interface AvailabilityViewProps {
  scheduleName: string | null;
  scheduleTimezone: string;
  rules: RuleData[];
}

interface DayConfig {
  enabled: boolean;
  slots: Array<{ startTime: string; endTime: string }>;
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

function buildDayConfigs(rules: RuleData[]): DayConfig[] {
  return DAYS.map((_, dayIndex) => {
    const dayRules = rules.filter(
      (r) => r.dayOfWeek === dayIndex && !r.isOverride
    );
    return {
      enabled: dayRules.length > 0,
      slots:
        dayRules.length > 0
          ? dayRules.map((r) => ({
              startTime: r.startTime,
              endTime: r.endTime,
            }))
          : [{ startTime: "09:00", endTime: "17:00" }],
    };
  });
}

export function AvailabilityView({
  scheduleName,
  scheduleTimezone,
  rules: initialRules,
}: AvailabilityViewProps) {
  const router = useRouter();
  const [dayConfigs, setDayConfigs] = useState<DayConfig[]>(
    buildDayConfigs(initialRules)
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const updateDay = useCallback(
    (dayIndex: number, update: Partial<DayConfig>) => {
      setDayConfigs((prev) =>
        prev.map((d, i) => (i === dayIndex ? { ...d, ...update } : d))
      );
      setHasChanges(true);
      setSaved(false);
    },
    []
  );

  const toggleDay = (dayIndex: number) => {
    updateDay(dayIndex, { enabled: !dayConfigs[dayIndex].enabled });
  };

  const updateSlot = (
    dayIndex: number,
    slotIndex: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    const newSlots = [...dayConfigs[dayIndex].slots];
    newSlots[slotIndex] = { ...newSlots[slotIndex], [field]: value };
    updateDay(dayIndex, { slots: newSlots });
  };

  const addSlot = (dayIndex: number) => {
    const lastSlot =
      dayConfigs[dayIndex].slots[dayConfigs[dayIndex].slots.length - 1];
    const newSlots = [
      ...dayConfigs[dayIndex].slots,
      { startTime: lastSlot.endTime, endTime: "17:00" },
    ];
    updateDay(dayIndex, { slots: newSlots });
  };

  const removeSlot = (dayIndex: number, slotIndex: number) => {
    const newSlots = dayConfigs[dayIndex].slots.filter(
      (_, i) => i !== slotIndex
    );
    if (newSlots.length === 0) {
      updateDay(dayIndex, { enabled: false, slots: [{ startTime: "09:00", endTime: "17:00" }] });
    } else {
      updateDay(dayIndex, { slots: newSlots });
    }
  };

  const saveSchedule = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      // Build flat rules array from day configs
      const rules: Array<{
        dayOfWeek: number;
        startTime: string;
        endTime: string;
      }> = [];
      dayConfigs.forEach((day, dayIndex) => {
        if (day.enabled) {
          day.slots.forEach((slot) => {
            rules.push({
              dayOfWeek: dayIndex,
              startTime: slot.startTime,
              endTime: slot.endTime,
            });
          });
        }
      });

      const res = await fetch("/api/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rules }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save schedule");
        return;
      }

      setSaved(true);
      setHasChanges(false);
      setTimeout(() => setSaved(false), 3000);
      router.refresh();
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const timeOptions: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const val = `${h.toString().padStart(2, "0")}:${m
        .toString()
        .padStart(2, "0")}`;
      timeOptions.push(val);
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Availability</h1>
          <p className="page-header-subtitle">
            Configure when you&apos;re available for bookings.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={saveSchedule}
          disabled={saving || !hasChanges}
        >
          {saving ? (
            <>
              <Loader2
                size={16}
                style={{ animation: "spin 1s linear infinite" }}
              />
              Saving...
            </>
          ) : saved ? (
            <>
              <Check size={16} />
              Saved!
            </>
          ) : (
            <>
              <Save size={16} />
              Save Schedule
            </>
          )}
        </button>
      </div>

      <div className="page-body">
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

        <div
          className="card"
          style={{ padding: "24px", marginBottom: "24px" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <div>
              <h3>{scheduleName || "Working Hours"}</h3>
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--text-secondary)",
                  marginTop: "4px",
                }}
              >
                {scheduleTimezone}
              </p>
            </div>
            <span className="badge badge-primary">Default</span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0",
            }}
          >
            {DAYS.map((day, dayIndex) => {
              const config = dayConfigs[dayIndex];

              return (
                <div
                  key={day}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "16px",
                    padding: "16px 0",
                    borderBottom:
                      dayIndex < 6
                        ? "1px solid var(--border-default)"
                        : "none",
                  }}
                >
                  {/* Toggle + Day Name */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      minWidth: "160px",
                      paddingTop: "6px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleDay(dayIndex)}
                      style={{
                        width: "44px",
                        height: "24px",
                        borderRadius: "12px",
                        background: config.enabled
                          ? "var(--color-primary-500)"
                          : "var(--bg-tertiary)",
                        position: "relative",
                        transition: "background 200ms ease",
                        border: "1px solid var(--border-default)",
                        cursor: "pointer",
                        flexShrink: 0,
                        outline: "none",
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
                          left: config.enabled ? "22px" : "2px",
                          transition: "left 200ms ease",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        }}
                      />
                    </button>
                    <span
                      style={{
                        fontWeight: 500,
                        fontSize: "0.9375rem",
                        color: config.enabled
                          ? "var(--text-primary)"
                          : "var(--text-tertiary)",
                      }}
                    >
                      {day}
                    </span>
                  </div>

                  {/* Time Slots */}
                  <div style={{ flex: 1 }}>
                    {config.enabled ? (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
                        {config.slots.map((slot, slotIndex) => (
                          <div
                            key={slotIndex}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <select
                              className="input"
                              value={slot.startTime}
                              onChange={(e) =>
                                updateSlot(
                                  dayIndex,
                                  slotIndex,
                                  "startTime",
                                  e.target.value
                                )
                              }
                              style={{
                                maxWidth: "130px",
                                padding: "6px 10px",
                                fontSize: "0.875rem",
                              }}
                            >
                              {timeOptions.map((t) => (
                                <option key={t} value={t}>
                                  {formatTime(t)}
                                </option>
                              ))}
                            </select>
                            <span
                              style={{
                                color: "var(--text-tertiary)",
                                fontSize: "0.875rem",
                              }}
                            >
                              –
                            </span>
                            <select
                              className="input"
                              value={slot.endTime}
                              onChange={(e) =>
                                updateSlot(
                                  dayIndex,
                                  slotIndex,
                                  "endTime",
                                  e.target.value
                                )
                              }
                              style={{
                                maxWidth: "130px",
                                padding: "6px 10px",
                                fontSize: "0.875rem",
                              }}
                            >
                              {timeOptions.map((t) => (
                                <option key={t} value={t}>
                                  {formatTime(t)}
                                </option>
                              ))}
                            </select>
                            {config.slots.length > 1 && (
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => removeSlot(dayIndex, slotIndex)}
                                style={{ padding: "4px", color: "var(--text-tertiary)" }}
                                title="Remove time slot"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => addSlot(dayIndex)}
                          style={{
                            alignSelf: "flex-start",
                            fontSize: "0.8125rem",
                            color: "var(--color-primary-500)",
                          }}
                        >
                          <Plus size={14} />
                          Add time slot
                        </button>
                      </div>
                    ) : (
                      <span
                        style={{
                          fontSize: "0.875rem",
                          color: "var(--text-tertiary)",
                          paddingTop: "6px",
                          display: "block",
                        }}
                      >
                        Unavailable
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
