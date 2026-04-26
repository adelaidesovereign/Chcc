import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCurrentMember } from "@/lib/session";
import { getAdapter } from "@/lib/adapter";
import { clubConfig } from "@/club.config";
import { MemberShell } from "@/components/layouts/MemberShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SmartImage } from "@/components/brand/SmartImage";
import { formatLongDate, formatTime, todayISO, addDaysISO } from "@/lib/format";
import { ReservationForm } from "./ReservationForm";

export const dynamic = "force-dynamic";

interface PageProps {
  readonly params: Promise<{ venueId: string }>;
  readonly searchParams: Promise<{ date?: string; party?: string }>;
}

export default async function VenueDetail({ params, searchParams }: PageProps) {
  const { venueId } = await params;
  const sp = await searchParams;

  const member = await requireCurrentMember();
  const adapter = getAdapter();

  const venues = await adapter.listDiningVenues();
  const venue = venues.find((v) => v.id === venueId);
  if (!venue) notFound();

  const cfg = clubConfig.diningVenues.find((c) => c.id === venueId);
  const today = todayISO();
  const date = sp.date ?? today;
  const partySize = Math.max(1, Math.min(20, Number(sp.party ?? 2) || 2));

  const dates = [0, 1, 2, 3, 4, 5, 6].map((d) => addDaysISO(today, d));
  const availableTimes = await adapter.listAvailableTimes({
    venueId,
    date,
    partySize,
  });

  const todaysMenu = await adapter.listMenusForDate({
    date,
    venueId,
  });
  const dinnerMenu = todaysMenu.find((m) => m.service === "dinner") ?? todaysMenu[0];

  return (
    <MemberShell member={member} current="dining">
      <div className="mb-8">
        <Link
          href="/dining"
          className="text-xs tracking-[var(--tracking-widest)] text-[color:var(--color-text-muted)] uppercase hover:text-[color:var(--color-accent-deep)]"
        >
          ← All venues
        </Link>
      </div>

      <header className="mb-12 grid gap-12 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="eyebrow">Reserve a table</p>
          <h1 className="mt-3 font-serif text-4xl leading-[1.05] tracking-tight md:text-5xl">
            {venue.name}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed font-light text-[color:var(--color-text-secondary)]">
            {venue.description}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Badge tone="default">Dress · {venue.dressCode.replace(/-/g, " ")}</Badge>
            <Badge tone="default">Seats {venue.capacity}</Badge>
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] bg-[color:var(--color-surface-secondary)]">
          <SmartImage
            src={
              venue.photo ??
              clubConfig.brand.photography.dining ??
              clubConfig.brand.photography.hero
            }
            alt={venue.name}
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover"
            fallbackLabel={venue.name}
          />
        </div>
      </header>

      <section className="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
        {/* Booking form */}
        <div className="space-y-10">
          {/* Date selector */}
          <div className="space-y-3">
            <p className="text-xs font-medium tracking-[var(--tracking-widest)] text-[color:var(--color-accent-deep)] uppercase">
              Date
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {dates.map((d) => {
                const dateObj = new Date(`${d}T12:00:00`);
                const weekday = dateObj.toLocaleDateString("en-US", { weekday: "short" });
                const dayNum = dateObj.getDate();
                const isActive = d === date;
                return (
                  <Link
                    key={d}
                    href={`/dining/${venueId}?date=${d}&party=${partySize}`}
                    className={`flex h-20 w-16 flex-shrink-0 flex-col items-center justify-center gap-1 rounded-[var(--radius-sm)] border transition-all ${
                      isActive
                        ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent-pale)] text-[color:var(--color-accent-deep)]"
                        : "border-[color:var(--color-border-default)] bg-[color:var(--color-surface-primary)] text-[color:var(--color-text-primary)] hover:border-[color:var(--color-accent)]"
                    }`}
                  >
                    <span className="text-[10px] tracking-[var(--tracking-widest)] uppercase">
                      {weekday}
                    </span>
                    <span className="font-serif text-2xl">{dayNum}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <ReservationForm
            venueId={venueId}
            venueName={venue.name}
            availableTimes={availableTimes.map((t) => ({
              time: t.time,
              label: formatTime(t.time),
            }))}
            memberDietaryPreferences={member.dietaryPreferences}
          />
        </div>

        {/* Menu preview */}
        <aside className="space-y-6">
          <Card variant="outlined">
            <CardHeader>
              <p className="eyebrow">Menu preview</p>
              <CardTitle className="mt-2">{formatLongDate(date)}</CardTitle>
            </CardHeader>
            <CardContent>
              {dinnerMenu ? (
                <ul className="space-y-5">
                  {dinnerMenu.items.slice(0, 6).map((item) => (
                    <li
                      key={item.id}
                      className="border-b border-[color:var(--color-border-subtle)] pb-4 last:border-0 last:pb-0"
                    >
                      <div className="text-[10px] tracking-[var(--tracking-widest)] text-[color:var(--color-accent-deep)] uppercase">
                        {item.section}
                      </div>
                      <div className="mt-1 font-serif text-base text-[color:var(--color-text-emphasis)]">
                        {item.name}
                      </div>
                      <p className="mt-1 text-sm leading-relaxed font-light text-[color:var(--color-text-secondary)]">
                        {item.description}
                      </p>
                      {item.dietaryTags.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-1">
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
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[color:var(--color-text-secondary)]">
                  Menu not yet posted for this date.
                </p>
              )}
            </CardContent>
          </Card>

          {cfg ? (
            <Card variant="outlined">
              <CardHeader>
                <p className="eyebrow">Hours</p>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {(["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const).map((day) => (
                  <div key={day} className="flex justify-between">
                    <dt className="text-[color:var(--color-text-muted)] capitalize">{day}</dt>
                    <dd className="text-[color:var(--color-text-primary)]">
                      {cfg.hours[day].length === 0 ? "Closed" : cfg.hours[day].join(", ")}
                    </dd>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </aside>
      </section>
    </MemberShell>
  );
}
