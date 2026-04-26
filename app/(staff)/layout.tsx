import { redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/session";

/**
 * Staff route group. Phase 4 demo: any signed-in member can switch
 * into staff view. Real role-based gating arrives in Phase 5 alongside
 * the live ClubEssential adapter.
 */
export default async function StaffLayout({ children }: { readonly children: React.ReactNode }) {
  const member = await getCurrentMember();
  if (!member) redirect("/login?next=/staff");
  return <div data-theme="hearth">{children}</div>;
}
