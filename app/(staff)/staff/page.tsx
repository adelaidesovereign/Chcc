import Link from "next/link";
import { requireStaff } from "@/lib/staff";
import { getAdapter } from "@/lib/adapter";
import { clubConfig } from "@/club.config";
import { StaffShell } from "@/components/layouts/StaffShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { greetingFor, formatLongDate, formatTime, todayISO, addDaysISO } from "@/lib/format";
import type { DiningReservation, Member } from "@/lib/adapter/types";

export const dynamic = "force-dynamic";

export default async function StaffHome() {
  const staff = await requireStaff();
  const adapter = getAdapter();

  const today = todayISO();
  const tomorrow = addDaysISO(today, 1);

  const [todayReservations, tomorrowReservations, upcomingEvents, directory] = await Promise.all([
    adapter.listReservationsByDate({ date: today }),
    adapter.listReservationsByDate({ date: tomorrow }),
    adapter.listEvents({ from: new Date().toISOString() }),
    adapter.listDirectory({ limit: 1 }),
  ]);

  // Pull dietary needs across today's reservations (the kitchen board)
  const memberLookups = await Promise.all(
    todayReservations.map((r) => adapter.getMember(r.memberId)),
  );
  const dietaryByReservation = todayReservations
    .map((r, i) => {
      const m = memberLookups[i];
      if (!m || m.dietaryPreferences.length === 0) return null;
      return {
        time: r.time,
        memberName: `${m.preferredName ?? m.firstName} ${m.lastName}`,
        venueId: r.venueId,
        partySize: r.partySize,
        prefs: m.dietaryPreferences,
        notes: r.notes,
        occasion: r.occasion,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const venueName = (id: string) => clubConfig.diningVenues.find((v) => v.id === id)?.name ?? id;

  const todayCount = todayReservations.filter((r) => r.status === "confirmed").length;
  const todayCovers = todayReservations
    .filter((r) => r.status === "confirmed")
    .reduce((sum, r) => sum + r.partySize, 0);

  const featured = upcomingEvents.filter((e) => e.featured).slice(0, 3);

  return (
    <StaffShell member={staff} current="home">
      <header className="mb-12">
        <p className="eyebrow">Operations</p>
        <h1 className="mt-3 font-serif text-4xl leading-[1.05] tracking-tight md:text-5xl">
          {greetingFor()}. {formatLongDate(today)}.
        </h1>
        <p className="mt-3 text-base leading-relaxed text-[color:var(--color-text-secondary)]">
          {todayCount} reservation{todayCount === 1 ? "" : "s"} · {todayCovers} covers ·{" "}
          {dietaryByReservation.length} with dietary needs · {directory.total ?? 0} active members
        </p>
      </header>

      {/* KPI tiles */}
      <section className="mb-12 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-border-subtle)] bg-[color:var(--color-border-subtle)] md:grid-cols-4">
        <KpiTile
          label="Reservations today"
          value={String(todayCount)}
          sub={`${todayCovers} covers`}
        />
        <KpiTile
          label="Tomorrow"
          value={String(tomorrowReservations.filter((r) => r.status === "confirmed").length)}
          sub={`${tomorrowReservations.reduce((s, r) => s + r.partySize, 0)} covers projected`}
        />
        <KpiTile
          label="Dietary needs"
          value={String(dietaryByReservation.length)}
          sub="flagged tonight"
          tone="warning"
        />
        <KpiTile label="Featured events" value={String(featured.length)} sub="upcoming" />
      </section>

      {/* Kitchen board — dietary roll-up */}
      <section className="mb-12">
        <div className="mb-6 flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Kitchen board · {formatLongDate(today)}</p>
            <h2 className="mt-2 font-serif text-2xl tracking-tight md:text-3xl">
              Dietary needs flagged for tonight
            </h2>
          </div>
          <Link
            href="/staff/reservations"
            className="text-sm text-[color:var(--color-accent-deep)] hover:underline"
          >
            All reservations →
          </Link>
        </div>
        {dietaryByReservation.length === 0 ? (
          <Card variant="outlined">
            <CardContent className="py-12 text-center text-sm text-[color:var(--color-text-secondary)]">
              No dietary flags on the books for tonight.
            </CardContent>
          </Card>
        ) : (
          <Card variant="outlined">
            <CardContent className="p-0">
              <ul className="divide-y divide-[color:var(--color-border-subtle)]">
                {dietaryByReservation.map((d, i) => (
                  <li
                    key={i}
                    className="grid grid-cols-[auto_1fr_auto] items-center gap-6 px-6 py-4"
                  >
                    <div className="font-serif text-lg text-[color:var(--color-accent-deep)] tabular-nums">
                      {formatTime(d.time)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-serif text-base text-[color:var(--color-text-emphasis)]">
                        {d.memberName} · party of {d.partySize}
                      </div>
                      <div className="text-xs text-[color:var(--color-text-muted)]">
                        {venueName(d.venueId)}
                        {d.occasion ? ` · ${d.occasion}` : ""}
                        {d.notes ? ` · "${d.notes}"` : ""}
                      </div>
                    </div>
                    <div className="flex flex-wrap justify-end gap-1">
                      {d.prefs.map((p) => (
                        <Badge key={p} tone="warning">
                          {p.replace(/-/g, " ")}
                        </Badge>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Today's reservations table */}
      <section className="mb-12">
        <div className="mb-6 flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Today's tee sheet — dining</p>
            <h2 className="mt-2 font-serif text-2xl tracking-tight md:text-3xl">
              {todayCount} confirmed
            </h2>
          </div>
        </div>
        {todayReservations.length === 0 ? (
          <Card variant="outlined">
            <CardContent className="py-12 text-center text-sm text-[color:var(--color-text-secondary)]">
              Nothing on the books for today.
            </CardContent>
          </Card>
        ) : (
          <ReservationsTable
            reservations={todayReservations}
            members={memberLookups}
            venueName={venueName}
          />
        )}
      </section>

      {/* Featured events */}
      {featured.length > 0 ? (
        <section>
          <div className="mb-6 flex items-end justify-between gap-6">
            <div>
              <p className="eyebrow">On the calendar</p>
              <h2 className="mt-2 font-serif text-2xl tracking-tight md:text-3xl">
                Featured events
              </h2>
            </div>
            <Link
              href="/staff/events"
              className="text-sm text-[color:var(--color-accent-deep)] hover:underline"
            >
              All events →
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((e) => {
              const pct = Math.min(100, (e.attendingCount / e.capacity) * 100);
              return (
                <Link
                  key={e.id}
                  href={`/staff/events?id=${e.id}`}
                  className="block rounded-[var(--radius-lg)] border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-primary)] p-6 transition-colors hover:border-[color:var(--color-accent)]"
                >
                  <Badge tone="forest">{e.category.replace(/-/g, " ")}</Badge>
                  <h3 className="mt-3 font-serif text-lg text-[color:var(--color-text-emphasis)]">
                    {e.title}
                  </h3>
                  <div className="mt-1 text-xs text-[color:var(--color-text-muted)]">
                    {formatLongDate(e.startsAt)}
                  </div>
                  <div className="mt-4 text-xs text-[color:var(--color-text-secondary)]">
                    {e.attendingCount} / {e.capacity} attending
                  </div>
                  <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[color:var(--color-border-subtle)]">
                    <div
                      className="h-full bg-[color:var(--color-accent)]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}
    </StaffShell>
  );
}

function KpiTile({
  label,
  value,
  sub,
  tone,
}: {
  readonly label: string;
  readonly value: string;
  readonly sub?: string;
  readonly tone?: "warning";
}) {
  return (
    <div className="bg-[color:var(--color-surface-primary)] p-6">
      <div className="text-[10px] tracking-[var(--tracking-widest)] text-[color:var(--color-text-muted)] uppercase">
        {label}
      </div>
      <div
        className={`mt-3 font-serif text-4xl tabular-nums ${
          tone === "warning"
            ? "text-[color:var(--color-status-warning)]"
            : "text-[color:var(--color-text-emphasis)]"
        }`}
      >
        {value}
      </div>
      {sub ? <div className="mt-2 text-xs text-[color:var(--color-text-muted)]">{sub}</div> : null}
    </div>
  );
}

function ReservationsTable({
  reservations,
  members,
  venueName,
}: {
  readonly reservations: ReadonlyArray<DiningReservation>;
  readonly members: ReadonlyArray<Member | null>;
  readonly venueName: (id: string) => string;
}) {
  return (
    <Card variant="outlined">
      <CardContent className="p-0">
        <ul className="divide-y divide-[color:var(--color-border-subtle)]">
          {reservations.map((r, i) => {
            const m = members[i];
            return (
              <li
                key={r.id}
                className="grid grid-cols-[80px_1fr_auto_auto] items-center gap-6 px-6 py-4"
              >
                <div className="font-serif text-lg text-[color:var(--color-accent-deep)] tabular-nums">
                  {formatTime(r.time)}
                </div>
                <div className="min-w-0">
                  <div className="font-serif text-base text-[color:var(--color-text-emphasis)]">
                    {m ? `${m.preferredName ?? m.firstName} ${m.lastName}` : "(unknown member)"}
                  </div>
                  <div className="text-xs text-[color:var(--color-text-muted)]">
                    {venueName(r.venueId)}
                    {r.occasion ? ` · ${r.occasion}` : ""}
                    {r.notes ? ` · "${r.notes}"` : ""}
                  </div>
                </div>
                <div className="hidden text-sm text-[color:var(--color-text-secondary)] tabular-nums md:block">
                  party of {r.partySize}
                </div>
                <div className="flex flex-wrap justify-end gap-1">
                  {m?.dietaryPreferences.map((p) => (
                    <Badge key={p} tone="warning">
                      {p.replace(/-/g, " ")}
                    </Badge>
                  ))}
                  {r.status !== "confirmed" ? <Badge tone="default">{r.status}</Badge> : null}
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
