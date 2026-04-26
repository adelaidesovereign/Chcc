import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCurrentMember } from "@/lib/session";
import { getAdapter } from "@/lib/adapter";
import { MemberShell } from "@/components/layouts/MemberShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatLongDate, formatTime } from "@/lib/format";

export const dynamic = "force-dynamic";

interface PageProps {
  readonly searchParams: Promise<{ id?: string }>;
}

export default async function GolfConfirmed({ searchParams }: PageProps) {
  const { id } = await searchParams;
  if (!id) notFound();

  const member = await requireCurrentMember();
  const adapter = getAdapter();
  const teeTime = await adapter.getTeeTime(id);
  if (!teeTime) notFound();

  return (
    <MemberShell member={member} current="golf">
      <div className="mx-auto max-w-2xl py-12">
        <Card variant="outlined">
          <CardContent className="space-y-8 py-12 text-center">
            <Badge tone="forest" className="mx-auto">
              Tee time confirmed
            </Badge>
            <h1 className="font-serif text-4xl leading-tight tracking-tight md:text-5xl">
              {formatTime(teeTime.time)} · {formatLongDate(teeTime.time)}
            </h1>
            <div className="mx-auto grid max-w-lg grid-cols-3 gap-6 border-y border-[color:var(--color-border-subtle)] py-8">
              <div>
                <div className="text-[10px] tracking-[var(--tracking-widest)] text-[color:var(--color-text-muted)] uppercase">
                  Players
                </div>
                <div className="mt-2 font-serif text-base text-[color:var(--color-text-emphasis)]">
                  {teeTime.playerMemberIds.length + teeTime.guestNames.length}
                </div>
              </div>
              <div>
                <div className="text-[10px] tracking-[var(--tracking-widest)] text-[color:var(--color-text-muted)] uppercase">
                  Carts
                </div>
                <div className="mt-2 font-serif text-base text-[color:var(--color-text-emphasis)]">
                  {teeTime.cartCount === 0 ? "Walking" : teeTime.cartCount}
                </div>
              </div>
              <div>
                <div className="text-[10px] tracking-[var(--tracking-widest)] text-[color:var(--color-text-muted)] uppercase">
                  Round
                </div>
                <div className="mt-2 font-serif text-base text-[color:var(--color-text-emphasis)]">
                  {teeTime.nineHoleOnly ? "9 holes" : "18 holes"}
                </div>
              </div>
            </div>
            {teeTime.guestNames.length > 0 ? (
              <p className="text-sm text-[color:var(--color-text-secondary)]">
                Guests: {teeTime.guestNames.join(", ")}
              </p>
            ) : null}
            <div className="flex justify-center gap-4 pt-4">
              <Link
                href="/home"
                className="text-sm font-medium text-[color:var(--color-accent-deep)] hover:underline"
              >
                Back to home
              </Link>
              <span className="text-[color:var(--color-text-muted)]">·</span>
              <Link
                href="/golf"
                className="text-sm font-medium text-[color:var(--color-accent-deep)] hover:underline"
              >
                Book another
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </MemberShell>
  );
}
