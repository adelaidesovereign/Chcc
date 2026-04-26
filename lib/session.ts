/**
 * Demo session — mock-mode authentication.
 *
 * In Phase 1 the magic-link flow validates membership but can't issue
 * a real session without Supabase. For the demo we set a signed
 * cookie containing the member id and read it back through
 * `getCurrentMember()`. This lets the entire member-facing app function
 * end to end without any external service.
 *
 * Switching to live Supabase Auth (Phase 5) is a one-file swap inside
 * `lib/auth.ts`. No call sites change.
 */

import "server-only";
import { cookies } from "next/headers";
import { getAdapter } from "@/lib/adapter";
import type { Member } from "@/lib/adapter/types";

const COOKIE_NAME = "chcc_demo_member";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function setDemoMember(memberId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, memberId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function clearDemoMember(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getDemoMemberId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

/**
 * Returns the current authenticated member, or null.
 *
 * Mock mode: reads the demo cookie.
 * Live mode (Phase 5): reads Supabase user → maps to ClubEssential id.
 */
export async function getCurrentMember(): Promise<Member | null> {
  const memberId = await getDemoMemberId();
  if (!memberId) return null;
  const adapter = getAdapter();
  return adapter.getMember(memberId);
}

/**
 * Throws a redirect-friendly error if no member is signed in. Use in
 * server components for protected pages.
 */
export async function requireCurrentMember(): Promise<Member> {
  const member = await getCurrentMember();
  if (!member) {
    throw new Error("UNAUTHORIZED");
  }
  return member;
}
