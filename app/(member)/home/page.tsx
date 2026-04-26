import Link from "next/link";
import { requireCurrentMember } from "@/lib/session";
import { getAdapter } from "@/lib/adapter";
import { clubConfig } from "@/club.config";
import { MemberShell } from "@/components/layouts/MemberShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { greetingFor, formatLongDate, formatTime, relativeDay, todayISO } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function MemberHome() {
  const member = await requireCurrentMember();
  const adapter = getAdapter();

  const now = new Date();
  const today = todayISO(now);

  // Pull everything in parallel.
  const [reservations, events, menus, mainDiningVenue] = await Promise.all([
    adapter.listMemberReservations({
      memberId: member.id,
      from: now.toISOString(),
    }),
    adapter.listEvents({ from: now.toISOString() }),
    adapter.listMenusForDate({ date: today, venueId: "main-dining" }),
    Promise.resolve(clubConfig.diningVenues.find((v) => v.id === "main-dining")),
  ]);

  // Find next upcoming reservation (closest in the future).
  const upcomingReservations = [...reservations]
    .filter((r) => r.status === "confirmed" && r.time >= now.toISOString())
    .sort((a, b) => a.time.localeCompare(b.time));
  const nextReservation = upcomingReservations[0];

  // Find next featured event.
  const featuredEvents = [...events]
    .filter((e) => e.featured && e.startsAt >= now.toISOString())
    .slice(0, 3);

  // Tonight's menu (if available)
  const tonightMenu = menus.find((m) => m.service === "dinner");

  const venueName = (id: string) => clubConfig.diningVenues.find((v) => v.id === id)?.name ?? id;

  // Friendly anniversary / birthday call-out
  const isAnniversaryThisMonth = (() => {
    if (!member.anniversaryDate) return false;
    const m = member.anniversaryDate.split("-")[1];
    const nowMonth = String(now.getMonth() + 1).padStart(2, "0");
    return m === nowMonth;
  })();

  const displayName = member.preferredName ?? member.firstName;

  return (
    <MemberShell member={member} current="home">
      {/* Hero greeting */}
      <section className="mb-12">
        <p className="eyebrow">{formatLongDate(now)}</p>
        <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-[1.05] tracking-tight text-balance md:text-5xl lg:text-6xl">
          {greetingFor(now)}, {displayName}.
        </h1>
        {isAnniversaryThisMonth ? (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[color:var(--color-text-secondary)]">
            We noticed your anniversary falls this month — please let our maître d' know if you'd
            like us to make a fuss.
          </p>
        ) : (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[color:var(--color-text-secondary)]">
            Here's what's ahead at the club.
          </p>
        )}
      </section>

      {/* Top grid */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Next reservation */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Your next reservation</p>
              {nextReservation ? (
                <CardTitle className="mt-2">{venueName(nextReservation.venueId)}</CardTitle>
              ) : (
                <CardTitle className="mt-2">No reservations on the books</CardTitle>
              )}
            </div>
            {nextReservation ? (
              <Badge tone="accent">{relativeDay(nextReservation.time, now)}</Badge>
            ) : null}
          </CardHeader>
          <CardContent>
            {nextReservation ? (
              <div className="space-y-5">
                <div className="flex items-baseline gap-6">
                  <div>
                    <div className="text-xs tracking-[var(--tracking-widest)] text-[color:var(--color-text-muted)] uppercase">
                      Date
                    </div>
                    <div className="mt-1 font-serif text-lg text-[color:var(--color-text-emphasis)]">
                      {formatLongDate(nextReservation.time)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs tracking-[var(--tracking-widest)] text-[color:var(--color-text-muted)] uppercase">
                      Time
                    </div>
                    <div className="mt-1 font-serif text-lg text-[color:var(--color-text-emphasis)]">
                      {formatTime(nextReservation.time)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs tracking-[var(--tracking-widest)] text-[color:var(--color-text-muted)] uppercase">
                      Party
                    </div>
                    <div className="mt-1 font-serif text-lg text-[color:var(--color-text-emphasis)]">
                      {nextReservation.partySize}
                    </div>
                  </div>
                </div>
                {member.dietaryPreferences.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-2 border-t border-[color:var(--color-border-subtle)] pt-4">
                    <span className="text-xs text-[color:var(--color-text-muted)]">
                      We've flagged the kitchen on:
                    </span>
                    {member.dietaryPreferences.map((d) => (
                      <Badge key={d} tone="warning">
                        {d.replace(/-/g, " ")}
                      </Badge>
                    ))}
                  </div>
                ) : null}
                {nextReservation.notes ? (
                  <p className="text-sm text-[color:var(--color-text-secondary)] italic">
                    "{nextReservation.notes}"
                  </p>
                ) : null}
                <Link
                  href="/dining"
                  className="inline-flex items-center gap-2 text-sm font-medium tracking-[0.04em] text-[color:var(--color-accent-deep)] hover:underline"
                >
                  Manage reservations →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm leading-relaxed text-[color:var(--color-text-secondary)]">
                  Tonight at {mainDiningVenue?.name}:{" "}
                  {tonightMenu?.items[0]?.name ?? "seasonal menu"}
                  {tonightMenu?.items[1] ? `, ${tonightMenu.items[1].name}` : ""}.
                </p>
                <Link
                  href="/dining"
                  className="inline-flex items-center gap-2 text-sm font-medium tracking-[0.04em] text-[color:var(--color-accent-deep)] hover:underline"
                >
                  Reserve a table →
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today on the course */}
        <Card>
          <CardHeader>
            <p className="eyebrow">On the course today</p>
            <CardTitle className="mt-2">The Course</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-[color:var(--color-text-muted)]">Conditions</dt>
                <dd className="font-medium text-[color:var(--color-text-primary)]">
                  Dry · Light wind
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-[color:var(--color-text-muted)]">Tee sheet</dt>
                <dd className="font-medium text-[color:var(--color-text-primary)]">
                  Open after 1:30 PM
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-[color:var(--color-text-muted)]">Practice green</dt>
                <dd className="font-medium text-[color:var(--color-text-primary)]">Open</dd>
              </div>
            </dl>
            <Link
              href="/golf"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium tracking-[0.04em] text-[color:var(--color-accent-deep)] hover:underline"
            >
              Book a tee time →
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Tonight's menu */}
      {tonightMenu ? (
        <section className="mt-12">
          <div className="mb-6 flex items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Tonight at {mainDiningVenue?.name ?? "Main Dining"}</p>
              <h2 className="mt-2 font-serif text-3xl tracking-tight text-balance md:text-4xl">
                {formatLongDate(now)}
              </h2>
            </div>
            <Link
              href="/dining"
              className="hidden text-sm text-[color:var(--color-accent-deep)] hover:underline md:inline"
            >
              View full menu →
            </Link>
          </div>
          <div className="grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-border-subtle)] bg-[color:var(--color-border-subtle)] sm:grid-cols-2 lg:grid-cols-3">
            {tonightMenu.items.slice(0, 6).map((item) => (
              <article key={item.id} className="bg-[color:var(--color-surface-primary)] p-6">
                <div className="text-[10px] tracking-[var(--tracking-widest)] text-[color:var(--color-accent-deep)] uppercase">
                  {item.section}
                </div>
                <h3 className="mt-2 font-serif text-lg text-[color:var(--color-text-emphasis)]">
                  {item.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed font-light text-[color:var(--color-text-secondary)]">
                  {item.description}
                </p>
                {item.dietaryTags.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {item.dietaryTags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] tracking-[var(--tracking-widest)] text-[color:var(--color-text-muted)] uppercase"
                      >
                        {t.replace(/-/g, " ")}
                      </span>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {/* Upcoming events */}
      {featuredEvents.length > 0 ? (
        <section className="mt-12">
          <div className="mb-6 flex items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Upcoming at the club</p>
              <h2 className="mt-2 font-serif text-3xl tracking-tight text-balance md:text-4xl">
                Featured events
              </h2>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredEvents.map((e) => (
              <Card key={e.id} variant="outlined">
                <CardHeader>
                  <Badge tone="forest">{e.category.replace(/-/g, " ")}</Badge>
                  <CardTitle className="mt-3">{e.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm font-medium text-[color:var(--color-text-emphasis)]">
                    {formatLongDate(e.startsAt)} · {formatTime(e.startsAt)}
                  </div>
                  <p className="line-clamp-3 text-sm leading-relaxed font-light text-[color:var(--color-text-secondary)]">
                    {e.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-[color:var(--color-text-muted)]">
                    <span>{e.location}</span>
                    <span>
                      {e.attendingCount} / {e.capacity} attending
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </MemberShell>
  );
}
