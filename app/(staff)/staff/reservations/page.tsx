import Link from "next/link";
import { requireStaff } from "@/lib/staff";
import { getAdapter } from "@/lib/adapter";
import { clubConfig } from "@/club.config";
import { StaffShell } from "@/components/layouts/StaffShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatLongDate, formatTime, todayISO, addDaysISO } from "@/lib/format";
import type { DiningReservation, Member } from "@/lib/adapter/types";

export const dynamic = "force-dynamic";

interface PageProps {
  readonly searchParams: Promise<{ date?: string; venue?: string }>;
}

export default async function StaffReservations({ searchParams }: PageProps) {
  const sp = await searchParams;
  const staff = await requireStaff();
  const adapter = getAdapter();

  const today = todayISO();
  const date = sp.date ?? today;
  const venueId = sp.venue;

  const dates = [-1, 0, 1, 2, 3, 4, 5, 6].map((d) => addDaysISO(today, d));
  const reservations = await adapter.listReservationsByDate({ date, venueId });
  const members = await Promise.all(reservations.map((r) => adapter.getMember(r.memberId)));

  const venueName = (id: string) => clubConfig.diningVenues.find((v) => v.id === id)?.name ?? id;

  // Group by service window heuristically (lunch < 16:00, dinner >= 16:00)
  type Row = (typeof reservations)[number];
  const lunchRows: Row[] = [];
  const dinnerRows: Row[] = [];
  for (const r of reservations) {
    const hour = Number(r.time.slice(11, 13));
    if (hour < 16) lunchRows.push(r);
    else dinnerRows.push(r);
  }

  const totalCovers = reservations
    .filter((r) => r.status === "confirmed")
    .reduce((sum, r) => sum + r.partySize, 0);

  return (
    <StaffShell member={staff} current="reservations">
      <header className="mb-10">
        <p className="eyebrow">Dining</p>
        <h1 className="mt-3 font-serif text-4xl leading-[1.05] tracking-tight md:text-5xl">
          Reservations
        </h1>
        <p className="mt-3 text-sm text-[color:var(--color-text-secondary)]">
          {reservations.length} on the books · {totalCovers} covers
        </p>
      </header>

      {/* Date strip */}
      <section className="mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {dates.map((d) => {
            const dt = new Date(`${d}T12:00:00`);
            const weekday = dt.toLocaleDateString("en-US", { weekday: "short" });
            const dayNum = dt.getDate();
            const isToday = d === today;
            const isActive = d === date;
            return (
              <Link
                key={d}
                href={`/staff/reservations?date=${d}${venueId ? `&venue=${venueId}` : ""}`}
                className={`flex h-20 w-16 flex-shrink-0 flex-col items-center justify-center gap-1 rounded-[var(--radius-sm)] border ${
                  isActive
                    ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent-pale)]/30 text-[color:var(--color-accent-deep)]"
                    : "border-[color:var(--color-border-default)] bg-[color:var(--color-surface-primary)] text-[color:var(--color-text-primary)] hover:border-[color:var(--color-accent)]"
                }`}
              >
                <span className="text-[10px] tracking-[var(--tracking-widest)] uppercase">
                  {weekday}
                  {isToday ? " · today" : ""}
                </span>
                <span className="font-serif text-2xl">{dayNum}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Venue filter */}
      <section className="mb-10 flex flex-wrap gap-2">
        <Link
          href={`/staff/reservations?date=${date}`}
          className={`rounded-[var(--radius-pill)] border px-4 py-2 text-xs font-medium tracking-[var(--tracking-widest)] uppercase ${
            !venueId
              ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent-pale)]/30 text-[color:var(--color-accent-deep)]"
              : "border-[color:var(--color-border-default)] bg-[color:var(--color-surface-primary)] text-[color:var(--color-text-secondary)] hover:border-[color:var(--color-accent)]"
          }`}
        >
          All venues
        </Link>
        {clubConfig.diningVenues.map((v) => (
          <Link
            key={v.id}
            href={`/staff/reservations?date=${date}&venue=${v.id}`}
            className={`rounded-[var(--radius-pill)] border px-4 py-2 text-xs font-medium tracking-[var(--tracking-widest)] uppercase ${
              venueId === v.id
                ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent-pale)]/30 text-[color:var(--color-accent-deep)]"
                : "border-[color:var(--color-border-default)] bg-[color:var(--color-surface-primary)] text-[color:var(--color-text-secondary)] hover:border-[color:var(--color-accent)]"
            }`}
          >
            {v.name}
          </Link>
        ))}
      </section>

      <h2 className="mb-6 font-serif text-2xl tracking-tight">{formatLongDate(date)}</h2>

      {reservations.length === 0 ? (
        <Card variant="outlined">
          <CardContent className="py-12 text-center text-sm text-[color:var(--color-text-secondary)]">
            No reservations on the books.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-10">
          {lunchRows.length > 0 ? (
            <ServiceSection
              label="Lunch"
              rows={lunchRows}
              members={members}
              allRows={reservations}
              venueName={venueName}
            />
          ) : null}
          {dinnerRows.length > 0 ? (
            <ServiceSection
              label="Dinner"
              rows={dinnerRows}
              members={members}
              allRows={reservations}
              venueName={venueName}
            />
          ) : null}
        </div>
      )}
    </StaffShell>
  );
}

function ServiceSection({
  label,
  rows,
  members,
  allRows,
  venueName,
}: {
  readonly label: string;
  readonly rows: ReadonlyArray<DiningReservation>;
  readonly members: ReadonlyArray<Member | null>;
  readonly allRows: ReadonlyArray<DiningReservation>;
  readonly venueName: (id: string) => string;
}) {
  const totalCovers = rows
    .filter((r) => r.status === "confirmed")
    .reduce((sum, r) => sum + r.partySize, 0);
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="font-serif text-xl text-[color:var(--color-accent-deep)]">{label}</h3>
        <span className="text-xs text-[color:var(--color-text-muted)]">
          {rows.length} bookings · {totalCovers} covers
        </span>
      </div>
      <Card variant="outlined">
        <CardContent className="p-0">
          <ul className="divide-y divide-[color:var(--color-border-subtle)]">
            {rows.map((r) => {
              const idx = allRows.findIndex((x) => x.id === r.id);
              const m = members[idx];
              return (
                <li
                  key={r.id}
                  className="grid grid-cols-[70px_1fr_auto] items-center gap-4 px-6 py-4 md:grid-cols-[80px_1fr_auto_auto]"
                >
                  <div className="font-serif text-lg text-[color:var(--color-accent-deep)] tabular-nums">
                    {formatTime(r.time)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-serif text-base text-[color:var(--color-text-emphasis)]">
                      {m ? `${m.preferredName ?? m.firstName} ${m.lastName}` : "(unknown)"}
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
    </section>
  );
}
