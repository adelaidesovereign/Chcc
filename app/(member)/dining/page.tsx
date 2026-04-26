import Link from "next/link";
import { requireCurrentMember } from "@/lib/session";
import { getAdapter } from "@/lib/adapter";
import { clubConfig } from "@/club.config";
import { MemberShell } from "@/components/layouts/MemberShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SmartImage } from "@/components/brand/SmartImage";
import { formatLongDate, formatTime, relativeDay } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DiningHome() {
  const member = await requireCurrentMember();
  const adapter = getAdapter();
  const now = new Date();

  const [venues, reservations] = await Promise.all([
    adapter.listDiningVenues(),
    adapter.listMemberReservations({ memberId: member.id }),
  ]);

  const upcoming = [...reservations]
    .filter((r) => r.status === "confirmed" && r.time >= now.toISOString())
    .sort((a, b) => a.time.localeCompare(b.time));

  const venueName = (id: string) => clubConfig.diningVenues.find((v) => v.id === id)?.name ?? id;

  return (
    <MemberShell member={member} current="dining">
      <header className="mb-12">
        <p className="eyebrow">Dining</p>
        <h1 className="mt-3 font-serif text-4xl leading-[1.05] tracking-tight md:text-5xl">
          Reserve a table.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[color:var(--color-text-secondary)]">
          Three rooms, one kitchen. Choose a venue and we'll show you what's available.
        </p>
      </header>

      {/* Venues */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {venues.map((v) => {
          const cfg = clubConfig.diningVenues.find((c) => c.id === v.id);
          return (
            <Link
              key={v.id}
              href={`/dining/${v.id}`}
              className="group overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-primary)] transition-all hover:border-[color:var(--color-accent)] hover:shadow-[var(--shadow-md)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[color:var(--color-surface-secondary)]">
                <SmartImage
                  src={
                    v.photo ??
                    clubConfig.brand.photography.dining ??
                    clubConfig.brand.photography.hero
                  }
                  alt={v.name}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-[var(--duration-cinematic)] ease-[var(--ease-editorial)] group-hover:scale-[1.04]"
                  fallbackLabel={v.name}
                />
              </div>
              <div className="p-6">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="font-serif text-xl text-[color:var(--color-text-emphasis)]">
                    {v.name}
                  </h2>
                  <Badge tone="default">{v.dressCode.replace(/-/g, " ")}</Badge>
                </div>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed font-light text-[color:var(--color-text-secondary)]">
                  {v.description}
                </p>
                <div className="mt-5 flex items-center justify-between text-xs text-[color:var(--color-text-muted)]">
                  <span>Seats {v.capacity}</span>
                  <span className="text-[color:var(--color-accent-deep)] transition-transform group-hover:translate-x-1">
                    Reserve →
                  </span>
                </div>
                {cfg ? (
                  <p className="mt-4 border-t border-[color:var(--color-border-subtle)] pt-3 text-xs text-[color:var(--color-text-muted)]">
                    Open today {summariseTodayHours(cfg, now)}
                  </p>
                ) : null}
              </div>
            </Link>
          );
        })}
      </section>

      {/* Upcoming reservations */}
      <section className="mt-16">
        <div className="mb-6 flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Your reservations</p>
            <h2 className="mt-2 font-serif text-2xl tracking-tight md:text-3xl">Upcoming</h2>
          </div>
        </div>
        {upcoming.length === 0 ? (
          <Card variant="outlined">
            <CardContent className="py-12 text-center text-sm text-[color:var(--color-text-secondary)]">
              You don't have any reservations on the books. Choose a venue above to begin.
            </CardContent>
          </Card>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {upcoming.map((r) => (
              <li key={r.id}>
                <Card variant="outlined">
                  <CardContent className="flex items-center justify-between gap-4 py-5">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-serif text-lg text-[color:var(--color-text-emphasis)]">
                          {venueName(r.venueId)}
                        </span>
                        <Badge tone="accent">{relativeDay(r.time, now)}</Badge>
                      </div>
                      <div className="mt-1 text-sm text-[color:var(--color-text-secondary)]">
                        {formatLongDate(r.time)} · {formatTime(r.time)} · party of {r.partySize}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </MemberShell>
  );
}

function summariseTodayHours(cfg: (typeof clubConfig.diningVenues)[number], now: Date): string {
  const weekdays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
  const key = weekdays[now.getDay()]!;
  const windows = cfg.hours[key] ?? [];
  if (windows.length === 0) return "— closed today";
  return `· ${windows.join(", ")}`;
}
