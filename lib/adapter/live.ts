/**
 * LiveAdapter — calls ClubEssential's REST API.
 *
 * STUBBED for Phase 1. Every method throws NotImplementedError with a
 * clear message about needing API credentials. The shape of every
 * method matches the interface exactly so callers can rely on
 * compile-time checking.
 *
 * When ClubEssential access is granted (Phase 5), implement each method
 * here and never touch call sites.
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
import { NotImplementedError } from "./types";

export class LiveAdapter implements ClubEssentialAdapter {
  constructor(
    private readonly _config: {
      readonly apiBase: string;
      readonly apiKey: string;
      readonly clubId: string;
    },
  ) {
    // Configuration kept for the eventual implementation. Marked _ to
    // satisfy strict unused-args without removing the constructor.
    void this._config;
  }

  // ---- Members --------------------------------------------------
  getMember(_id: string): Promise<Member | null> {
    throw new NotImplementedError("LiveAdapter.getMember");
  }
  listMembers(_params?: PaginationParams): Promise<PaginatedResult<Member>> {
    throw new NotImplementedError("LiveAdapter.listMembers");
  }
  searchMembers(_params: MemberSearchParams): Promise<ReadonlyArray<MemberDirectoryEntry>> {
    throw new NotImplementedError("LiveAdapter.searchMembers");
  }

  // ---- Authentication ------------------------------------------
  validateMemberCredentials(_input: MemberCredentials): Promise<CredentialValidationResult> {
    throw new NotImplementedError("LiveAdapter.validateMemberCredentials");
  }

  // ---- Dining ---------------------------------------------------
  listDiningVenues(): Promise<ReadonlyArray<DiningVenueSummary>> {
    throw new NotImplementedError("LiveAdapter.listDiningVenues");
  }
  listAvailableTimes(_p: {
    venueId: string;
    date: string;
    partySize: number;
  }): Promise<ReadonlyArray<AvailableDiningTime>> {
    throw new NotImplementedError("LiveAdapter.listAvailableTimes");
  }
  createReservation(_input: CreateReservationInput): Promise<DiningReservation> {
    throw new NotImplementedError("LiveAdapter.createReservation");
  }
  getReservation(_id: string): Promise<DiningReservation | null> {
    throw new NotImplementedError("LiveAdapter.getReservation");
  }
  cancelReservation(_id: string): Promise<DiningReservation> {
    throw new NotImplementedError("LiveAdapter.cancelReservation");
  }
  listMemberReservations(_p: {
    memberId: string;
    from?: string;
    to?: string;
  }): Promise<ReadonlyArray<DiningReservation>> {
    throw new NotImplementedError("LiveAdapter.listMemberReservations");
  }

  // ---- Tee times -----------------------------------------------
  listAvailableTeeTimes(_p: {
    date: string;
    players: 1 | 2 | 3 | 4;
  }): Promise<ReadonlyArray<AvailableTeeTime>> {
    throw new NotImplementedError("LiveAdapter.listAvailableTeeTimes");
  }
  createTeeTime(_input: CreateTeeTimeInput): Promise<TeeTime> {
    throw new NotImplementedError("LiveAdapter.createTeeTime");
  }
  getTeeTime(_id: string): Promise<TeeTime | null> {
    throw new NotImplementedError("LiveAdapter.getTeeTime");
  }
  cancelTeeTime(_id: string): Promise<TeeTime> {
    throw new NotImplementedError("LiveAdapter.cancelTeeTime");
  }

  // ---- Courts ---------------------------------------------------
  listAvailableCourts(_p: {
    type: CourtType;
    date: string;
    durationMinutes: 30 | 60 | 90 | 120;
  }): Promise<ReadonlyArray<AvailableCourt>> {
    throw new NotImplementedError("LiveAdapter.listAvailableCourts");
  }
  createCourtReservation(_input: CreateCourtReservationInput): Promise<CourtReservation> {
    throw new NotImplementedError("LiveAdapter.createCourtReservation");
  }

  // ---- Events ---------------------------------------------------
  listEvents(_p?: { from?: string; category?: EventCategory }): Promise<ReadonlyArray<ClubEvent>> {
    throw new NotImplementedError("LiveAdapter.listEvents");
  }
  getEvent(_id: string): Promise<ClubEvent | null> {
    throw new NotImplementedError("LiveAdapter.getEvent");
  }
  rsvpToEvent(_input: {
    eventId: string;
    memberId: string;
    status: RsvpStatus;
    partySize: number;
    guestNames?: ReadonlyArray<string>;
  }): Promise<EventRsvp> {
    throw new NotImplementedError("LiveAdapter.rsvpToEvent");
  }
  getMemberRsvps(_memberId: string): Promise<ReadonlyArray<EventRsvp>> {
    throw new NotImplementedError("LiveAdapter.getMemberRsvps");
  }

  // ---- Staff-side reads -----------------------------------------
  listReservationsByDate(_p: {
    date: string;
    venueId?: string;
  }): Promise<ReadonlyArray<DiningReservation>> {
    throw new NotImplementedError("LiveAdapter.listReservationsByDate");
  }
  listEventRsvps(_eventId: string): Promise<ReadonlyArray<EventRsvp>> {
    throw new NotImplementedError("LiveAdapter.listEventRsvps");
  }

  // ---- House account -------------------------------------------
  getMemberStatement(_p: {
    memberId: string;
    periodStart: string;
    periodEnd: string;
  }): Promise<MemberStatement> {
    throw new NotImplementedError("LiveAdapter.getMemberStatement");
  }
  postCharge(_input: PostChargeInput): Promise<HouseCharge> {
    throw new NotImplementedError("LiveAdapter.postCharge");
  }
  listRecentCharges(_p: { memberId: string; limit?: number }): Promise<ReadonlyArray<HouseCharge>> {
    throw new NotImplementedError("LiveAdapter.listRecentCharges");
  }

  // ---- Directory ------------------------------------------------
  listDirectory(_params?: PaginationParams): Promise<PaginatedResult<MemberDirectoryEntry>> {
    throw new NotImplementedError("LiveAdapter.listDirectory");
  }
  getMemberProfile(_id: string): Promise<MemberDirectoryEntry | null> {
    throw new NotImplementedError("LiveAdapter.getMemberProfile");
  }

  // ---- Menus ----------------------------------------------------
  listMenusForDate(_p: { date: string; venueId?: string }): Promise<ReadonlyArray<DailyMenu>> {
    throw new NotImplementedError("LiveAdapter.listMenusForDate");
  }
}
