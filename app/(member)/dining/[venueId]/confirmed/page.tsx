import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCurrentMember } from "@/lib/session";
import { getAdapter } from "@/lib/adapter";
import { clubConfig } from "@/club.config";
import { MemberShell } from "@/components/layouts/MemberShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatLongDate, formatTime } from "@/lib/format";

export const dynamic = "force-dynamic";

interface PageProps {
  readonly params: Promise<{ venueId: string }>;
  readonly searchParams: Promise<{ id?: string }>;
}

export default async function Confirmed({ params, searchParams }: PageProps) {
  const { venueId } = await params;
  const { id } = await searchParams;
  if (!id) notFound();

  const member = await requireCurrentMember();
  const adapter = getAdapter();
  const reservation = await adapter.getReservation(id);
  if (!reservation) notFound();

  const venueName =
    clubConfig.diningVenues.find((v) => v.id === venueId)?.name ?? "the dining room";

  return (
    <MemberShell member={member} current="dining">
      <div className="mx-auto max-w-2xl py-12">
        <Card variant="outlined">
          <CardContent className="space-y-8 py-12 text-center">
            <Badge tone="forest" className="mx-auto">
              Reservation confirmed
            </Badge>
            <h1 className="font-serif text-4xl leading-tight tracking-tight md:text-5xl">
              We'll see you{" "}
              {formatLongDate(reservation.time).toLowerCase().replace("today", "this evening")}.
            </h1>
            <div className="mx-auto grid max-w-lg grid-cols-3 gap-6 border-y border-[color:var(--color-border-subtle)] py-8">
              <div>
                <div className="text-[10px] tracking-[var(--tracking-widest)] text-[color:var(--color-text-muted)] uppercase">
                  Venue
                </div>
                <div className="mt-2 font-serif text-base text-[color:var(--color-text-emphasis)]">
                  {venueName}
                </div>
              </div>
              <div>
                <div className="text-[10px] tracking-[var(--tracking-widest)] text-[color:var(--color-text-muted)] uppercase">
                  Time
                </div>
                <div className="mt-2 font-serif text-base text-[color:var(--color-text-emphasis)]">
                  {formatTime(reservation.time)}
                </div>
              </div>
              <div>
                <div className="text-[10px] tracking-[var(--tracking-widest)] text-[color:var(--color-text-muted)] uppercase">
                  Party
                </div>
                <div className="mt-2 font-serif text-base text-[color:var(--color-text-emphasis)]">
                  {reservation.partySize}
                </div>
              </div>
            </div>
            {reservation.occasion ? (
              <p className="text-sm text-[color:var(--color-text-secondary)] italic">
                The team has been notified — your {reservation.occasion} won't go unmarked.
              </p>
            ) : null}
            {member.dietaryPreferences.length > 0 ? (
              <div className="text-sm text-[color:var(--color-text-secondary)]">
                Dietary needs flagged for the kitchen:{" "}
                <span className="font-medium">
                  {member.dietaryPreferences.map((d) => d.replace(/-/g, " ")).join(", ")}
                </span>
              </div>
            ) : null}
            <div className="flex justify-center gap-4 pt-4">
              <Link
                href="/home"
                className="text-sm font-medium tracking-[0.04em] text-[color:var(--color-accent-deep)] hover:underline"
              >
                Back to home
              </Link>
              <span className="text-[color:var(--color-text-muted)]">·</span>
              <Link
                href="/dining"
                className="text-sm font-medium tracking-[0.04em] text-[color:var(--color-accent-deep)] hover:underline"
              >
                My reservations
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </MemberShell>
  );
}
