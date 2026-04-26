import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Edge middleware.
 *
 *  - Refreshes the Supabase session cookie on every navigation so
 *    server components see an up-to-date user.
 *  - Gates routes under (member) and (staff) — Phase 1 protects nothing
 *    yet because those segments are empty, but the redirect rule lives
 *    here for Phase 2 onward.
 */
export async function middleware(request: NextRequest) {
  // If Supabase env isn't configured yet (fresh checkout) just pass
  // through — the marketing page should still render.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next();
  }

  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isMemberRoute =
    pathname.startsWith("/member") ||
    pathname.startsWith("/dining") ||
    pathname.startsWith("/golf") ||
    pathname.startsWith("/courts") ||
    pathname.startsWith("/events") ||
    pathname.startsWith("/account");

  const isStaffRoute = pathname.startsWith("/staff");

  if ((isMemberRoute || isStaffRoute) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Skip Next.js internals and all static assets, plus the manifest
     * and service worker so the PWA install flow isn't disrupted.
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|workbox-.*\\.js|icons/.*|club-assets/.*).*)",
  ],
};
