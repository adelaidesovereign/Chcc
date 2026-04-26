/**
 * Analytics — thin wrapper around PostHog so callers don't import the
 * provider directly.
 *
 * Phase 1 ships the wrapper without auto-initialising PostHog so the
 * demo doesn't ping out unless a key is set. When the key is present
 * we emit page views and named events.
 */

"use client";

import posthog from "posthog-js";

let initialised = false;

export function initAnalytics(): void {
  if (typeof window === "undefined") return;
  if (initialised) return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    capture_pageview: true,
    capture_pageleave: true,
    person_profiles: "identified_only",
  });
  initialised = true;
}

export function track(event: string, props?: Record<string, unknown>): void {
  if (!initialised) return;
  posthog.capture(event, props);
}

export function identify(memberId: string, traits?: Record<string, unknown>): void {
  if (!initialised) return;
  posthog.identify(memberId, traits);
}
