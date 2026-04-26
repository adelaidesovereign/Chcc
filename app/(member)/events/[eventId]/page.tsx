import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCurrentMember } from "@/lib/session";
import { getAdapter } from "@/lib/adapter";
import { clubConfig } from "@/club.config";
import { MemberShell } from "@/components/layouts/MemberShell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SmartImage } from "@/components/brand/SmartImage";
import { formatLongDate, formatTime, formatPrice, relativeDay } from "@/lib/format";
import { RsvpForm } from "./RsvpForm";

export const dynamic = "force-dynamic";

interface PageProps {
  readonly params: Promise<{ eventId: string }>;
  readonly searchParams: Promise<{ rsvp?: string }>;
}

export default async function EventDetail({ params, searchParams }: PageProps) {
  const { eventId } = await params;
  const sp = await searchParams;

  const member = await requireCurrentMember();
  const adapter = getAdapter();
  const event = await adapter.getEvent(eventId);
  if (!event) notFound();

  const rsvps = await adapter.getMemberRsvps(member.id);
  const myRsvp = rsvps.find((r) => r.eventId === eventId);
  const justRsvpd = sp.rsvp === "1";

  return (
    <MemberShell member={member} current="events">
      <div className="mb-8">
        <Link
          href="/events"
          className="text-xs tracking-[var(--tracking-widest)] text-[color:var(--color-text-muted)] uppercase hover:text-[color:var(--color-accent-deep)]"
        >
          ← All events
        </Link>
      </div>

      <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <article>
          <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-[var(--radius-lg)] bg-[color:var(--color-surface-secondary)]">
            <SmartImage
              src={event.heroImage ?? clubConfig.brand.photography.hero}
              alt={event.title}
              fill
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="object-cover"
              fallbackLabel={event.category.replace(/-/g, " ")}
            />
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-2">
            <Badge tone="forest">{event.category.replace(/-/g, " ")}</Badge>
            {event.featured ? <Badge tone="accent">Featured</Badge> : null}
            <Badge tone="default">{relativeDay(event.startsAt)}</Badge>
          </div>

          <h1 className="font-serif text-4xl leading-tight tracking-tight md:text-5xl">
            {event.title}
          </h1>

          <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-6 border-y border-[color:var(--color-border-subtle)] py-8 md:grid-cols-4">
            <div>
              <dt className="text-[10px] tracking-[var(--tracking-widest)] text-[color:var(--color-text-muted)] uppercase">
                Date
              </dt>
              <dd className="mt-2 font-serif text-base text-[color:var(--color-text-emphasis)]">
                {formatLongDate(event.startsAt)}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] tracking-[var(--tracking-widest)] text-[color:var(--color-text-muted)] uppercase">
                Time
              </dt>
              <dd className="mt-2 font-serif text-base text-[color:var(--color-text-emphasis)]">
                {formatTime(event.startsAt)} – {formatTime(event.endsAt)}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] tracking-[var(--tracking-widest)] text-[color:var(--color-text-muted)] uppercase">
                Where
              </dt>
              <dd className="mt-2 font-serif text-base text-[color:var(--color-text-emphasis)]">
                {event.location}
              </dd>
            </div>
            {event.priceCents ? (
              <div>
                <dt className="text-[10px] tracking-[var(--tracking-widest)] text-[color:var(--color-text-muted)] uppercase">
                  Per guest
                </dt>
                <dd className="mt-2 font-serif text-base text-[color:var(--color-text-emphasis)]">
                  {formatPrice(event.priceCents)}
                </dd>
              </div>
            ) : null}
          </dl>

          <p className="mt-8 max-w-2xl text-base leading-relaxed font-light text-[color:var(--color-text-secondary)]">
            {event.description}
          </p>

          {event.dressCode ? (
            <p className="mt-6 text-sm text-[color:var(--color-text-secondary)] italic">
              Dress code:{" "}
              <span className="font-medium text-[color:var(--color-text-primary)] not-italic">
                {event.dressCode.replace(/-/g, " ")}
              </span>
            </p>
          ) : null}

          {event.rsvpDeadline ? (
            <p className="mt-2 text-sm text-[color:var(--color-text-muted)] italic">
              RSVP by {formatLongDate(event.rsvpDeadline)}
            </p>
          ) : null}
        </article>

        <aside>
          <Card variant="outlined" className="sticky top-24">
            <CardHeader>
              <p className="eyebrow">RSVP</p>
              <div className="mt-3 flex items-baseline justify-between gap-4">
                <span className="font-serif text-base text-[color:var(--color-text-emphasis)]">
                  {event.attendingCount} of {event.capacity}
                </span>
                <span className="text-xs text-[color:var(--color-text-muted)]">attending</span>
              </div>
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[color:var(--color-border-subtle)]">
                <div
                  className="h-full bg-[color:var(--color-accent)]"
                  style={{
                    width: `${Math.min(100, (event.attendingCount / event.capacity) * 100)}%`,
                  }}
                />
              </div>
            </CardHeader>
            <CardContent>
              {justRsvpd ? (
                <div className="mb-5 rounded-[var(--radius-sm)] border border-[color:var(--color-forest-soft)]/40 bg-[color:var(--color-forest-soft)]/10 p-4 text-sm text-[color:var(--color-text-primary)]">
                  RSVP saved. We'll see you there.
                </div>
              ) : null}
              {myRsvp && !justRsvpd ? (
                <div className="mb-5 text-sm text-[color:var(--color-text-secondary)]">
                  You're currently down as{" "}
                  <span className="font-medium text-[color:var(--color-text-primary)]">
                    {myRsvp.status}
                  </span>{" "}
                  for a party of {myRsvp.partySize}. You can update below.
                </div>
              ) : null}
              <RsvpForm eventId={event.id} currentRsvpStatus={myRsvp?.status} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </MemberShell>
  );
}
