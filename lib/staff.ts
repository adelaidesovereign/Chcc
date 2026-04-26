import "server-only";
import { redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/session";
import type { Member } from "@/lib/adapter/types";

/**
 * Staff access — Phase 4 demo.
 *
 * For the demo, any signed-in member can access the staff console by
 * tapping "Switch to staff view" from their account page. In production
 * (Phase 5) this gates by a real role read from ClubEssential.
 *
 * The seam is intentionally narrow: every staff page calls
 * `requireStaff()` and gets back a member. Adding role-based gating is
 * a one-place change.
 */
export async function requireStaff(): Promise<Member> {
  const member = await getCurrentMember();
  if (!member) redirect("/login?next=/staff");
  return member;
}
