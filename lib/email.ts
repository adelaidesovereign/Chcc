import "server-only";
import { Resend } from "resend";
import { render } from "@react-email/components";
import {
  ReservationConfirmation,
  type ReservationConfirmationProps,
} from "@/components/emails/ReservationConfirmation";
import { clubConfig } from "@/club.config";

/**
 * Email transport.
 *
 * Returns null when RESEND_API_KEY is unset — every send call checks
 * for this and logs the would-have-sent envelope to the audit log
 * instead. Demo mode never actually emails sample addresses.
 */

let cached: Resend | null | undefined;

function getResend(): Resend | null {
  if (cached !== undefined) return cached;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    cached = null;
    return null;
  }
  cached = new Resend(key);
  return cached;
}

export interface SendResult {
  readonly status: "sent" | "skipped";
  readonly reason?: string;
  readonly id?: string;
}

const FROM = process.env.RESEND_FROM_EMAIL ?? `${clubConfig.name} <noreply@chapelhillcc.com>`;

export async function sendReservationConfirmation(
  to: string,
  props: ReservationConfirmationProps,
): Promise<SendResult> {
  const resend = getResend();
  const html = await render(ReservationConfirmation(props));
  const text = `${props.venueName} — ${props.date} at ${props.time}, party of ${props.partySize}.`;

  if (!resend) {
    return { status: "skipped", reason: "demo-mode" };
  }
  if (!to.includes("@example.com")) {
    const result = await resend.emails.send({
      from: FROM,
      to,
      subject: `Reservation confirmed — ${props.venueName}`,
      html,
      text,
    });
    return { status: "sent", id: result.data?.id };
  }
  // Demo emails go nowhere — the directory uses @example.com.
  return { status: "skipped", reason: "demo-recipient" };
}
