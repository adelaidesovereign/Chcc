import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Returns the currently authenticated Supabase user, or null.
 * Use in server components and route handlers to gate UI.
 */
export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Returns the active member record for the current user, or null.
 *
 * In Phase 1 we map the Supabase user's email back to a member via the
 * adapter's credential validator — this gives the same lookup behaviour
 * in mock and live modes without coupling auth to ClubEssential.
 */
export async function getCurrentMember() {
  const user = await getCurrentUser();
  if (!user?.email) return null;

  const { getAdapter } = await import("@/lib/adapter");
  const adapter = getAdapter();
  const result = await adapter.validateMemberCredentials({ email: user.email });
  if (!result.ok) return null;
  return adapter.getMember(result.memberId);
}
