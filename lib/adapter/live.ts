/**
 * LiveAdapter — calls ClubEssential's REST API.
 *
 * Phase 5 scaffolding. The HTTP client + auth + base URL are wired,
 * but every concrete method still throws NotImplementedError because
 * the request/response shapes have to be confirmed against
 * ClubEssential's actual documentation.
 *
 * When integration begins:
 *   1. Replace each `notImpl(...)` with `this.client.get(...)` etc.
 *   2. Translate ClubEssential's response shape into our domain types
 *      inside this file. Never leak their schema upward.
 *   3. Add response validation with zod for safety.
 *   4. Wire structured errors (rate limits, auth failures, 5xx) so
 *      the UI can show recoverable states.
 */

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
import { NotImplementedError, AdapterError } from "./types";

interface LiveAdapterConfig {
  readonly apiBase: string;
  readonly apiKey: string;
  readonly clubId: string;
}

/**
 * Thin HTTP client. Adds bearer auth, club id header, JSON
 * marshalling, and error normalisation. Every adapter method goes
 * through here when implemented.
 */
class CeHttpClient {
  constructor(private readonly config: LiveAdapterConfig) {}

  async get<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
    const url = new URL(path, this.config.apiBase);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined) url.searchParams.set(k, String(v));
      }
    }
    return this.request<T>(url, { method: "GET" });
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    const url = new URL(path, this.config.apiBase);
    return this.request<T>(url, {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
  }

  private async request<T>(url: URL, init: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...init,
      headers: {
        ...init.headers,
        Authorization: `Bearer ${this.config.apiKey}`,
        "X-Club-Id": this.config.clubId,
        Accept: "application/json",
      },
      cache: "no-store",
    });
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new AdapterError(
        `ClubEssential ${response.status}: ${text || response.statusText}`,
        `HTTP_${response.status}`,
      );
    }
    return (await response.json()) as T;
  }
}

export class LiveAdapter implements ClubEssentialAdapter {
  private readonly client: CeHttpClient;

  constructor(config: LiveAdapterConfig) {
    this.client = new CeHttpClient(config);
    // Mark client used until methods are wired (avoids unused warning).
    void this.client;
  }

  // ---- Members --------------------------------------------------
  getMember(_id: string): Promise<Member | null> {
    return notImpl("getMember");
  }
  listMembers(_params?: PaginationParams): Promise<PaginatedResult<Member>> {
    return notImpl("listMembers");
  }
  searchMembers(_params: MemberSearchParams): Promise<ReadonlyArray<MemberDirectoryEntry>> {
    return notImpl("searchMembers");
  }

  // ---- Authentication ------------------------------------------
  validateMemberCredentials(_input: MemberCredentials): Promise<CredentialValidationResult> {
    return notImpl("validateMemberCredentials");
  }

  // ---- Dining ---------------------------------------------------
  listDiningVenues(): Promise<ReadonlyArray<DiningVenueSummary>> {
    return notImpl("listDiningVenues");
  }
  listAvailableTimes(_p: {
    venueId: string;
    date: string;
    partySize: number;
  }): Promise<ReadonlyArray<AvailableDiningTime>> {
    return notImpl("listAvailableTimes");
  }
  createReservation(_input: CreateReservationInput): Promise<DiningReservation> {
    return notImpl("createReservation");
  }
  getReservation(_id: string): Promise<DiningReservation | null> {
    return notImpl("getReservation");
  }
  cancelReservation(_id: string): Promise<DiningReservation> {
    return notImpl("cancelReservation");
  }
  listMemberReservations(_p: {
    memberId: string;
    from?: string;
    to?: string;
  }): Promise<ReadonlyArray<DiningReservation>> {
    return notImpl("listMemberReservations");
  }

  // ---- Tee times -----------------------------------------------
  listAvailableTeeTimes(_p: {
    date: string;
    players: 1 | 2 | 3 | 4;
  }): Promise<ReadonlyArray<AvailableTeeTime>> {
    return notImpl("listAvailableTeeTimes");
  }
  createTeeTime(_input: CreateTeeTimeInput): Promise<TeeTime> {
    return notImpl("createTeeTime");
  }
  getTeeTime(_id: string): Promise<TeeTime | null> {
    return notImpl("getTeeTime");
  }
  cancelTeeTime(_id: string): Promise<TeeTime> {
    return notImpl("cancelTeeTime");
  }

  // ---- Courts ---------------------------------------------------
  listAvailableCourts(_p: {
    type: CourtType;
    date: string;
    durationMinutes: 30 | 60 | 90 | 120;
  }): Promise<ReadonlyArray<AvailableCourt>> {
    return notImpl("listAvailableCourts");
  }
  createCourtReservation(_input: CreateCourtReservationInput): Promise<CourtReservation> {
    return notImpl("createCourtReservation");
  }

  // ---- Events ---------------------------------------------------
  listEvents(_p?: { from?: string; category?: EventCategory }): Promise<ReadonlyArray<ClubEvent>> {
    return notImpl("listEvents");
  }
  getEvent(_id: string): Promise<ClubEvent | null> {
    return notImpl("getEvent");
  }
  rsvpToEvent(_input: {
    eventId: string;
    memberId: string;
    status: RsvpStatus;
    partySize: number;
    guestNames?: ReadonlyArray<string>;
  }): Promise<EventRsvp> {
    return notImpl("rsvpToEvent");
  }
  getMemberRsvps(_memberId: string): Promise<ReadonlyArray<EventRsvp>> {
    return notImpl("getMemberRsvps");
  }

  // ---- Staff-side reads -----------------------------------------
  listReservationsByDate(_p: {
    date: string;
    venueId?: string;
  }): Promise<ReadonlyArray<DiningReservation>> {
    return notImpl("listReservationsByDate");
  }
  listEventRsvps(_eventId: string): Promise<ReadonlyArray<EventRsvp>> {
    return notImpl("listEventRsvps");
  }

  // ---- House account -------------------------------------------
  getMemberStatement(_p: {
    memberId: string;
    periodStart: string;
    periodEnd: string;
  }): Promise<MemberStatement> {
    return notImpl("getMemberStatement");
  }
  postCharge(_input: PostChargeInput): Promise<HouseCharge> {
    return notImpl("postCharge");
  }
  listRecentCharges(_p: { memberId: string; limit?: number }): Promise<ReadonlyArray<HouseCharge>> {
    return notImpl("listRecentCharges");
  }

  // ---- Directory ------------------------------------------------
  listDirectory(_params?: PaginationParams): Promise<PaginatedResult<MemberDirectoryEntry>> {
    return notImpl("listDirectory");
  }
  getMemberProfile(_id: string): Promise<MemberDirectoryEntry | null> {
    return notImpl("getMemberProfile");
  }

  // ---- Menus ----------------------------------------------------
  listMenusForDate(_p: { date: string; venueId?: string }): Promise<ReadonlyArray<DailyMenu>> {
    return notImpl("listMenusForDate");
  }
}

function notImpl(method: string): never {
  throw new NotImplementedError(`LiveAdapter.${method}`);
}
