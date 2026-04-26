/**
 * ClubEssentialAdapter — the only seam between UI and member data.
 *
 * Every server component, route handler, and server action that needs
 * member data MUST go through `getAdapter()` (see ./index.ts). No
 * component reads `data/mock/*` directly. No component calls
 * ClubEssential's HTTP API directly. This is the contract that lets us
 * flip a single env var to switch between demo and production.
 *
 * Two implementations exist:
 *   - MockAdapter  (./mock.ts) — reads from /data/mock/*
 *   - LiveAdapter  (./live.ts) — calls ClubEssential's REST API
 *
 * Both must satisfy this interface identically. If ClubEssential's API
 * shape differs, translate inside LiveAdapter — never leak their schema
 * upward.
 */

// =====================================================================
// Domain types — the canonical shapes the rest of the app sees.
// =====================================================================

export type MembershipTier =
  | "founder"
  | "resident"
  | "non-resident"
  | "social"
  | "young-executive"
  | "honorary"
  | "corporate";

export type MemberStatus = "active" | "inactive" | "suspended" | "leave-of-absence";

export interface Member {
  readonly id: string;
  readonly memberNumber: string;
  readonly householdId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly preferredName?: string;
  readonly email: string;
  readonly phone?: string;
  readonly tier: MembershipTier;
  readonly status: MemberStatus;
  readonly joinedOn: string; // ISO date
  readonly anniversaryDate?: string; // ISO date
  readonly birthday?: string; // ISO date (YYYY-MM-DD)
  readonly dietaryPreferences: ReadonlyArray<string>;
  readonly avatarUrl?: string;
  readonly bio?: string;
}

export interface Household {
  readonly id: string;
  readonly headOfHouseholdId: string;
  readonly memberIds: ReadonlyArray<string>;
  readonly addressLine1?: string;
  readonly city?: string;
  readonly state?: string;
  readonly postalCode?: string;
}

// ----- Authentication -------------------------------------------------

export interface MemberCredentials {
  readonly email: string;
  /**
   * Optional — when present, validate password (legacy ClubEssential
   * flow). When absent, validate by membership lookup only (magic-link
   * flow, used by Phase 1).
   */
  readonly password?: string;
}

export type CredentialValidationResult =
  | { readonly ok: true; readonly memberId: string }
  | { readonly ok: false; readonly reason: "not-found" | "inactive" | "bad-credentials" };

// ----- Dining ---------------------------------------------------------

export type DressCode =
  | "casual"
  | "smart-casual"
  | "country-club-casual"
  | "jacket-required"
  | "jacket-and-tie";

export interface DiningVenueSummary {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly capacity: number;
  readonly dressCode: DressCode;
  readonly photo?: string;
}

export interface AvailableDiningTime {
  readonly venueId: string;
  /** ISO datetime in venue local timezone (UTC offset preserved). */
  readonly time: string;
  readonly partySizes: ReadonlyArray<number>;
}

export type ReservationStatus = "confirmed" | "cancelled" | "seated" | "completed" | "no-show";

export interface DiningReservation {
  readonly id: string;
  readonly memberId: string;
  readonly venueId: string;
  readonly time: string; // ISO datetime
  readonly partySize: number;
  readonly status: ReservationStatus;
  readonly notes?: string;
  readonly occasion?: "anniversary" | "birthday" | "business" | "other";
  readonly createdAt: string;
}

export interface CreateReservationInput {
  readonly memberId: string;
  readonly venueId: string;
  readonly time: string;
  readonly partySize: number;
  readonly notes?: string;
  readonly occasion?: DiningReservation["occasion"];
}

// ----- Tee times ------------------------------------------------------

export interface AvailableTeeTime {
  readonly time: string; // ISO datetime
  readonly maxPlayers: 1 | 2 | 3 | 4;
  readonly nineHoleOnly: boolean;
}

export interface TeeTime {
  readonly id: string;
  readonly bookerMemberId: string;
  readonly time: string;
  readonly playerMemberIds: ReadonlyArray<string>;
  readonly guestNames: ReadonlyArray<string>;
  readonly cartCount: number;
  readonly nineHoleOnly: boolean;
  readonly status: "confirmed" | "cancelled" | "completed" | "no-show";
  readonly createdAt: string;
}

export interface CreateTeeTimeInput {
  readonly bookerMemberId: string;
  readonly time: string;
  readonly playerMemberIds: ReadonlyArray<string>;
  readonly guestNames?: ReadonlyArray<string>;
  readonly cartCount: number;
  readonly nineHoleOnly?: boolean;
}

// ----- Courts ---------------------------------------------------------

export type CourtType = "tennis" | "pickleball" | "platform" | "squash" | "padel";

export interface AvailableCourt {
  readonly courtId: string;
  readonly type: CourtType;
  readonly time: string;
  readonly durationMinutes: 30 | 60 | 90 | 120;
}

export interface CourtReservation {
  readonly id: string;
  readonly memberId: string;
  readonly courtId: string;
  readonly type: CourtType;
  readonly time: string;
  readonly durationMinutes: number;
  readonly opponentMemberIds: ReadonlyArray<string>;
  readonly guestNames: ReadonlyArray<string>;
  readonly createdAt: string;
}

export interface CreateCourtReservationInput {
  readonly memberId: string;
  readonly courtId: string;
  readonly time: string;
  readonly durationMinutes: 30 | 60 | 90 | 120;
  readonly opponentMemberIds?: ReadonlyArray<string>;
  readonly guestNames?: ReadonlyArray<string>;
}

// ----- Events ---------------------------------------------------------

export type EventCategory =
  | "golf-tournament"
  | "wine-dinner"
  | "holiday"
  | "family"
  | "social"
  | "racquets"
  | "junior";

export interface ClubEvent {
  readonly id: string;
  readonly title: string;
  readonly category: EventCategory;
  readonly description: string;
  readonly startsAt: string; // ISO datetime
  readonly endsAt: string;
  readonly location: string;
  readonly capacity: number;
  readonly attendingCount: number;
  readonly priceCents?: number;
  readonly heroImage?: string;
  readonly dressCode?: DressCode;
  readonly rsvpDeadline?: string;
  readonly featured: boolean;
}

export type RsvpStatus = "attending" | "tentative" | "declined" | "waitlist";

export interface EventRsvp {
  readonly id: string;
  readonly eventId: string;
  readonly memberId: string;
  readonly status: RsvpStatus;
  readonly partySize: number;
  readonly guestNames: ReadonlyArray<string>;
  readonly createdAt: string;
}

// ----- House account --------------------------------------------------

export interface MemberStatement {
  readonly memberId: string;
  readonly periodStart: string;
  readonly periodEnd: string;
  readonly openingBalanceCents: number;
  readonly chargesCents: number;
  readonly paymentsCents: number;
  readonly closingBalanceCents: number;
}

export type ChargeCategory =
  | "dining"
  | "golf"
  | "racquets"
  | "pool"
  | "merchandise"
  | "events"
  | "dues"
  | "other";

export interface HouseCharge {
  readonly id: string;
  readonly memberId: string;
  readonly postedAt: string;
  readonly category: ChargeCategory;
  readonly description: string;
  readonly amountCents: number;
  readonly venueId?: string;
}

export interface PostChargeInput {
  readonly memberId: string;
  readonly category: ChargeCategory;
  readonly description: string;
  readonly amountCents: number;
  readonly venueId?: string;
}

// ----- Menus ----------------------------------------------------------

export interface MenuItem {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly section: string;
  readonly priceCents?: number;
  readonly dietaryTags: ReadonlyArray<string>;
}

export interface DailyMenu {
  readonly date: string; // YYYY-MM-DD
  readonly venueId: string;
  readonly service: "lunch" | "dinner" | "brunch";
  readonly items: ReadonlyArray<MenuItem>;
}

// =====================================================================
// Common shapes
// =====================================================================

export interface PaginationParams {
  readonly limit?: number;
  readonly cursor?: string;
}

export interface PaginatedResult<T> {
  readonly items: ReadonlyArray<T>;
  readonly nextCursor?: string;
  readonly total?: number;
}

export interface MemberDirectoryEntry {
  readonly id: string;
  readonly memberNumber: string;
  readonly displayName: string;
  readonly householdId: string;
  readonly tier: MembershipTier;
  readonly avatarUrl?: string;
}

export interface MemberSearchParams {
  readonly query: string;
  readonly limit?: number;
}

// =====================================================================
// The contract.
// =====================================================================

export interface ClubEssentialAdapter {
  // -- Members -----------------------------------------------------
  getMember(id: string): Promise<Member | null>;
  listMembers(params?: PaginationParams): Promise<PaginatedResult<Member>>;
  searchMembers(params: MemberSearchParams): Promise<ReadonlyArray<MemberDirectoryEntry>>;

  // -- Authentication ---------------------------------------------
  validateMemberCredentials(input: MemberCredentials): Promise<CredentialValidationResult>;

  // -- Dining ------------------------------------------------------
  listDiningVenues(): Promise<ReadonlyArray<DiningVenueSummary>>;
  listAvailableTimes(params: {
    readonly venueId: string;
    readonly date: string; // YYYY-MM-DD
    readonly partySize: number;
  }): Promise<ReadonlyArray<AvailableDiningTime>>;
  createReservation(input: CreateReservationInput): Promise<DiningReservation>;
  getReservation(id: string): Promise<DiningReservation | null>;
  cancelReservation(id: string): Promise<DiningReservation>;
  listMemberReservations(params: {
    readonly memberId: string;
    readonly from?: string; // ISO date
    readonly to?: string;
  }): Promise<ReadonlyArray<DiningReservation>>;

  // -- Tee times ---------------------------------------------------
  listAvailableTeeTimes(params: {
    readonly date: string;
    readonly players: 1 | 2 | 3 | 4;
  }): Promise<ReadonlyArray<AvailableTeeTime>>;
  createTeeTime(input: CreateTeeTimeInput): Promise<TeeTime>;
  getTeeTime(id: string): Promise<TeeTime | null>;
  cancelTeeTime(id: string): Promise<TeeTime>;

  // -- Courts ------------------------------------------------------
  listAvailableCourts(params: {
    readonly type: CourtType;
    readonly date: string;
    readonly durationMinutes: 30 | 60 | 90 | 120;
  }): Promise<ReadonlyArray<AvailableCourt>>;
  createCourtReservation(input: CreateCourtReservationInput): Promise<CourtReservation>;

  // -- Events ------------------------------------------------------
  listEvents(params?: {
    readonly from?: string;
    readonly category?: EventCategory;
  }): Promise<ReadonlyArray<ClubEvent>>;
  getEvent(id: string): Promise<ClubEvent | null>;
  rsvpToEvent(input: {
    readonly eventId: string;
    readonly memberId: string;
    readonly status: RsvpStatus;
    readonly partySize: number;
    readonly guestNames?: ReadonlyArray<string>;
  }): Promise<EventRsvp>;
  getMemberRsvps(memberId: string): Promise<ReadonlyArray<EventRsvp>>;

  // -- Staff-side reads (operations dashboards) -------------------
  listReservationsByDate(params: {
    readonly date: string; // YYYY-MM-DD
    readonly venueId?: string;
  }): Promise<ReadonlyArray<DiningReservation>>;
  listEventRsvps(eventId: string): Promise<ReadonlyArray<EventRsvp>>;

  // -- House account ----------------------------------------------
  getMemberStatement(params: {
    readonly memberId: string;
    readonly periodStart: string; // YYYY-MM-DD
    readonly periodEnd: string;
  }): Promise<MemberStatement>;
  postCharge(input: PostChargeInput): Promise<HouseCharge>;
  listRecentCharges(params: {
    readonly memberId: string;
    readonly limit?: number;
  }): Promise<ReadonlyArray<HouseCharge>>;

  // -- Member directory -------------------------------------------
  listDirectory(params?: PaginationParams): Promise<PaginatedResult<MemberDirectoryEntry>>;
  getMemberProfile(id: string): Promise<MemberDirectoryEntry | null>;

  // -- Menus (read-only convenience) ------------------------------
  listMenusForDate(params: {
    readonly date: string;
    readonly venueId?: string;
  }): Promise<ReadonlyArray<DailyMenu>>;
}

// =====================================================================
// Error classes
// =====================================================================

export class AdapterError extends Error {
  readonly code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = "AdapterError";
    this.code = code;
  }
}

export class NotImplementedError extends AdapterError {
  constructor(method: string) {
    super(
      `${method} is not yet implemented in LiveAdapter. ` +
        `LiveAdapter requires ClubEssential API access — contact ` +
        `the integration team and provide the CLUBESSENTIAL_API_BASE, ` +
        `CLUBESSENTIAL_API_KEY, and CLUBESSENTIAL_CLUB_ID env vars.`,
      "NOT_IMPLEMENTED",
    );
    this.name = "NotImplementedError";
  }
}

export class NotFoundError extends AdapterError {
  constructor(resource: string, id: string) {
    super(`${resource} not found: ${id}`, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}
