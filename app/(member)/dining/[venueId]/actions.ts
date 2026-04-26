"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getAdapter } from "@/lib/adapter";
import { requireCurrentMember } from "@/lib/session";
import { recordAudit } from "@/lib/audit";
import { sendReservationConfirmation } from "@/lib/email";
import { clubConfig } from "@/club.config";
import { formatLongDate, formatTime } from "@/lib/format";

const inputSchema = z.object({
  venueId: z.string().min(1),
  time: z.string().min(1),
  partySize: z.coerce.number().int().min(1).max(20),
  occasion: z
    .enum(["anniversary", "birthday", "business", "other"])
    .optional()
    .or(z.literal("").transform(() => undefined)),
  notes: z.string().max(500).optional(),
});

export interface BookReservationState {
  readonly status: "idle" | "success" | "error";
  readonly message?: string;
  readonly reservationId?: string;
}

export async function bookReservation(
  _prev: BookReservationState,
  formData: FormData,
): Promise<BookReservationState> {
  const member = await requireCurrentMember();
  const parsed = inputSchema.safeParse({
    venueId: formData.get("venueId"),
    time: formData.get("time"),
    partySize: formData.get("partySize"),
    occasion: formData.get("occasion") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { status: "error", message: "Please check your selections and try again." };
  }

  const adapter = getAdapter();
  const reservation = await adapter.createReservation({
    memberId: member.id,
    venueId: parsed.data.venueId,
    time: parsed.data.time,
    partySize: parsed.data.partySize,
    notes: parsed.data.notes,
    occasion: parsed.data.occasion,
  });

  recordAudit({
    action: "reservation.create",
    actorMemberId: member.id,
    resourceId: reservation.id,
    metadata: {
      venueId: parsed.data.venueId,
      partySize: parsed.data.partySize,
      hasOccasion: Boolean(parsed.data.occasion),
      hasNotes: Boolean(parsed.data.notes),
    },
  });

  // Fire-and-forget confirmation email. Skipped in demo mode.
  const venueName =
    clubConfig.diningVenues.find((v) => v.id === parsed.data.venueId)?.name ?? parsed.data.venueId;
  void sendReservationConfirmation(member.email, {
    clubName: clubConfig.name,
    memberName: member.preferredName ?? member.firstName,
    venueName,
    date: formatLongDate(parsed.data.time),
    time: formatTime(parsed.data.time),
    partySize: parsed.data.partySize,
    occasion: parsed.data.occasion,
    notes: parsed.data.notes,
    dietaryFlags: member.dietaryPreferences.map((d) => d.replace(/-/g, " ")),
    manageUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/dining`,
  }).catch(() => {
    // Never block confirmation on email failures.
  });

  revalidatePath("/home");
  revalidatePath("/dining");
  redirect(`/dining/${parsed.data.venueId}/confirmed?id=${reservation.id}`);
}
