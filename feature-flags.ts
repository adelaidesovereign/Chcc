/**
 * Feature flags.
 *
 * Simple config-driven flag system. Each flag has a default and an
 * optional per-club override map keyed by club slug. The active club's
 * value (if present) wins; otherwise the default is used.
 *
 * In Phase 1 the flags are static — no runtime fetch, no provider. This
 * keeps the demo deterministic. We can swap the resolver to pull from
 * PostHog or LaunchDarkly later without touching call sites.
 */

import { activeClubSlug } from "@/lib/club-config/load";

export type FeatureFlag =
  | "ai-concierge"
  | "dining-reservations"
  | "tee-time-booking"
  | "court-reservations"
  | "house-account"
  | "events-rsvp"
  | "member-directory"
  | "staff-dashboard"
  | "push-notifications"
  | "guest-pass-requests";

interface FlagDefinition {
  readonly defaultValue: boolean;
  readonly perClub?: Readonly<Record<string, boolean>>;
  readonly description: string;
}

const flags: Readonly<Record<FeatureFlag, FlagDefinition>> = {
  "ai-concierge": {
    defaultValue: true,
    description: "Anthropic-powered concierge — Phase 3.",
  },
  "dining-reservations": {
    defaultValue: true,
    description: "Member-facing dining reservation surface — Phase 2.",
  },
  "tee-time-booking": {
    defaultValue: true,
    description: "Tee time booking surface — Phase 2.",
  },
  "court-reservations": {
    defaultValue: true,
    description: "Tennis / pickleball / platform booking — Phase 2.",
  },
  "house-account": {
    defaultValue: true,
    description: "Member statement and recent charges view — Phase 5.",
  },
  "events-rsvp": {
    defaultValue: true,
    description: "Events listing and RSVP — Phase 3.",
  },
  "member-directory": {
    defaultValue: true,
    description: "Searchable member directory — Phase 2.",
  },
  "staff-dashboard": {
    defaultValue: false,
    description: "Staff operations console — Phase 4.",
  },
  "push-notifications": {
    defaultValue: false,
    description: "Web push for reservations and event reminders.",
  },
  "guest-pass-requests": {
    defaultValue: false,
    description: "Member-initiated guest passes.",
  },
};

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  const def = flags[flag];
  const slug = activeClubSlug();
  return def.perClub?.[slug] ?? def.defaultValue;
}

export function listFeatureFlags(): ReadonlyArray<{
  readonly flag: FeatureFlag;
  readonly enabled: boolean;
  readonly description: string;
}> {
  return (Object.keys(flags) as ReadonlyArray<FeatureFlag>).map((flag) => ({
    flag,
    enabled: isFeatureEnabled(flag),
    description: flags[flag].description,
  }));
}
