import { NextResponse, type NextRequest } from "next/server";
import { getStripe } from "@/lib/payments";
import { recordAudit } from "@/lib/audit";

/**
 * Stripe webhook receiver. Verifies the signature, then records a
 * payment.succeeded audit entry. Phase 5 demo only — Phase 6 wires
 * fulfilment (e.g. send a confirmation email, mark RSVP paid).
 */
export async function POST(request: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ ok: false, reason: "stripe-not-configured" }, { status: 503 });
  }
  const sig = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return NextResponse.json({ ok: false, reason: "missing-signature" }, { status: 400 });
  }

  const body = await request.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    return NextResponse.json(
      { ok: false, reason: "invalid-signature", error: String(err) },
      { status: 400 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    recordAudit({
      action: "payment.succeeded",
      actorMemberId: session.metadata?.memberId,
      resourceId: session.metadata?.rsvpId ?? session.id,
      metadata: {
        eventId: session.metadata?.eventId ?? "",
        amountTotal: session.amount_total ?? 0,
        currency: session.currency ?? "usd",
      },
    });
  }

  return NextResponse.json({ ok: true });
}
