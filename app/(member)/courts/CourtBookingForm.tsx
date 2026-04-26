"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { bookCourt, type BookCourtState } from "./actions";

interface CourtBookingFormProps {
  readonly slots: ReadonlyArray<{
    readonly courtId: string;
    readonly time: string;
    readonly displayTime: string;
    readonly courtNumber: number;
  }>;
  readonly courtType: string;
}

const initial: BookCourtState = { status: "idle" };

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="accent"
      size="lg"
      className="w-full"
      disabled={disabled || pending}
    >
      {pending ? "Reserving…" : "Confirm court"}
    </Button>
  );
}

export function CourtBookingForm({ slots, courtType }: CourtBookingFormProps) {
  const [state, action] = useActionState(bookCourt, initial);
  const [duration, setDuration] = useState<number>(60);
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [guestNames, setGuestNames] = useState<string>("");

  const selected = slots.find((s) => `${s.courtId}__${s.time}` === selectedKey);

  // Group by hour for a tidy layout
  type Slot = (typeof slots)[number];
  const grouped = new Map<string, Slot[]>();
  for (const s of slots) {
    const list = grouped.get(s.displayTime) ?? [];
    list.push(s);
    grouped.set(s.displayTime, list);
  }

  return (
    <form action={action} className="space-y-8">
      {selected ? (
        <>
          <input type="hidden" name="courtId" value={selected.courtId} />
          <input type="hidden" name="time" value={selected.time} />
        </>
      ) : null}
      <input type="hidden" name="durationMinutes" value={duration} />

      <fieldset className="space-y-3">
        <legend className="text-xs font-medium tracking-[var(--tracking-widest)] text-[color:var(--color-accent-deep)] uppercase">
          Length
        </legend>
        <div className="flex gap-2">
          {[30, 60, 90, 120].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDuration(d)}
              className={cn(
                "h-12 flex-1 rounded-[var(--radius-sm)] border text-sm font-medium",
                duration === d
                  ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent-pale)] text-[color:var(--color-accent-deep)]"
                  : "border-[color:var(--color-border-default)] bg-[color:var(--color-surface-primary)] text-[color:var(--color-text-primary)] hover:border-[color:var(--color-accent)]",
              )}
            >
              {d} min
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-xs font-medium tracking-[var(--tracking-widest)] text-[color:var(--color-accent-deep)] uppercase">
          Court & time
        </legend>
        <div className="space-y-3">
          {[...grouped.entries()].map(([hour, courts]) => (
            <div key={hour} className="grid grid-cols-[80px_1fr] items-center gap-3">
              <span className="font-serif text-base text-[color:var(--color-text-primary)]">
                {hour}
              </span>
              <div className="flex flex-wrap gap-2">
                {courts.map((c) => {
                  const key = `${c.courtId}__${c.time}`;
                  const active = selectedKey === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedKey(key)}
                      className={cn(
                        "h-10 min-w-[68px] rounded-[var(--radius-sm)] border px-3 text-xs font-medium",
                        active
                          ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent-pale)] text-[color:var(--color-accent-deep)]"
                          : "border-[color:var(--color-border-default)] bg-[color:var(--color-surface-primary)] text-[color:var(--color-text-secondary)] hover:border-[color:var(--color-accent)]",
                      )}
                    >
                      Court {c.courtNumber}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-xs font-medium tracking-[var(--tracking-widest)] text-[color:var(--color-accent-deep)] uppercase">
          Guests{" "}
          <span className="ml-1 tracking-normal text-[color:var(--color-text-muted)] normal-case">
            — optional
          </span>
        </legend>
        <textarea
          name="guestNames"
          value={guestNames}
          onChange={(e) => setGuestNames(e.target.value)}
          rows={2}
          placeholder="One name per line"
          className="block w-full resize-none rounded-[var(--radius-sm)] border border-[color:var(--color-border-default)] bg-[color:var(--color-surface-primary)] p-4 font-serif text-base text-[color:var(--color-text-emphasis)] placeholder:font-sans placeholder:text-sm placeholder:text-[color:var(--color-text-muted)] focus:border-[color:var(--color-accent)] focus:outline-none"
        />
      </fieldset>

      <SubmitButton disabled={!selected} />
      {!selected ? (
        <p className="text-center text-xs text-[color:var(--color-text-muted)]">
          Select a {courtType.replace(/-/g, " ")} court above to continue.
        </p>
      ) : null}
      {state.status === "error" ? (
        <p className="text-center text-sm text-[color:var(--color-status-danger)]">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
