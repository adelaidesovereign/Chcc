import "server-only";
import { redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/session";
import type { Member, StaffRole } from "@/lib/adapter/types";

const STAFF_ROLES: ReadonlySet<StaffRole> = new Set([
  "staff",
  "gm",
  "fnb",
  "golf-pro",
  "racquets-pro",
  "membership-director",
]);

/** Returns true if the member has any operational role. */
export function isStaff(member: Member): boolean {
  return STAFF_ROLES.has(member.role);
}

/**
 * Gates a staff page. Members without a staff role are sent back to
 * /home with an unauthorised marker so the UI can surface a polite
 * message if needed.
 */
export async function requireStaff(): Promise<Member> {
  const member = await getCurrentMember();
  if (!member) redirect("/login?next=/staff");
  if (!isStaff(member)) redirect("/home?error=staff-only");
  return member;
}

/** Human label for a role, used in chrome ("GM · Augusta Cavendish"). */
export function roleLabel(role: StaffRole): string {
  switch (role) {
    case "gm":
      return "General Manager";
    case "fnb":
      return "Food & Beverage";
    case "golf-pro":
      return "Director of Golf";
    case "racquets-pro":
      return "Director of Racquets";
    case "membership-director":
      return "Membership";
    case "staff":
      return "Staff";
    default:
      return "Member";
  }
}
