/**
 * Adapter selector.
 *
 * `getAdapter()` returns the active ClubEssentialAdapter implementation
 * based on `NEXT_PUBLIC_ADAPTER_MODE`:
 *
 *   - "mock" → MockAdapter (reads from /data/mock/*)
 *   - "live" → LiveAdapter (calls ClubEssential — Phase 5)
 *
 * The instance is memoised per process. Server-only.
 *
 * Every server component, route handler, and server action that needs
 * member data MUST call `getAdapter()`. Direct imports of MockAdapter
 * or LiveAdapter from outside this folder are forbidden by convention
 * (and enforced by an ESLint rule we'll add when the tree settles).
 */

import "server-only";
import { clubConfig } from "@/club.config";
import type { ClubEssentialAdapter } from "./types";
import { MockAdapter } from "./mock";
import { LiveAdapter } from "./live";

let cached: ClubEssentialAdapter | undefined;

export function getAdapter(): ClubEssentialAdapter {
  if (cached) return cached;

  const mode = clubConfig.integration.mode;

  if (mode === "live") {
    const apiBase = process.env.CLUBESSENTIAL_API_BASE;
    const apiKey = process.env.CLUBESSENTIAL_API_KEY;
    const clubId = process.env.CLUBESSENTIAL_CLUB_ID;
    if (!apiBase || !apiKey || !clubId) {
      throw new Error(
        "Adapter mode is 'live' but ClubEssential credentials are missing. " +
          "Set CLUBESSENTIAL_API_BASE, CLUBESSENTIAL_API_KEY, and CLUBESSENTIAL_CLUB_ID, " +
          "or set NEXT_PUBLIC_ADAPTER_MODE=mock for demo data.",
      );
    }
    cached = new LiveAdapter({ apiBase, apiKey, clubId });
    return cached;
  }

  cached = new MockAdapter();
  return cached;
}

export type { ClubEssentialAdapter } from "./types";
