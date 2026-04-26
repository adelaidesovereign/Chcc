import Link from "next/link";
import Image from "next/image";
import { clubConfig } from "@/club.config";
import { cn } from "@/lib/utils";
import type { Member } from "@/lib/adapter/types";

interface MemberShellProps {
  readonly member: Member;
  readonly children: React.ReactNode;
  readonly current?: NavKey;
}

type NavKey =
  | "home"
  | "dining"
  | "golf"
  | "courts"
  | "events"
  | "concierge"
  | "directory"
  | "account";

const navItems: ReadonlyArray<{ key: NavKey; label: string; href: string }> = [
  { key: "home", label: "Home", href: "/home" },
  { key: "dining", label: "Dining", href: "/dining" },
  { key: "golf", label: "Golf", href: "/golf" },
  { key: "courts", label: "Racquets", href: "/courts" },
  { key: "events", label: "Events", href: "/events" },
  { key: "concierge", label: "Concierge", href: "/concierge" },
  { key: "directory", label: "Members", href: "/directory" },
];

export function MemberShell({ member, children, current = "home" }: MemberShellProps) {
  const initials = `${member.firstName[0] ?? ""}${member.lastName[0] ?? ""}`.toUpperCase();
  const displayName = member.preferredName ?? member.firstName;

  return (
    <div className="min-h-dvh bg-[color:var(--color-surface-canvas)]">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-canvas)]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-6 py-4 md:px-10">
          <Link href="/home" className="flex items-center gap-3">
            <Image
              src={clubConfig.brand.logoMarkPath ?? clubConfig.brand.logoPath}
              alt={clubConfig.shortName}
              width={44}
              height={25}
              priority
            />
            <div className="hidden font-serif text-base text-[color:var(--color-text-emphasis)] md:block">
              {clubConfig.shortName}
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium tracking-[0.04em] transition-colors",
                  item.key === current
                    ? "text-[color:var(--color-accent-deep)]"
                    : "text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-emphasis)]",
                )}
              >
                {item.label}
                {item.key === current ? (
                  <span className="mt-1 block h-px bg-[color:var(--color-accent)]" />
                ) : null}
              </Link>
            ))}
          </nav>

          {/* Member identity + menu */}
          <Link
            href="/account"
            className="group flex items-center gap-3 rounded-[var(--radius-pill)] border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-primary)] px-2 py-2 pr-4 transition-colors hover:border-[color:var(--color-accent)] hover:bg-[color:var(--color-accent-pale)]/40"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-[color:var(--color-text-emphasis)] font-serif text-sm text-[color:var(--color-surface-canvas)]">
              {initials}
            </span>
            <span className="hidden text-sm font-medium text-[color:var(--color-text-primary)] sm:inline">
              {displayName}
            </span>
          </Link>
        </div>

        {/* Mobile nav */}
        <nav className="border-t border-[color:var(--color-border-subtle)] md:hidden">
          <ul className="mx-auto flex max-w-[1400px] items-center justify-between overflow-x-auto px-6 py-2">
            {navItems.map((item) => (
              <li key={item.key} className="flex-shrink-0">
                <Link
                  href={item.href}
                  className={cn(
                    "px-3 py-2 text-xs font-medium tracking-[0.12em] uppercase",
                    item.key === current
                      ? "text-[color:var(--color-accent-deep)]"
                      : "text-[color:var(--color-text-muted)]",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 py-10 md:px-10 md:py-14">{children}</main>

      <footer className="mt-20 border-t border-[color:var(--color-border-subtle)] py-10 text-center text-xs text-[color:var(--color-text-muted)]">
        © {new Date().getFullYear()} {clubConfig.name}. Member No. {member.memberNumber}.
        <form action="/api/auth/sign-out" method="post" className="mt-3">
          <button
            type="submit"
            className="text-[color:var(--color-accent-deep)] underline-offset-4 hover:underline"
          >
            Sign out
          </button>
        </form>
      </footer>
    </div>
  );
}
