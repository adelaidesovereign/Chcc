"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { getAdapter } from "@/lib/adapter";
import { requireCurrentMember } from "@/lib/session";
import { recordAudit } from "@/lib/audit";
import { createCheckoutSession, isStripeConfigured } from "@/lib/payments";

const inputSchema = z.object({
  eventId: z.string().min(1),
  status: z.enum(["attending", "tentative", "declined"]),
  partySize: z.coerce.number().int().min(1).max(20),
  guestNames: z.string().optional(),
});

export interface RsvpState {
  readonly status: "idle" | "success" | "error";
  readonly message?: string;
}

export async function rsvpToEvent(_prev: RsvpState, formData: FormData): Promise<RsvpState> {
  const member = await requireCurrentMember();
  const parsed = inputSchema.safeParse({
    eventId: formData.get("eventId"),
    status: formData.get("status"),
    partySize: formData.get("partySize"),
    guestNames: formData.get("guestNames") || undefined,
  });
  if (!parsed.success) {
    return { status: "error", message: "Please check your selections." };
  }

  const adapter = getAdapter();
  const guestNames = parsed.data.guestNames
    ? parsed.data.guestNames
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const rsvp = await adapter.rsvpToEvent({
    eventId: parsed.data.eventId,
    memberId: member.id,
    status: parsed.data.status,
    partySize: parsed.data.partySize,
    guestNames,
  });

  recordAudit({
    action: "rsvp.create",
    actorMemberId: member.id,
    resourceId: rsvp.id,
    metadata: {
      eventId: parsed.data.eventId,
      status: parsed.data.status,
      partySize: parsed.data.partySize,
    },
  });

  revalidatePath("/home");
  revalidatePath("/events");

  // Paid event + attending → route through Stripe (or skip in demo).
  const event = await adapter.getEvent(parsed.data.eventId);
  if (event && event.priceCents && parsed.data.status === "attending" && isStripeConfigured()) {
    const origin =
      (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const url = await createCheckoutSession({
      memberId: member.id,
      memberEmail: member.email,
      successUrl: `${origin}/events/${parsed.data.eventId}?rsvp=1&paid=1`,
      cancelUrl: `${origin}/events/${parsed.data.eventId}?rsvp=cancelled`,
      metadata: { eventId: parsed.data.eventId, rsvpId: rsvp.id },
      lineItems: [
        {
          name: event.title,
          description: `Party of ${parsed.data.partySize}`,
          amountCents: event.priceCents,
          quantity: parsed.data.partySize,
        },
      ],
    });
    if (url) {
      recordAudit({
        action: "payment.checkout_started",
        actorMemberId: member.id,
        resourceId: rsvp.id,
        metadata: {
          eventId: parsed.data.eventId,
          totalCents: event.priceCents * parsed.data.partySize,
        },
      });
      redirect(url);
    }
  }

  redirect(`/events/${parsed.data.eventId}?rsvp=1`);
}
