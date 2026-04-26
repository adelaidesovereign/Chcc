"use server";

import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdapter } from "@/lib/adapter";

export interface SignInState {
  readonly status: "idle" | "sent" | "error";
  readonly message?: string;
  readonly email?: string;
}

/**
 * Initiates a Supabase magic-link sign-in for the given email.
 *
 * Validates the email against the active adapter first — only known
 * members receive a link. (We don't want to send links to non-members
 * just because they typed an email.) Failures return a generic message
 * to avoid leaking whether an email is on the roster.
 */
export async function sendMagicLink(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  // Confirm membership before sending. Generic error preserves privacy.
  const adapter = getAdapter();
  const member = await adapter.validateMemberCredentials({ email });
  if (!member.ok) {
    return {
      status: "sent", // intentionally same UI as success
      message: "If that email is on file, a sign-in link is on its way.",
      email,
    };
  }

  // If Supabase isn't configured locally, surface a clear dev-only
  // message rather than failing silently.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {
      status: "sent",
      message: "Demo mode: Supabase is not configured. Member identified — proceed.",
      email,
    };
  }

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

  return {
    status: "sent",
    message: "Check your inbox for a sign-in link.",
    email,
  };
}
