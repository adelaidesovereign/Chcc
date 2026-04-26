"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getAdapter } from "@/lib/adapter";
import { requireCurrentMember } from "@/lib/session";

const inputSchema = z.object({
  courtId: z.string().min(1),
  time: z.string().min(1),
  durationMinutes: z.coerce
    .number()
    .refine((n): n is 30 | 60 | 90 | 120 => n === 30 || n === 60 || n === 90 || n === 120),
  guestNames: z.string().optional(),
});

export interface BookCourtState {
  readonly status: "idle" | "success" | "error";
  readonly message?: string;
}

export async function bookCourt(
  _prev: BookCourtState,
  formData: FormData,
): Promise<BookCourtState> {
  const member = await requireCurrentMember();
  const parsed = inputSchema.safeParse({
    courtId: formData.get("courtId"),
    time: formData.get("time"),
    durationMinutes: formData.get("durationMinutes"),
    guestNames: formData.get("guestNames") || undefined,
  });
  if (!parsed.success) {
    return { status: "error", message: "Please confirm your selections and try again." };
  }

  const adapter = getAdapter();
  const guestNames = parsed.data.guestNames
    ? parsed.data.guestNames
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  await adapter.createCourtReservation({
    memberId: member.id,
    courtId: parsed.data.courtId,
    time: parsed.data.time,
    durationMinutes: parsed.data.durationMinutes,
    guestNames,
  });

  revalidatePath("/courts");
  redirect(`/courts?confirmed=1`);
}
