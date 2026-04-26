/**
 * Club configuration contract.
 *
 * Everything that varies between clubs lives here. The same codebase can
 * power additional clubs by swapping `club.config.ts` and dropping new
 * brand assets into `/public/club-assets/`.
 *
 * Nothing in `app/`, `components/`, or `lib/` (outside this directory)
 * should hard-code anything that belongs in this contract.
 */

export type DressCode =
  | "casual"
  | "smart-casual"
  | "country-club-casual"
  | "jacket-required"
  | "jacket-and-tie";

export type DiningVenueId = string;
export type CourtType = "tennis" | "pickleball" | "platform" | "squash" | "padel";
export type AdapterMode = "mock" | "live";

export interface DiningVenue {
  readonly id: DiningVenueId;
  readonly name: string;
  readonly description: string;
  readonly capacity: number;
  readonly dressCode: DressCode;
  /** ISO weekday key (mon..sun) → array of "HH:mm-HH:mm" service windows. */
  readonly hours: Readonly<Record<Weekday, ReadonlyArray<string>>>;
  /** Path under /public, e.g. "/club-assets/photo-grill-room.jpg". */
  readonly photo?: string;
  readonly reservationLeadMinutes?: number;
}

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface GolfCourse {
  readonly name: string;
  readonly holes: number;
  readonly par: number;
  readonly courseRating: number;
  readonly slopeRating: number;
  readonly yardages: Readonly<Record<"black" | "blue" | "white" | "gold" | "red", number>>;
  readonly photo?: string;
  readonly architect?: string;
  readonly yearOpened?: number;
}

export interface CourtFacility {
  readonly type: CourtType;
  readonly count: number;
  readonly surface: string;
  readonly lit: boolean;
  readonly photo?: string;
}

export interface PoolFacility {
  readonly name: string;
  readonly description: string;
  readonly seasonStart: string; // ISO date "MM-DD"
  readonly seasonEnd: string;
  readonly photo?: string;
}

export interface StaffContact {
  readonly title: string;
  readonly name: string;
  readonly email: string;
  readonly phone?: string;
}

export interface ClubBrand {
  readonly logoPath: string;
  readonly logoMarkPath?: string;
  readonly faviconPath: string;
  readonly tagline: string;
  readonly strap: string;
  readonly photography: {
    readonly hero: string;
    readonly clubhouse: string;
    readonly golf: string;
    readonly courts: string;
    readonly pool: string;
    readonly dining?: string;
  };
}

export interface ClubLocation {
  readonly addressLine1: string;
  readonly addressLine2?: string;
  readonly city: string;
  readonly state: string;
  readonly postalCode: string;
  readonly country: string;
  readonly timezone: string;
  readonly latitude: number;
  readonly longitude: number;
}

export interface ClubEssentialIntegration {
  /** Set via env at runtime; declared here for type safety. */
  readonly mode: AdapterMode;
  readonly apiBase?: string;
  readonly clubId?: string;
}

export interface ClubConfig {
  readonly slug: string; // url + analytics segment, e.g. "chcc"
  readonly name: string; // "Chapel Hill Country Club"
  readonly shortName: string; // "CHCC"
  readonly foundingYear: number;
  readonly location: ClubLocation;
  readonly brand: ClubBrand;
  readonly diningVenues: ReadonlyArray<DiningVenue>;
  readonly golf: GolfCourse;
  readonly courts: ReadonlyArray<CourtFacility>;
  readonly pool: PoolFacility;
  readonly staff: ReadonlyArray<StaffContact>;
  readonly integration: ClubEssentialIntegration;
}
