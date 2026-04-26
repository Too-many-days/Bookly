import { Resend } from "resend";
import { format } from "date-fns";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.EMAIL_FROM || "Bookly <bookings@bookly.app>";

interface BookingEmailData {
  guestName: string;
  guestEmail: string;
  hostName: string;
  hostEmail: string;
  eventTitle: string;
  startTime: Date;
  endTime: Date;
  timezone: string;
  meetingUrl?: string;
  notes?: string;
}

/**
 * Send booking confirmation emails to both guest and host.
 */
export async function sendBookingConfirmation(data: BookingEmailData) {
  if (!resend) {
    console.log("📧 Email (demo mode) — Booking confirmation:");
    console.log(`   To: ${data.guestEmail}, ${data.hostEmail}`);
    console.log(`   Event: ${data.eventTitle}`);
    console.log(`   Time: ${format(data.startTime, "PPP 'at' p")} - ${format(data.endTime, "p")}`);
    return;
  }

  const dateStr = format(data.startTime, "EEEE, MMMM d, yyyy");
  const timeStr = `${format(data.startTime, "h:mm a")} - ${format(data.endTime, "h:mm a")}`;

  // Send to guest
  await resend.emails.send({
    from: FROM_EMAIL,
    to: data.guestEmail,
    subject: `Booking Confirmed: ${data.eventTitle} with ${data.hostName}`,
    html: buildGuestEmail(data, dateStr, timeStr),
  });

  // Send to host
  await resend.emails.send({
    from: FROM_EMAIL,
    to: data.hostEmail,
    subject: `New Booking: ${data.eventTitle} with ${data.guestName}`,
    html: buildHostEmail(data, dateStr, timeStr),
  });
}

/**
 * Send cancellation email to both parties.
 */
export async function sendCancellationEmail(data: BookingEmailData & { reason?: string }) {
  if (!resend) {
    console.log("📧 Email (demo mode) — Cancellation:");
    console.log(`   To: ${data.guestEmail}, ${data.hostEmail}`);
    console.log(`   Event: ${data.eventTitle}`);
    return;
  }

  const dateStr = format(data.startTime, "EEEE, MMMM d, yyyy");
  const timeStr = `${format(data.startTime, "h:mm a")} - ${format(data.endTime, "h:mm a")}`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: data.guestEmail,
    subject: `Booking Cancelled: ${data.eventTitle} with ${data.hostName}`,
    html: buildCancellationEmail(data, dateStr, timeStr, false),
  });

  await resend.emails.send({
    from: FROM_EMAIL,
    to: data.hostEmail,
    subject: `Booking Cancelled: ${data.eventTitle} with ${data.guestName}`,
    html: buildCancellationEmail(data, dateStr, timeStr, true),
  });
}

// ─── Email Templates ─────────────────────────────────────────

function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; }
    .container { max-width: 560px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); padding: 40px; }
    .logo { display: flex; align-items: center; gap: 8px; margin-bottom: 32px; }
    .logo-icon { width: 32px; height: 32px; background: linear-gradient(135deg, #818cf8, #6366f1); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 14px; }
    .logo-text { font-size: 18px; font-weight: 700; color: #0f172a; letter-spacing: -0.02em; }
    h1 { font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 8px; }
    p { font-size: 15px; color: #475569; line-height: 1.6; margin: 0 0 16px; }
    .details { background: #f8fafc; border-radius: 8px; padding: 20px; margin: 24px 0; }
    .detail-row { display: flex; align-items: center; gap: 10px; font-size: 14px; color: #334155; margin-bottom: 12px; }
    .detail-row:last-child { margin-bottom: 0; }
    .detail-icon { color: #94a3b8; width: 18px; }
    .btn { display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 14px; }
    .footer { text-align: center; padding: 24px 0 0; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">
        <div class="logo-icon">B</div>
        <div class="logo-text">Bookly</div>
      </div>
      ${content}
    </div>
    <div class="footer">
      Powered by Bookly · Effortless appointment scheduling
    </div>
  </div>
</body>
</html>`;
}

function buildGuestEmail(
  data: BookingEmailData,
  dateStr: string,
  timeStr: string,
): string {
  return baseTemplate(`
    <h1>You're booked! ✓</h1>
    <p>Hi ${data.guestName}, your appointment with <strong>${data.hostName}</strong> has been confirmed.</p>
    <div class="details">
      <div class="detail-row">
        <span class="detail-icon">📅</span>
        <strong>${dateStr}</strong>
      </div>
      <div class="detail-row">
        <span class="detail-icon">🕐</span>
        ${timeStr} (${data.timezone})
      </div>
      <div class="detail-row">
        <span class="detail-icon">📋</span>
        ${data.eventTitle}
      </div>
      ${data.meetingUrl ? `
      <div class="detail-row">
        <span class="detail-icon">🔗</span>
        <a href="${data.meetingUrl}" style="color: #6366f1;">${data.meetingUrl}</a>
      </div>` : ""}
    </div>
    ${data.meetingUrl ? `<a href="${data.meetingUrl}" class="btn">Join Meeting</a>` : ""}
    ${data.notes ? `<p style="margin-top: 20px; font-size: 13px; color: #64748b;"><em>Your notes: ${data.notes}</em></p>` : ""}
  `);
}

function buildHostEmail(
  data: BookingEmailData,
  dateStr: string,
  timeStr: string,
): string {
  return baseTemplate(`
    <h1>New Booking 🎉</h1>
    <p>Hi ${data.hostName}, you have a new appointment!</p>
    <div class="details">
      <div class="detail-row">
        <span class="detail-icon">👤</span>
        <strong>${data.guestName}</strong> (${data.guestEmail})
      </div>
      <div class="detail-row">
        <span class="detail-icon">📅</span>
        ${dateStr}
      </div>
      <div class="detail-row">
        <span class="detail-icon">🕐</span>
        ${timeStr}
      </div>
      <div class="detail-row">
        <span class="detail-icon">📋</span>
        ${data.eventTitle}
      </div>
    </div>
    ${data.notes ? `<p style="font-size: 13px; color: #64748b;"><em>Guest notes: ${data.notes}</em></p>` : ""}
  `);
}

function buildCancellationEmail(
  data: BookingEmailData & { reason?: string },
  dateStr: string,
  timeStr: string,
  isHost: boolean,
): string {
  return baseTemplate(`
    <h1>Booking Cancelled</h1>
    <p>The following appointment has been cancelled:</p>
    <div class="details">
      <div class="detail-row">
        <span class="detail-icon">👤</span>
        ${isHost ? data.guestName : data.hostName}
      </div>
      <div class="detail-row">
        <span class="detail-icon">📅</span>
        ${dateStr}
      </div>
      <div class="detail-row">
        <span class="detail-icon">🕐</span>
        ${timeStr}
      </div>
      <div class="detail-row">
        <span class="detail-icon">📋</span>
        ${data.eventTitle}
      </div>
    </div>
    ${data.reason ? `<p style="font-size: 13px; color: #64748b;"><em>Reason: ${data.reason}</em></p>` : ""}
  `);
}
