"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdapter } from "@/lib/adapter";
import { setDemoMember } from "@/lib/session";
import { clubConfig } from "@/club.config";

export interface SignInState {
  readonly status: "idle" | "sent" | "error";
  readonly message?: string;
  readonly email?: string;
}

/**
 * Initiates a Supabase magic-link sign-in for the given email.
 *
 * In mock mode (no Supabase configured) we treat membership lookup as
 * authentication and set a demo cookie so the user lands inside the
 * member app immediately.
 */
export async function sendMagicLink(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  const adapter = getAdapter();
  const result = await adapter.validateMemberCredentials({ email });
  if (!result.ok) {
    return {
      status: "sent", // intentionally same UI as success
      message: "If that email is on file, a sign-in link is on its way.",
      email,
    };
  }

  // Mock mode (no Supabase) — set demo session and forward inside.
  if (
    clubConfig.integration.mode === "mock" ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    await setDemoMember(result.memberId);
    redirect("/home");
  }

  // Live Supabase magic-link path.
  const supabase = await createSupabaseServerClient();
  const origin =
    (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/callback`,
      shouldCreateUser: true,
    },
  });
  if (error) {
    return {
      status: "error",
      message: "We couldn't send your sign-in link. Please try again or contact the front desk.",
    };
  }

  return { status: "sent", message: "Check your inbox for a sign-in link.", email };
}

/**
 * Demo affordance — instant sign-in as a specific member without an
 * email round-trip. The login screen exposes a few "try as…" choices.
 */
export async function signInAsDemo(memberId: string): Promise<void> {
  const adapter = getAdapter();
  const member = await adapter.getMember(memberId);
  if (!member) throw new Error("Member not found.");
  await setDemoMember(member.id);
  redirect("/home");
}
