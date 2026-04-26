import "server-only";

/**
 * Audit log.
 *
 * Records every sensitive action: bookings, RSVPs, charges,
 * profile changes, staff views of member data. Phase 5 demo writes
 * to an in-memory ring buffer (last 500 events) so the staff console
 * can show "recent activity" without a database. Production wires
 * this to the Prisma `audit_log` table by replacing `recordAudit`.
 *
 * No PII in `metadata` — keep to ids and counts.
 */

export type AuditAction =
  | "auth.sign_in"
  | "auth.sign_out"
  | "reservation.create"
  | "reservation.cancel"
  | "tee_time.create"
  | "tee_time.cancel"
  | "court.create"
  | "rsvp.create"
  | "rsvp.update"
  | "charge.post"
  | "concierge.ask"
  | "staff.view_reservations"
  | "staff.view_member"
  | "payment.checkout_started"
  | "payment.succeeded";

export interface AuditEntry {
  readonly id: string;
  readonly occurredAt: string;
  readonly action: AuditAction;
  readonly actorMemberId?: string;
  readonly targetMemberId?: string;
  readonly resourceId?: string;
  readonly metadata?: Readonly<Record<string, string | number | boolean>>;
}

const RING_SIZE = 500;
const ring: AuditEntry[] = [];

function nextId(): string {
  return `A-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function recordAudit(input: Omit<AuditEntry, "id" | "occurredAt">): void {
  const entry: AuditEntry = {
    id: nextId(),
    occurredAt: new Date().toISOString(),
    ...input,
  };
  ring.unshift(entry);
  if (ring.length > RING_SIZE) ring.length = RING_SIZE;
}

export function recentAudits(limit = 50): ReadonlyArray<AuditEntry> {
  return ring.slice(0, limit);
}

export function auditCountByAction(sinceMinutes = 60): Map<AuditAction, number> {
  const since = Date.now() - sinceMinutes * 60_000;
  const counts = new Map<AuditAction, number>();
  for (const e of ring) {
    if (new Date(e.occurredAt).getTime() < since) break;
    counts.set(e.action, (counts.get(e.action) ?? 0) + 1);
  }
  return counts;
}
