import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { clubConfig } from "@/club.config";
import { getAdapter } from "@/lib/adapter";
import { Wordmark } from "@/components/brand/Wordmark";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Members' Sign In",
  description: `Members of ${clubConfig.name} — sign in to your account.`,
};

const DEMO_MEMBER_IDS = ["M-0003", "M-0001", "M-0004"] as const;

async function loadDemoMembers() {
  if (clubConfig.integration.mode !== "mock") return [];
  const adapter = getAdapter();
  const members = await Promise.all(DEMO_MEMBER_IDS.map((id) => adapter.getMember(id)));
  return members
    .filter((m): m is NonNullable<typeof m> => Boolean(m))
    .map((m) => {
      const tierLabel = m.tier
        .split("-")
        .map((p) => p[0]!.toUpperCase() + p.slice(1))
        .join(" ");
      const dietary = m.dietaryPreferences.length ? ` · ${m.dietaryPreferences.join(", ")}` : "";
      return {
        id: m.id,
        displayName: `${m.preferredName ?? m.firstName} ${m.lastName}`,
        tier: m.tier,
        hint: `${tierLabel} member · No. ${m.memberNumber}${dietary}`,
      };
    });
}

/**
 * The login screen.
 *
 * Cinematic split layout: a still photograph of the club fills two
 * thirds of the viewport on desktop, with the sign-in panel occupying
 * a quiet column to the right. On mobile the photograph collapses to
 * a hero band above the panel. No clutter — single email field, one
 * call to action, the year 1922 as the only chrome detail.
 */
export default async function LoginPage() {
  const demoMembers = await loadDemoMembers();
  return (
    <main className="grid min-h-dvh grid-cols-1 lg:grid-cols-[1.6fr_1fr]">
      {/* Left — cinematic photography ----------------------------- */}
      <section className="relative isolate hidden overflow-hidden bg-[color:var(--color-surface-inverse)] lg:block">
        <Image
          src={clubConfig.brand.photography.clubhouse}
          alt={`${clubConfig.name} clubhouse at dusk`}
          fill
          priority
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-cover"
        />
        {/* Editorial veil — protects type contrast without flattening */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/55 via-black/25 to-transparent" />
        <div className="pointer-events-none absolute inset-0 ring-1 ring-white/5 ring-inset" />

        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-[color:var(--color-text-inverse)]">
          <Wordmark size="md" variant="inline" className="text-[color:var(--color-text-inverse)]" />

          <div className="max-w-lg space-y-6">
            <p className="font-sans text-xs tracking-[var(--tracking-widest)] text-[color:var(--color-accent-soft)] uppercase">
              Members
            </p>
            <h1 className="font-serif text-4xl leading-[1.1] tracking-tight text-balance md:text-5xl">
              Welcome home, {clubConfig.shortName}.
            </h1>
            <p className="max-w-md text-base leading-relaxed font-light text-white/80">
              {clubConfig.brand.strap}
            </p>
          </div>

          <p className="font-serif text-xs tracking-wide text-white/55 italic">
            Established {clubConfig.foundingYear}
          </p>
        </div>
      </section>

      {/* Right — sign-in panel ------------------------------------ */}
      <section className="relative flex flex-col bg-[color:var(--color-surface-canvas)]">
        {/* Mobile hero strip ------------------------------------ */}
        <div className="relative h-56 w-full overflow-hidden bg-[color:var(--color-surface-inverse)] lg:hidden">
          <Image
            src={clubConfig.brand.photography.clubhouse}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <Wordmark
            size="sm"
            variant="inline"
            className="absolute bottom-6 left-6 text-[color:var(--color-text-inverse)]"
          />
        </div>

        <div className="flex flex-1 flex-col px-8 py-16 sm:px-16 lg:px-20 lg:py-24">
          <div className="mx-auto w-full max-w-sm flex-1">
            <header className="mb-14 space-y-5">
              <p className="eyebrow">Members' Sign In</p>
              <h2 className="font-serif text-3xl leading-tight tracking-tight md:text-[2.4rem]">
                Step inside.
              </h2>
              <p className="text-sm leading-relaxed font-light text-[color:var(--color-text-secondary)]">
                Enter your member email and we'll send a sign-in link. No passwords to remember.
              </p>
            </header>

            <LoginForm demoMembers={demoMembers} />

            <hr className="hairline mt-16" />

            <p className="mt-8 text-xs leading-relaxed text-[color:var(--color-text-muted)]">
              Trouble signing in? Call the front desk or write to{" "}
              <Link
                href="mailto:membership@chapelhillcc.com"
                className="text-[color:var(--color-accent-deep)] underline-offset-4 hover:underline"
              >
                membership@chapelhillcc.com
              </Link>
              .
            </p>
          </div>

          <footer className="mt-12 flex items-center justify-between text-xs text-[color:var(--color-text-muted)]">
            <Link href="/" className="hover:text-[color:var(--color-text-secondary)]">
              ← Return to {clubConfig.shortName}
            </Link>
            <span className="font-serif italic">{clubConfig.foundingYear}</span>
          </footer>
        </div>
      </section>
    </main>
  );
}
