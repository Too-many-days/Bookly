import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent } from "@/lib/stripe";
import { sendBookingConfirmation } from "@/lib/email";
import { db, isDemoMode } from "@/lib/db";
import { bookings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * POST /api/webhooks/stripe
 * Handles Stripe webhook events for payment confirmations.
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const event = constructWebhookEvent(body, signature);
  if (!event) {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const bookingId = session.metadata?.booking_id;

        if (bookingId && !isDemoMode()) {
          // Mark booking as paid / confirmed
          await db!
            .update(bookings)
            .set({ status: "confirmed" })
            .where(eq(bookings.id, bookingId));
        }

        console.log("✅ Payment completed for booking:", bookingId);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        const bookingId = paymentIntent.metadata?.booking_id;

        if (bookingId && !isDemoMode()) {
          // Cancel the booking if payment failed
          await db!
            .update(bookings)
            .set({
              status: "cancelled",
              cancellationReason: "Payment failed",
              cancelledAt: new Date(),
            })
            .where(eq(bookings.id, bookingId));
        }

        console.log("❌ Payment failed for booking:", bookingId);
        break;
      }

      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
