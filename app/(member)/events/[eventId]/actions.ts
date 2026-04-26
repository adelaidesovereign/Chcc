"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getAdapter } from "@/lib/adapter";
import { requireCurrentMember } from "@/lib/session";

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

  await adapter.rsvpToEvent({
    eventId: parsed.data.eventId,
    memberId: member.id,
    status: parsed.data.status,
    partySize: parsed.data.partySize,
    guestNames,
  });

  revalidatePath("/home");
  revalidatePath("/events");
  redirect(`/events/${parsed.data.eventId}?rsvp=1`);
}
