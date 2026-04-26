/**
 * Stripe Payment Integration
 * ──────────────────────────
 * Handles checkout sessions for paid bookings and webhook events.
 */

import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-04-30.basil",
    })
  : null;

// ─── Checkout ────────────────────────────────────────────

interface CheckoutData {
  bookingId: string;
  eventTitle: string;
  durationMinutes: number;
  priceInCents: number; // 5000 = $50.00
  currency?: string;
  guestEmail: string;
  guestName: string;
  hostName: string;
  hostStripeAccountId?: string; // for Stripe Connect
  successUrl: string;
  cancelUrl: string;
}

/**
 * Create a Stripe Checkout Session for a paid booking.
 * Returns the checkout URL to redirect the guest to.
 */
export async function createCheckoutSession(
  data: CheckoutData
): Promise<{ url: string; sessionId: string } | null> {
  if (!stripe) {
    console.log("💳 Stripe (demo mode) — Checkout session:", {
      booking: data.bookingId,
      amount: `$${(data.priceInCents / 100).toFixed(2)}`,
      guest: data.guestEmail,
    });
    return {
      url: data.successUrl + "?demo=true",
      sessionId: `demo_cs_${Date.now()}`,
    };
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: data.guestEmail,
      line_items: [
        {
          price_data: {
            currency: data.currency || "usd",
            product_data: {
              name: data.eventTitle,
              description: `${data.durationMinutes}-minute session with ${data.hostName}`,
            },
            unit_amount: data.priceInCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        booking_id: data.bookingId,
        guest_email: data.guestEmail,
        guest_name: data.guestName,
      },
      success_url: data.successUrl,
      cancel_url: data.cancelUrl,
      // If using Stripe Connect for multi-vendor payouts:
      // ...(data.hostStripeAccountId && {
      //   payment_intent_data: {
      //     application_fee_amount: Math.round(data.priceInCents * 0.1), // 10% platform fee
      //     transfer_data: {
      //       destination: data.hostStripeAccountId,
      //     },
      //   },
      // }),
    });

    return {
      url: session.url!,
      sessionId: session.id,
    };
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return null;
  }
}

// ─── Refunds ─────────────────────────────────────────────

/**
 * Issue a full refund for a cancelled booking.
 */
export async function refundPayment(
  paymentIntentId: string
): Promise<boolean> {
  if (!stripe) {
    console.log("💳 Stripe (demo mode) — Refund:", paymentIntentId);
    return true;
  }

  try {
    await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });
    return true;
  } catch (error) {
    console.error("Stripe refund error:", error);
    return false;
  }
}

// ─── Customer Management ─────────────────────────────────

/**
 * Create or retrieve a Stripe customer for a user.
 */
export async function getOrCreateCustomer(
  email: string,
  name: string,
  existingCustomerId?: string
): Promise<string | null> {
  if (!stripe) {
    return `demo_cus_${Date.now()}`;
  }

  try {
    if (existingCustomerId) {
      const customer = await stripe.customers.retrieve(existingCustomerId);
      if (!customer.deleted) return customer.id;
    }

    const customer = await stripe.customers.create({
      email,
      name,
      metadata: { source: "bookly" },
    });
    return customer.id;
  } catch (error) {
    console.error("Stripe customer error:", error);
    return null;
  }
}

// ─── Webhook Verification ────────────────────────────────

/**
 * Verify and parse a Stripe webhook event.
 */
export function constructWebhookEvent(
  body: string,
  signature: string
): Stripe.Event | null {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return null;
  }

  try {
    return stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Webhook verification failed:", error);
    return null;
  }
}

/**
 * Check if Stripe is configured.
 */
export function isStripeEnabled(): boolean {
  return !!stripe;
}
