import { redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/session";

/**
 * Member route group — gates access via demo-mode session.
 *
 * Children pages can call `requireCurrentMember()` directly; this layout
 * provides a hard redirect for any user landing on a member URL without
 * a session.
 */
export default async function MemberLayout({ children }: { readonly children: React.ReactNode }) {
  const member = await getCurrentMember();
  if (!member) redirect("/login");
  return <div data-theme="parchment">{children}</div>;
}
