import Link from "next/link";
import { requireCurrentMember } from "@/lib/session";
import { getAdapter } from "@/lib/adapter";
import { clubConfig } from "@/club.config";
import { MemberShell } from "@/components/layouts/MemberShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SmartImage } from "@/components/brand/SmartImage";
import { formatTime, todayISO, addDaysISO, formatLongDate } from "@/lib/format";
import { TeeTimeForm } from "./TeeTimeForm";

export const dynamic = "force-dynamic";

interface PageProps {
  readonly searchParams: Promise<{ date?: string; players?: string; time?: string }>;
}

export default async function GolfPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const member = await requireCurrentMember();
  const adapter = getAdapter();

  const today = todayISO();
  const date = sp.date ?? today;
  const players = Math.min(4, Math.max(1, Number(sp.players ?? 4) || 4)) as 1 | 2 | 3 | 4;
  const selectedTime = sp.time;

  const dates = [0, 1, 2, 3, 4, 5, 6].map((d) => addDaysISO(today, d));

  const slots = await adapter.listAvailableTeeTimes({ date, players });

  // Selected slot info (for the form on the right)
  const selectedSlot = selectedTime ? slots.find((s) => s.time === selectedTime) : undefined;

  return (
    <MemberShell member={member} current="golf">
      <header className="mb-12 grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <div>
          <p className="eyebrow">Golf</p>
          <h1 className="mt-3 font-serif text-4xl leading-[1.05] tracking-tight md:text-5xl">
            Book a tee time.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed font-light text-[color:var(--color-text-secondary)]">
            {clubConfig.golf.holes} holes · par {clubConfig.golf.par} · course rating{" "}
            {clubConfig.golf.courseRating}. {clubConfig.golf.architect}.
          </p>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] bg-[color:var(--color-surface-secondary)]">
          <SmartImage
            src={clubConfig.brand.photography.golf}
            alt={clubConfig.golf.name}
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover"
            fallbackLabel={clubConfig.golf.name}
          />
        </div>
      </header>

      {/* Date + party selector */}
      <section className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <div className="space-y-3">
          <p className="text-xs font-medium tracking-[var(--tracking-widest)] text-[color:var(--color-accent-deep)] uppercase">
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
                  href={`/golf?date=${d}&players=${players}`}
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
        </div>

        <div className="space-y-3">
          <p className="text-xs font-medium tracking-[var(--tracking-widest)] text-[color:var(--color-accent-deep)] uppercase">
            Players
          </p>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((p) => (
              <Link
                key={p}
                href={`/golf?date=${date}&players=${p}`}
                className={`flex h-12 w-12 items-center justify-center rounded-full border text-sm font-medium ${
                  p === players
                    ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent-pale)] text-[color:var(--color-accent-deep)]"
                    : "border-[color:var(--color-border-default)] bg-[color:var(--color-surface-primary)] text-[color:var(--color-text-primary)] hover:border-[color:var(--color-accent)]"
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
        {/* Available times grid */}
        <div>
          <h2 className="mb-4 font-serif text-2xl tracking-tight">{formatLongDate(date)}</h2>
          {slots.length === 0 ? (
            <Card variant="outlined">
              <CardContent className="py-12 text-center text-sm text-[color:var(--color-text-secondary)]">
                No available tee times for {players} player{players > 1 ? "s" : ""} on this date.
                Try a different day or party size.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5">
              {slots.map((slot) => {
                const active = slot.time === selectedTime;
                return (
                  <Link
                    key={slot.time}
                    href={`/golf?date=${date}&players=${players}&time=${encodeURIComponent(slot.time)}`}
                    className={`flex flex-col items-center justify-center gap-1 rounded-[var(--radius-sm)] border px-2 py-3 transition-all ${
                      active
                        ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent-pale)] text-[color:var(--color-accent-deep)]"
                        : "border-[color:var(--color-border-default)] bg-[color:var(--color-surface-primary)] text-[color:var(--color-text-primary)] hover:border-[color:var(--color-accent)]"
                    }`}
                  >
                    <span className="font-serif text-base">{formatTime(slot.time)}</span>
                    {slot.nineHoleOnly ? (
                      <Badge tone="warning" className="!text-[9px]">
                        9 only
                      </Badge>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected slot form */}
        <aside>
          {selectedSlot ? (
            <TeeTimeForm
              time={selectedSlot.time}
              displayTime={formatTime(selectedSlot.time)}
              displayDate={formatLongDate(selectedSlot.time)}
              maxPlayers={selectedSlot.maxPlayers}
              nineHoleOnly={selectedSlot.nineHoleOnly}
            />
          ) : (
            <Card variant="outlined">
              <CardContent className="space-y-3 py-12 text-center">
                <p className="font-serif text-lg text-[color:var(--color-text-secondary)]">
                  Select a tee time to continue
                </p>
                <p className="text-xs text-[color:var(--color-text-muted)]">
                  Tap a time on the left to begin booking.
                </p>
              </CardContent>
            </Card>
          )}
        </aside>
      </section>
    </MemberShell>
  );
}
