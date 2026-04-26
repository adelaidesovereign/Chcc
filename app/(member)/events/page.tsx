import Link from "next/link";
import { requireCurrentMember } from "@/lib/session";
import { getAdapter } from "@/lib/adapter";
import { MemberShell } from "@/components/layouts/MemberShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SmartImage } from "@/components/brand/SmartImage";
import { clubConfig } from "@/club.config";
import { formatLongDate, formatTime, relativeDay, formatPrice } from "@/lib/format";
import type { EventCategory } from "@/lib/adapter/types";

export const dynamic = "force-dynamic";

interface PageProps {
  readonly searchParams: Promise<{ category?: EventCategory }>;
}

const CATEGORY_LABELS: Record<EventCategory, string> = {
  "golf-tournament": "Golf",
  "wine-dinner": "Wine",
  holiday: "Holiday",
  family: "Family",
  social: "Social",
  racquets: "Racquets",
  junior: "Junior",
};

export default async function EventsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const member = await requireCurrentMember();
  const adapter = getAdapter();

  const now = new Date();
  const [events, myRsvps] = await Promise.all([
    adapter.listEvents({
      from: now.toISOString(),
      category: sp.category,
    }),
    adapter.getMemberRsvps(member.id),
  ]);

  const rsvpEventIds = new Set(myRsvps.map((r) => r.eventId));

  const featured = events.filter((e) => e.featured).slice(0, 1)[0];
  const rest = events.filter((e) => e.id !== featured?.id);

  const categories: EventCategory[] = [
    "golf-tournament",
    "wine-dinner",
    "holiday",
    "family",
    "social",
    "racquets",
    "junior",
  ];

  return (
    <MemberShell member={member} current="events">
      <header className="mb-12">
        <p className="eyebrow">Calendar</p>
        <h1 className="mt-3 font-serif text-4xl leading-[1.05] tracking-tight md:text-5xl">
          What's ahead.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[color:var(--color-text-secondary)]">
          Tournaments, wine dinners, holidays, and the occasional bonfire on the lawn.
        </p>
      </header>

      {/* Category filter */}
      <section className="mb-10 flex flex-wrap gap-2">
        <Link
          href="/events"
          className={`rounded-[var(--radius-pill)] border px-4 py-2 text-xs font-medium tracking-[var(--tracking-widest)] uppercase ${
            !sp.category
              ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent-pale)] text-[color:var(--color-accent-deep)]"
              : "border-[color:var(--color-border-default)] bg-[color:var(--color-surface-primary)] text-[color:var(--color-text-secondary)] hover:border-[color:var(--color-accent)]"
          }`}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c}
            href={`/events?category=${c}`}
            className={`rounded-[var(--radius-pill)] border px-4 py-2 text-xs font-medium tracking-[var(--tracking-widest)] uppercase ${
              sp.category === c
                ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent-pale)] text-[color:var(--color-accent-deep)]"
                : "border-[color:var(--color-border-default)] bg-[color:var(--color-surface-primary)] text-[color:var(--color-text-secondary)] hover:border-[color:var(--color-accent)]"
            }`}
          >
            {CATEGORY_LABELS[c]}
          </Link>
        ))}
      </section>

      {events.length === 0 ? (
        <Card variant="outlined">
          <CardContent className="py-12 text-center text-sm text-[color:var(--color-text-secondary)]">
            No events match this filter.
          </CardContent>
        </Card>
      ) : (
        <>
          {featured ? (
            <Link
              href={`/events/${featured.id}`}
              className="group mb-12 block overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-primary)]"
            >
              <div className="grid lg:grid-cols-2">
                <div className="relative aspect-[4/3] overflow-hidden bg-[color:var(--color-surface-secondary)] lg:aspect-auto">
                  <SmartImage
                    src={featured.heroImage ?? clubConfig.brand.photography.hero}
                    alt={featured.title}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover transition-transform duration-[var(--duration-cinematic)] ease-[var(--ease-editorial)] group-hover:scale-[1.03]"
                    fallbackLabel={CATEGORY_LABELS[featured.category]}
                  />
                </div>
                <div className="flex flex-col justify-center gap-6 p-8 md:p-12">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="accent">Featured</Badge>
                    <Badge tone="forest">{CATEGORY_LABELS[featured.category]}</Badge>
                    {rsvpEventIds.has(featured.id) ? (
                      <Badge tone="forest">You're attending</Badge>
                    ) : null}
                  </div>
                  <h2 className="font-serif text-3xl leading-tight tracking-tight md:text-4xl">
                    {featured.title}
                  </h2>
                  <div className="text-sm text-[color:var(--color-text-secondary)]">
                    {formatLongDate(featured.startsAt)} · {formatTime(featured.startsAt)} ·{" "}
                    {featured.location}
                  </div>
                  <p className="line-clamp-3 text-base leading-relaxed font-light text-[color:var(--color-text-secondary)]">
                    {featured.description}
                  </p>
                  <div className="flex items-center gap-4 pt-2">
                    <span className="text-xs text-[color:var(--color-text-muted)]">
                      {featured.attendingCount} / {featured.capacity} attending
                    </span>
                    {featured.priceCents ? (
                      <span className="font-serif text-lg text-[color:var(--color-text-emphasis)]">
                        {formatPrice(featured.priceCents)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </Link>
          ) : null}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((e) => (
              <Link
                key={e.id}
                href={`/events/${e.id}`}
                className="group overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-primary)] transition-all hover:border-[color:var(--color-accent)] hover:shadow-[var(--shadow-md)]"
              >
                <div className="p-6">
                  <div className="flex items-center gap-2">
                    <Badge tone="forest">{CATEGORY_LABELS[e.category]}</Badge>
                    <Badge tone="accent">{relativeDay(e.startsAt, now)}</Badge>
                    {rsvpEventIds.has(e.id) ? <Badge tone="forest">RSVP'd</Badge> : null}
                  </div>
                  <h3 className="mt-4 font-serif text-xl leading-tight text-[color:var(--color-text-emphasis)]">
                    {e.title}
                  </h3>
                  <div className="mt-2 text-sm text-[color:var(--color-text-secondary)]">
                    {formatLongDate(e.startsAt)} · {formatTime(e.startsAt)}
                  </div>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed font-light text-[color:var(--color-text-secondary)]">
                    {e.description}
                  </p>
                  <div className="mt-5 flex items-center justify-between text-xs text-[color:var(--color-text-muted)]">
                    <span>{e.location}</span>
                    {e.priceCents ? (
                      <span className="font-serif text-base text-[color:var(--color-text-emphasis)]">
                        {formatPrice(e.priceCents)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </MemberShell>
  );
}
