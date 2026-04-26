import { clubConfig } from "@/club.config";
import type { ClubConfig } from "./types";

/**
 * Returns the active club configuration.
 *
 * Today: a single club (CHCC). Tomorrow: switch on
 * `process.env.NEXT_PUBLIC_ACTIVE_CLUB` to load alternate
 * configurations from a registry. The interface stays identical.
 */
export function loadActiveClub(): ClubConfig {
  return clubConfig;
}

/**
 * Convenience accessor — used by server components and route handlers
 * that only need the club's display name or slug.
 */
export function activeClubSlug(): string {
  return clubConfig.slug;
}
