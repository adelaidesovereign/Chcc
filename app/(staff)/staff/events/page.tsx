import { requireStaff } from "@/lib/staff";
import { getAdapter } from "@/lib/adapter";
import { StaffShell } from "@/components/layouts/StaffShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatLongDate, formatTime, formatPrice, relativeDay } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function StaffEvents() {
  const staff = await requireStaff();
  const adapter = getAdapter();

  const events = await adapter.listEvents({ from: new Date().toISOString() });

  const totalCapacity = events.reduce((s, e) => s + e.capacity, 0);
  const totalAttending = events.reduce((s, e) => s + e.attendingCount, 0);
  const totalRevenue = events.reduce((s, e) => s + (e.priceCents ?? 0) * e.attendingCount, 0);

  return (
    <StaffShell member={staff} current="events">
      <header className="mb-10">
        <p className="eyebrow">Events</p>
        <h1 className="mt-3 font-serif text-4xl leading-[1.05] tracking-tight md:text-5xl">
          Calendar
        </h1>
        <p className="mt-3 text-sm text-[color:var(--color-text-secondary)]">
          {events.length} upcoming · {totalAttending}/{totalCapacity} seats committed · projected
          revenue {formatPrice(totalRevenue)}
        </p>
      </header>

      <div className="space-y-4">
        {events.map((e) => {
          const pct = Math.min(100, (e.attendingCount / e.capacity) * 100);
          const isFull = pct >= 100;
          const isFilling = pct >= 75 && !isFull;
          return (
            <Card key={e.id} variant="outlined">
              <CardContent className="grid grid-cols-1 gap-4 p-6 md:grid-cols-[1.5fr_1fr_auto] md:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="forest">{e.category.replace(/-/g, " ")}</Badge>
                    {e.featured ? <Badge tone="accent">Featured</Badge> : null}
                    {isFull ? <Badge tone="danger">Full</Badge> : null}
                    {isFilling ? <Badge tone="warning">Filling</Badge> : null}
                    <span className="text-xs text-[color:var(--color-text-muted)]">
                      {relativeDay(e.startsAt)}
                    </span>
                  </div>
                  <h2 className="mt-3 font-serif text-xl text-[color:var(--color-text-emphasis)]">
                    {e.title}
                  </h2>
                  <div className="mt-1 text-xs text-[color:var(--color-text-muted)]">
                    {formatLongDate(e.startsAt)} · {formatTime(e.startsAt)} – {formatTime(e.endsAt)}{" "}
                    · {e.location}
                    {e.dressCode ? ` · ${e.dressCode.replace(/-/g, " ")}` : ""}
                  </div>
                </div>

                <div>
                  <div className="flex items-baseline justify-between gap-2 text-xs">
                    <span className="text-[color:var(--color-text-muted)]">Attending</span>
                    <span className="font-serif text-base text-[color:var(--color-text-emphasis)] tabular-nums">
                      {e.attendingCount} / {e.capacity}
                    </span>
                  </div>
                  <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[color:var(--color-border-subtle)]">
                    <div
                      className={`h-full ${
                        isFull
                          ? "bg-[color:var(--color-status-danger)]"
                          : isFilling
                            ? "bg-[color:var(--color-status-warning)]"
                            : "bg-[color:var(--color-accent)]"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="text-right">
                  {e.priceCents ? (
                    <>
                      <div className="font-serif text-lg text-[color:var(--color-text-emphasis)]">
                        {formatPrice(e.priceCents * e.attendingCount)}
                      </div>
                      <div className="text-xs text-[color:var(--color-text-muted)]">
                        {formatPrice(e.priceCents)}/guest
                      </div>
                    </>
                  ) : (
                    <span className="text-xs text-[color:var(--color-text-muted)]">No charge</span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </StaffShell>
  );
}
