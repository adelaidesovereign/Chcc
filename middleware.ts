import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge middleware — Phase 1 no-op.
 *
 * Phase 2 (when /member and /staff routes exist) will add Supabase
 * session refresh + auth gating. The implementation lives ready in
 * `lib/supabase/middleware.ts` — wire it back here when those routes
 * land. Keeping middleware empty here avoids pulling Supabase code
 * into the Edge bundle prematurely.
 */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|workbox-.*\\.js|icons/.*|club-assets/.*).*)",
  ],
};
