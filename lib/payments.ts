import "server-only";
import Stripe from "stripe";

/**
 * Stripe wrapper.
 *
 * Returns null when STRIPE_SECRET_KEY is unset — every caller checks
 * for this and falls back to a demo-mode flow that confirms without
 * actually charging. This keeps the entire Phase 5 demo runnable
 * without keys.
 */

let cached: Stripe | null | undefined;

export function getStripe(): Stripe | null {
  if (cached !== undefined) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    cached = null;
    return null;
  }
  cached = new Stripe(key, { typescript: true });
  return cached;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export interface CheckoutLineItem {
  readonly name: string;
  readonly description?: string;
  readonly amountCents: number;
  readonly quantity: number;
}

export interface CreateCheckoutInput {
  readonly memberId: string;
  readonly memberEmail: string;
  readonly successUrl: string;
  readonly cancelUrl: string;
  readonly metadata: Readonly<Record<string, string>>;
  readonly lineItems: ReadonlyArray<CheckoutLineItem>;
}

/**
 * Creates a Stripe checkout session and returns the redirect URL.
 * Returns null in demo mode (no STRIPE_SECRET_KEY) — caller should
 * fall through to the no-payment confirmation path.
 */
export async function createCheckoutSession(input: CreateCheckoutInput): Promise<string | null> {
  const stripe = getStripe();
  if (!stripe) return null;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: input.memberEmail,
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    metadata: { memberId: input.memberId, ...input.metadata },
    line_items: input.lineItems.map((li) => ({
      quantity: li.quantity,
      price_data: {
        currency: "usd",
        unit_amount: li.amountCents,
        product_data: {
          name: li.name,
          description: li.description,
        },
      },
    })),
  });

  return session.url ?? null;
}
