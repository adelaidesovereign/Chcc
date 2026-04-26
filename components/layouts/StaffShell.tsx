import Link from "next/link";
import Image from "next/image";
import { clubConfig } from "@/club.config";
import { cn } from "@/lib/utils";
import type { Member } from "@/lib/adapter/types";

interface StaffShellProps {
  readonly member: Member;
  readonly children: React.ReactNode;
  readonly current?: StaffNavKey;
}

type StaffNavKey = "home" | "reservations" | "tee-sheet" | "events" | "members";

const navItems: ReadonlyArray<{ key: StaffNavKey; label: string; href: string }> = [
  { key: "home", label: "Overview", href: "/staff" },
  { key: "reservations", label: "Dining", href: "/staff/reservations" },
  { key: "events", label: "Events", href: "/staff/events" },
  { key: "members", label: "Members", href: "/staff/members" },
];

export function StaffShell({ member, children, current = "home" }: StaffShellProps) {
  const initials = `${member.firstName[0] ?? ""}${member.lastName[0] ?? ""}`.toUpperCase();

  return (
    <div
      data-theme="hearth"
      className="min-h-dvh bg-[color:var(--color-surface-canvas)] text-[color:var(--color-text-primary)]"
    >
      <header className="sticky top-0 z-30 border-b border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-canvas)]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-6 px-6 py-4 md:px-10">
          <Link href="/staff" className="flex items-center gap-3">
            <Image
              src={clubConfig.brand.logoMarkPath ?? clubConfig.brand.logoPath}
              alt={clubConfig.shortName}
              width={40}
              height={26}
              priority
            />
            <div className="flex items-baseline gap-3">
              <div className="hidden font-serif text-base text-[color:var(--color-text-emphasis)] md:block">
                {clubConfig.shortName}
              </div>
              <span className="text-[10px] tracking-[var(--tracking-widest)] text-[color:var(--color-accent-deep)] uppercase">
                Staff
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
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

          <div className="flex items-center gap-3">
            <Link
              href="/home"
              className="hidden text-xs tracking-[var(--tracking-widest)] text-[color:var(--color-text-muted)] uppercase hover:text-[color:var(--color-accent-deep)] md:inline"
            >
              ← Member view
            </Link>
            <span className="flex size-9 items-center justify-center rounded-full bg-[color:var(--color-accent)] font-serif text-sm text-[color:var(--color-text-on-accent)]">
              {initials}
            </span>
          </div>
        </div>

        <nav className="border-t border-[color:var(--color-border-subtle)] md:hidden">
          <ul className="mx-auto flex max-w-[1500px] items-center justify-between overflow-x-auto px-6 py-2">
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

      <main className="mx-auto max-w-[1500px] px-6 py-10 md:px-10 md:py-14">{children}</main>
    </div>
  );
}
