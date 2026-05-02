import { Clock } from "lucide-react";
import { getAuthUser } from "@/lib/get-auth-user";
import { getDefaultSchedule } from "@/lib/dal";

export const metadata = {
  title: "Availability — Bookly",
};

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

export default async function AvailabilityPage() {
  const user = await getAuthUser();
  const scheduleData = await getDefaultSchedule(user.id);

  const schedule = scheduleData?.schedule;
  const scheduleRules = scheduleData?.rules ?? [];

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Availability</h1>
          <p className="page-header-subtitle">
            Configure when you&apos;re available for bookings.
          </p>
        </div>
        <button className="btn btn-primary">
          <Clock size={16} />
          Add Schedule
        </button>
      </div>

      <div className="page-body">
        {!schedule ? (
          <div className="card" style={{ padding: "48px", textAlign: "center" }}>
            <div className="empty-state-icon" style={{ marginBottom: "16px" }}>
              <Clock />
            </div>
            <h3>No schedule configured</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>
              Set up your availability so clients can book time with you.
            </p>
            <button className="btn btn-primary">
              <Clock size={16} /> Create Schedule
            </button>
          </div>
        ) : (
          <div className="card" style={{ padding: "24px", marginBottom: "24px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <div>
                <h3>{schedule.name}</h3>
                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--text-secondary)",
                    marginTop: "4px",
                  }}
                >
                  {schedule.timezone}
                </p>
              </div>
              <span className="badge badge-primary">Default</span>
            </div>

            <div className="availability-grid">
              {DAYS.map((day, dayIndex) => {
                const rules = scheduleRules.filter(
                  (r) => r.dayOfWeek === dayIndex && !r.isOverride
                );
                const isAvailable = rules.length > 0;

                return (
                  <div key={day} style={{ display: "contents" }}>
                    <div
                      className="availability-day-label"
                      style={{
                        borderRight: "1px solid var(--border-default)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <div
                          className={`toggle ${isAvailable ? "active" : ""}`}
                          style={{ flexShrink: 0 }}
                        />
                        {day}
                      </div>
                    </div>
                    <div className="availability-day-slots">
                      {isAvailable ? (
                        rules.map((rule) => (
                          <span key={rule.id} className="availability-slot">
                            {formatTime(rule.startTime)} –{" "}
                            {formatTime(rule.endTime)}
                          </span>
                        ))
                      ) : (
                        <span className="availability-off">Unavailable</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
