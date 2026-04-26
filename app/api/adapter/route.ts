import { NextResponse } from "next/server";
import { clubConfig } from "@/club.config";

/**
 * GET /api/adapter
 *
 * Reports the active adapter mode. Useful for the staff dashboard
 * (Phase 4) and for sanity-checking deployments — the demo URL should
 * always report "mock" until ClubEssential goes live.
 */
export function GET() {
  return NextResponse.json({
    mode: clubConfig.integration.mode,
    club: clubConfig.slug,
    apiBaseConfigured: Boolean(clubConfig.integration.apiBase),
  });
}
