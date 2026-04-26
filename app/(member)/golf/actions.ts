"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getAdapter } from "@/lib/adapter";
import { requireCurrentMember } from "@/lib/session";
import { recordAudit } from "@/lib/audit";

const inputSchema = z.object({
  time: z.string().min(1),
  cartCount: z.coerce.number().int().min(0).max(2),
  guestNames: z.string().optional(),
  nineHoleOnly: z.literal("true").optional(),
});

export interface BookTeeTimeState {
  readonly status: "idle" | "success" | "error";
  readonly message?: string;
}

export async function bookTeeTime(
  _prev: BookTeeTimeState,
  formData: FormData,
): Promise<BookTeeTimeState> {
  const member = await requireCurrentMember();
  const parsed = inputSchema.safeParse({
    time: formData.get("time"),
    cartCount: formData.get("cartCount"),
    guestNames: formData.get("guestNames") || undefined,
    nineHoleOnly: formData.get("nineHoleOnly") || undefined,
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

  const teeTime = await adapter.createTeeTime({
    bookerMemberId: member.id,
    time: parsed.data.time,
    playerMemberIds: [member.id],
    guestNames,
    cartCount: parsed.data.cartCount,
    nineHoleOnly: parsed.data.nineHoleOnly === "true",
  });

  recordAudit({
    action: "tee_time.create",
    actorMemberId: member.id,
    resourceId: teeTime.id,
    metadata: {
      cartCount: parsed.data.cartCount,
      guests: guestNames.length,
      nineHole: parsed.data.nineHoleOnly === "true",
    },
  });

  revalidatePath("/home");
  revalidatePath("/golf");
  redirect(`/golf/confirmed?id=${teeTime.id}`);
}
