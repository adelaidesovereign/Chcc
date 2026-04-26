/**
 * MockAdapter — reads from /data/mock/*.json.
 *
 * Server-only. Imports `node:fs` and is therefore only safe inside
 * server components, route handlers, and server actions. The adapter
 * selector (./index.ts) is also server-only, which guarantees this file
 * never ends up in a client bundle.
 *
 * Writes (createReservation, postCharge, etc.) live in-memory only —
 * the underlying JSON files are immutable. State resets on server
 * restart. This is intentional for demo determinism.
 */

import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { clubConfig } from "@/club.config";

import type {
  AvailableCourt,
  AvailableDiningTime,
  AvailableTeeTime,
  ClubEssentialAdapter,
  ClubEvent,
  CourtReservation,
  CourtType,
  CreateCourtReservationInput,
  CreateReservationInput,
  CreateTeeTimeInput,
  CredentialValidationResult,
  DailyMenu,
  DiningReservation,
  DiningVenueSummary,
  EventCategory,
  EventRsvp,
  HouseCharge,
  Member,
  MemberCredentials,
  MemberDirectoryEntry,
  MemberSearchParams,
  MemberStatement,
  PaginatedResult,
  PaginationParams,
  PostChargeInput,
  RsvpStatus,
  TeeTime,
} from "./types";
import { NotFoundError } from "./types";

// ---- File loaders (cached at module scope) -------------------------

const MOCK_DIR = join(process.cwd(), "data", "mock");

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(join(MOCK_DIR, file), "utf-8")) as T;
}

const members = readJson<Member[]>("members.json");
const reservations = readJson<DiningReservation[]>("reservations.json");
const events = readJson<ClubEvent[]>("events.json");
const menus = readJson<DailyMenu[]>("menus.json");
const teeTimeSlots = readJson<AvailableTeeTime[]>("tee-times.json");
const charges = readJson<HouseCharge[]>("charges.json");

// In-memory mutation buffers — reset on cold start.
const ephemeralReservations: DiningReservation[] = [];
const ephemeralTeeTimes: TeeTime[] = [];
const ephemeralCourtReservations: CourtReservation[] = [];
const ephemeralRsvps: EventRsvp[] = [];
const ephemeralCharges: HouseCharge[] = [];

// ---- Helpers --------------------------------------------------------

const now = () => new Date().toISOString();

function paginate<T>(items: ReadonlyArray<T>, params?: PaginationParams): PaginatedResult<T> {
  const limit = params?.limit ?? 50;
  const startIndex = params?.cursor ? Number.parseInt(params.cursor, 10) : 0;
  const slice = items.slice(startIndex, startIndex + limit);
  const next = startIndex + limit;
  return {
    items: slice,
    nextCursor: next < items.length ? String(next) : undefined,
    total: items.length,
  };
}

function toDirectoryEntry(m: Member): MemberDirectoryEntry {
  return {
    id: m.id,
    memberNumber: m.memberNumber,
    displayName: m.preferredName
      ? `${m.preferredName} ${m.lastName}`
      : `${m.firstName} ${m.lastName}`,
    householdId: m.householdId,
    tier: m.tier,
    avatarUrl: m.avatarUrl,
  };
}

// =====================================================================
// MockAdapter
// =====================================================================

export class MockAdapter implements ClubEssentialAdapter {
  // ---- Members --------------------------------------------------
  async getMember(id: string): Promise<Member | null> {
    return members.find((m) => m.id === id) ?? null;
  }

  async listMembers(params?: PaginationParams): Promise<PaginatedResult<Member>> {
    return paginate(members, params);
  }

  async searchMembers({
    query,
    limit = 20,
  }: MemberSearchParams): Promise<ReadonlyArray<MemberDirectoryEntry>> {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return members
      .filter(
        (m) =>
          m.firstName.toLowerCase().includes(q) ||
          m.lastName.toLowerCase().includes(q) ||
          m.memberNumber.includes(q),
      )
      .slice(0, limit)
      .map(toDirectoryEntry);
  }

  // ---- Authentication ------------------------------------------
  async validateMemberCredentials(input: MemberCredentials): Promise<CredentialValidationResult> {
    const m = members.find((x) => x.email.toLowerCase() === input.email.toLowerCase());
    if (!m) return { ok: false, reason: "not-found" };
    if (m.status !== "active") return { ok: false, reason: "inactive" };
    return { ok: true, memberId: m.id };
  }

  // ---- Dining ---------------------------------------------------
  async listDiningVenues(): Promise<ReadonlyArray<DiningVenueSummary>> {
    return clubConfig.diningVenues.map((v) => ({
      id: v.id,
      name: v.name,
      description: v.description,
      capacity: v.capacity,
      dressCode: v.dressCode,
      photo: v.photo,
    }));
  }

  async listAvailableTimes({
    venueId,
    date,
    partySize,
  }: {
    venueId: string;
    date: string;
    partySize: number;
  }): Promise<ReadonlyArray<AvailableDiningTime>> {
    // Generate 30-minute slots within the venue's first service window
    // for the given weekday.
    const weekdays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
    const venue = clubConfig.diningVenues.find((v) => v.id === venueId);
    if (!venue) return [];
    const weekday = weekdays[new Date(`${date}T12:00:00`).getDay()]!;
    const windows = venue.hours[weekday] ?? [];
    if (windows.length === 0) return [];

    const slots: AvailableDiningTime[] = [];
    for (const window of windows) {
      const [open, close] = window.split("-");
      if (!open || !close) continue;
      const [oh, om] = open.split(":").map(Number);
      const [ch, cm] = close.split(":").map(Number);
      if (oh === undefined || om === undefined || ch === undefined || cm === undefined) continue;
      let h = oh,
        m = om;
      while (h * 60 + m <= ch * 60 + cm - 60) {
        slots.push({
          venueId,
          time: `${date}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`,
          partySizes:
            partySize <= 2 ? [2, 3, 4] : partySize <= 4 ? [2, 3, 4, 5, 6] : [4, 5, 6, 7, 8],
        });
        m += 30;
        if (m >= 60) {
          m -= 60;
          h += 1;
        }
      }
    }
    return slots;
  }

  async createReservation(input: CreateReservationInput): Promise<DiningReservation> {
    const r: DiningReservation = {
      id: `R-${randomUUID().slice(0, 8)}`,
      memberId: input.memberId,
      venueId: input.venueId,
      time: input.time,
      partySize: input.partySize,
      status: "confirmed",
      notes: input.notes,
      occasion: input.occasion,
      createdAt: now(),
    };
    ephemeralReservations.push(r);
    return r;
  }

  async getReservation(id: string): Promise<DiningReservation | null> {
    return [...ephemeralReservations, ...reservations].find((r) => r.id === id) ?? null;
  }

  async cancelReservation(id: string): Promise<DiningReservation> {
    const r = await this.getReservation(id);
    if (!r) throw new NotFoundError("Reservation", id);
    const cancelled: DiningReservation = { ...r, status: "cancelled" };
    const idx = ephemeralReservations.findIndex((x) => x.id === id);
    if (idx >= 0) ephemeralReservations[idx] = cancelled;
    else ephemeralReservations.push(cancelled);
    return cancelled;
  }

  async listMemberReservations({
    memberId,
    from,
    to,
  }: {
    memberId: string;
    from?: string;
    to?: string;
  }): Promise<ReadonlyArray<DiningReservation>> {
    const all = [...ephemeralReservations, ...reservations].filter((r) => r.memberId === memberId);
    return all.filter((r) => {
      if (from && r.time < from) return false;
      if (to && r.time > to) return false;
      return true;
    });
  }

  // ---- Tee times -----------------------------------------------
  async listAvailableTeeTimes({
    date,
    players,
  }: {
    date: string;
    players: 1 | 2 | 3 | 4;
  }): Promise<ReadonlyArray<AvailableTeeTime>> {
    return teeTimeSlots.filter((t) => t.time.startsWith(date) && t.maxPlayers >= players);
  }

  async createTeeTime(input: CreateTeeTimeInput): Promise<TeeTime> {
    const t: TeeTime = {
      id: `T-${randomUUID().slice(0, 8)}`,
      bookerMemberId: input.bookerMemberId,
      time: input.time,
      playerMemberIds: input.playerMemberIds,
      guestNames: input.guestNames ?? [],
      cartCount: input.cartCount,
      nineHoleOnly: input.nineHoleOnly ?? false,
      status: "confirmed",
      createdAt: now(),
    };
    ephemeralTeeTimes.push(t);
    return t;
  }

  async getTeeTime(id: string): Promise<TeeTime | null> {
    return ephemeralTeeTimes.find((t) => t.id === id) ?? null;
  }

  async cancelTeeTime(id: string): Promise<TeeTime> {
    const t = await this.getTeeTime(id);
    if (!t) throw new NotFoundError("TeeTime", id);
    const cancelled: TeeTime = { ...t, status: "cancelled" };
    const idx = ephemeralTeeTimes.findIndex((x) => x.id === id);
    if (idx >= 0) ephemeralTeeTimes[idx] = cancelled;
    return cancelled;
  }

  // ---- Courts ---------------------------------------------------
  async listAvailableCourts({
    type,
    date,
    durationMinutes,
  }: {
    type: CourtType;
    date: string;
    durationMinutes: 30 | 60 | 90 | 120;
  }): Promise<ReadonlyArray<AvailableCourt>> {
    const facility = clubConfig.courts.find((c) => c.type === type);
    if (!facility) return [];
    const slots: AvailableCourt[] = [];
    for (let courtNum = 1; courtNum <= facility.count; courtNum += 1) {
      for (let h = 8; h <= 20; h += 1) {
        slots.push({
          courtId: `${type}-${courtNum}`,
          type,
          time: `${date}T${String(h).padStart(2, "0")}:00:00`,
          durationMinutes,
        });
      }
    }
    return slots;
  }

  async createCourtReservation(input: CreateCourtReservationInput): Promise<CourtReservation> {
    const r: CourtReservation = {
      id: `CR-${randomUUID().slice(0, 8)}`,
      memberId: input.memberId,
      courtId: input.courtId,
      type: input.courtId.split("-")[0] as CourtType,
      time: input.time,
      durationMinutes: input.durationMinutes,
      opponentMemberIds: input.opponentMemberIds ?? [],
      guestNames: input.guestNames ?? [],
      createdAt: now(),
    };
    ephemeralCourtReservations.push(r);
    return r;
  }

  // ---- Events ---------------------------------------------------
  async listEvents(params?: {
    from?: string;
    category?: EventCategory;
  }): Promise<ReadonlyArray<ClubEvent>> {
    let list = [...events];
    if (params?.from) list = list.filter((e) => e.endsAt >= params.from!);
    if (params?.category) list = list.filter((e) => e.category === params.category);
    return list.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  }

  async getEvent(id: string): Promise<ClubEvent | null> {
    return events.find((e) => e.id === id) ?? null;
  }

  async rsvpToEvent(input: {
    eventId: string;
    memberId: string;
    status: RsvpStatus;
    partySize: number;
    guestNames?: ReadonlyArray<string>;
  }): Promise<EventRsvp> {
    const r: EventRsvp = {
      id: `RSVP-${randomUUID().slice(0, 8)}`,
      eventId: input.eventId,
      memberId: input.memberId,
      status: input.status,
      partySize: input.partySize,
      guestNames: input.guestNames ?? [],
      createdAt: now(),
    };
    ephemeralRsvps.push(r);
    return r;
  }

  async getMemberRsvps(memberId: string): Promise<ReadonlyArray<EventRsvp>> {
    return ephemeralRsvps.filter((r) => r.memberId === memberId);
  }

  // ---- House account -------------------------------------------
  async getMemberStatement({
    memberId,
    periodStart,
    periodEnd,
  }: {
    memberId: string;
    periodStart: string;
    periodEnd: string;
  }): Promise<MemberStatement> {
    const all = [...charges, ...ephemeralCharges].filter(
      (c) => c.memberId === memberId && c.postedAt >= periodStart && c.postedAt <= periodEnd,
    );
    const chargesCents = all.reduce((sum, c) => sum + c.amountCents, 0);
    return {
      memberId,
      periodStart,
      periodEnd,
      openingBalanceCents: 0,
      chargesCents,
      paymentsCents: chargesCents,
      closingBalanceCents: 0,
    };
  }

  async postCharge(input: PostChargeInput): Promise<HouseCharge> {
    const c: HouseCharge = {
      id: `CH-${randomUUID().slice(0, 8)}`,
      memberId: input.memberId,
      postedAt: now(),
      category: input.category,
      description: input.description,
      amountCents: input.amountCents,
      venueId: input.venueId,
    };
    ephemeralCharges.push(c);
    return c;
  }

  async listRecentCharges({
    memberId,
    limit = 20,
  }: {
    memberId: string;
    limit?: number;
  }): Promise<ReadonlyArray<HouseCharge>> {
    return [...ephemeralCharges, ...charges]
      .filter((c) => c.memberId === memberId)
      .sort((a, b) => b.postedAt.localeCompare(a.postedAt))
      .slice(0, limit);
  }

  // ---- Directory ------------------------------------------------
  async listDirectory(params?: PaginationParams): Promise<PaginatedResult<MemberDirectoryEntry>> {
    const sorted = [...members]
      .filter((m) => m.status === "active")
      .sort(
        (a, b) => a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName),
      )
      .map(toDirectoryEntry);
    return paginate(sorted, params);
  }

  async getMemberProfile(id: string): Promise<MemberDirectoryEntry | null> {
    const m = members.find((x) => x.id === id);
    return m ? toDirectoryEntry(m) : null;
  }

  // ---- Menus ----------------------------------------------------
  async listMenusForDate({
    date,
    venueId,
  }: {
    date: string;
    venueId?: string;
  }): Promise<ReadonlyArray<DailyMenu>> {
    return menus.filter((m) => m.date === date && (venueId ? m.venueId === venueId : true));
  }
}
