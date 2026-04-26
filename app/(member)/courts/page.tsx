import Link from "next/link";
import { requireCurrentMember } from "@/lib/session";
import { getAdapter } from "@/lib/adapter";
import { clubConfig } from "@/club.config";
import { MemberShell } from "@/components/layouts/MemberShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SmartImage } from "@/components/brand/SmartImage";
import { formatLongDate, formatTime, todayISO, addDaysISO } from "@/lib/format";
import { CourtBookingForm } from "./CourtBookingForm";
import type { CourtType } from "@/lib/adapter/types";

export const dynamic = "force-dynamic";

interface PageProps {
  readonly searchParams: Promise<{
    type?: CourtType;
    date?: string;
    confirmed?: string;
  }>;
}

const COURT_TYPES_LABEL: Record<CourtType, string> = {
  tennis: "Tennis",
  pickleball: "Pickleball",
  platform: "Platform",
  squash: "Squash",
  padel: "Padel",
};

export default async function CourtsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const member = await requireCurrentMember();
  const adapter = getAdapter();

  const today = todayISO();
  const date = sp.date ?? today;
  const facilities = clubConfig.courts;
  const defaultType = facilities[0]?.type ?? "tennis";
  const type: CourtType = sp.type ?? defaultType;
  const confirmed = sp.confirmed === "1";

  const dates = [0, 1, 2, 3, 4, 5, 6].map((d) => addDaysISO(today, d));

  const slots = await adapter.listAvailableCourts({
    type,
    date,
    durationMinutes: 60,
  });

  return (
    <MemberShell member={member} current="courts">
      <header className="mb-12 grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <div>
          <p className="eyebrow">Racquets</p>
          <h1 className="mt-3 font-serif text-4xl leading-[1.05] tracking-tight md:text-5xl">
            Reserve a court.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed font-light text-[color:var(--color-text-secondary)]">
            {facilities
              .map((f) => `${f.count} ${COURT_TYPES_LABEL[f.type].toLowerCase()}`)
              .join(" · ")}
          </p>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] bg-[color:var(--color-surface-secondary)]">
          <SmartImage
            src={clubConfig.brand.photography.courts}
            alt="Courts"
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover"
            fallbackLabel="Courts"
          />
        </div>
      </header>

      {confirmed ? (
        <Card
          variant="outlined"
          className="mb-8 border-[color:var(--color-forest-soft)]/40 bg-[color:var(--color-forest-soft)]/10"
        >
          <CardContent className="flex items-center gap-4 py-5">
            <Badge tone="forest">Confirmed</Badge>
            <p className="text-sm text-[color:var(--color-text-primary)]">
              Your court is booked. We'll see you on the courts.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {/* Type selector */}
      <section className="mb-10 flex flex-wrap gap-2">
        {facilities.map((f) => (
          <Link
            key={f.type}
            href={`/courts?type=${f.type}&date=${date}`}
            className={`rounded-[var(--radius-pill)] border px-5 py-3 text-sm font-medium tracking-[0.04em] ${
              f.type === type
                ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent-pale)] text-[color:var(--color-accent-deep)]"
                : "border-[color:var(--color-border-default)] bg-[color:var(--color-surface-primary)] text-[color:var(--color-text-secondary)] hover:border-[color:var(--color-accent)]"
            }`}
          >
            {COURT_TYPES_LABEL[f.type]} · {f.count}
          </Link>
        ))}
      </section>

      {/* Date selector */}
      <section className="mb-10">
        <p className="mb-3 text-xs font-medium tracking-[var(--tracking-widest)] text-[color:var(--color-accent-deep)] uppercase">
          Day
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
                href={`/courts?type=${type}&date=${d}`}
                className={`flex h-20 w-16 flex-shrink-0 flex-col items-center justify-center gap-1 rounded-[var(--radius-sm)] border ${
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
      </section>

      <section>
        <h2 className="mb-6 font-serif text-2xl tracking-tight">
          {COURT_TYPES_LABEL[type]} · {formatLongDate(date)}
        </h2>
        {slots.length === 0 ? (
          <Card variant="outlined">
            <CardContent className="py-12 text-center text-sm text-[color:var(--color-text-secondary)]">
              No {COURT_TYPES_LABEL[type].toLowerCase()} courts available on this date.
            </CardContent>
          </Card>
        ) : (
          <CourtBookingForm
            courtType={type}
            slots={slots.map((s) => ({
              courtId: s.courtId,
              time: s.time,
              displayTime: formatTime(s.time),
              courtNumber: Number(s.courtId.split("-").pop() ?? 1),
            }))}
          />
        )}
      </section>
    </MemberShell>
  );
}
