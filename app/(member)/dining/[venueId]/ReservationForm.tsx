"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { bookReservation, type BookReservationState } from "./actions";

interface ReservationFormProps {
  readonly venueId: string;
  readonly venueName: string;
  readonly availableTimes: ReadonlyArray<{ time: string; label: string }>;
  readonly memberDietaryPreferences: ReadonlyArray<string>;
}

const initial: BookReservationState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="accent" size="lg" className="w-full" disabled={pending}>
      {pending ? "Reserving…" : "Confirm reservation"}
    </Button>
  );
}

export function ReservationForm({
  venueId,
  venueName,
  availableTimes,
  memberDietaryPreferences,
}: ReservationFormProps) {
  const [state, action] = useActionState(bookReservation, initial);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [partySize, setPartySize] = useState<number>(2);
  const [occasion, setOccasion] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="venueId" value={venueId} />
      <input type="hidden" name="time" value={selectedTime} />

      {/* Time slots */}
      <fieldset className="space-y-4">
        <legend className="text-xs font-medium tracking-[var(--tracking-widest)] text-[color:var(--color-accent-deep)] uppercase">
          Choose a time
        </legend>
        {availableTimes.length === 0 ? (
          <p className="text-sm text-[color:var(--color-text-secondary)]">
            {venueName} isn't taking reservations on this date.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {availableTimes.map((t) => (
              <button
                key={t.time}
                type="button"
                onClick={() => setSelectedTime(t.time)}
                className={cn(
                  "h-12 rounded-[var(--radius-sm)] border text-sm font-medium tracking-[0.04em] transition-all",
                  selectedTime === t.time
                    ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent-pale)] text-[color:var(--color-accent-deep)]"
                    : "border-[color:var(--color-border-default)] bg-[color:var(--color-surface-primary)] text-[color:var(--color-text-primary)] hover:border-[color:var(--color-accent)] hover:bg-[color:var(--color-accent-pale)]/40",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </fieldset>

      {/* Party size */}
      <fieldset className="space-y-4">
        <legend className="text-xs font-medium tracking-[var(--tracking-widest)] text-[color:var(--color-accent-deep)] uppercase">
          Party size
        </legend>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6, 8].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPartySize(n)}
              className={cn(
                "h-12 w-12 rounded-full border text-sm font-medium",
                partySize === n
                  ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent-pale)] text-[color:var(--color-accent-deep)]"
                  : "border-[color:var(--color-border-default)] bg-[color:var(--color-surface-primary)] text-[color:var(--color-text-primary)] hover:border-[color:var(--color-accent)]",
              )}
            >
              {n}
            </button>
          ))}
          <input type="hidden" name="partySize" value={partySize} />
        </div>
      </fieldset>

      {/* Occasion (optional) */}
      <fieldset className="space-y-4">
        <legend className="text-xs font-medium tracking-[var(--tracking-widest)] text-[color:var(--color-accent-deep)] uppercase">
          Occasion{" "}
          <span className="ml-1 tracking-normal text-[color:var(--color-text-muted)] normal-case">
            — optional
          </span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {[
            { v: "", label: "None" },
            { v: "anniversary", label: "Anniversary" },
            { v: "birthday", label: "Birthday" },
            { v: "business", label: "Business" },
            { v: "other", label: "Other" },
          ].map((o) => (
            <button
              key={o.v || "none"}
              type="button"
              onClick={() => setOccasion(o.v)}
              className={cn(
                "rounded-[var(--radius-pill)] border px-4 py-2 text-xs font-medium tracking-[var(--tracking-widest)] uppercase transition-colors",
                occasion === o.v
                  ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent-pale)] text-[color:var(--color-accent-deep)]"
                  : "border-[color:var(--color-border-default)] bg-[color:var(--color-surface-primary)] text-[color:var(--color-text-secondary)] hover:border-[color:var(--color-accent)]",
              )}
            >
              {o.label}
            </button>
          ))}
          <input type="hidden" name="occasion" value={occasion} />
        </div>
      </fieldset>

      {/* Notes */}
      <fieldset className="space-y-3">
        <legend className="text-xs font-medium tracking-[var(--tracking-widest)] text-[color:var(--color-accent-deep)] uppercase">
          Note for the maître d'{" "}
          <span className="ml-1 tracking-normal text-[color:var(--color-text-muted)] normal-case">
            — optional
          </span>
        </legend>
        <textarea
          name="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Window table, accessibility needs, surprises…"
          className="block w-full resize-none rounded-[var(--radius-sm)] border border-[color:var(--color-border-default)] bg-[color:var(--color-surface-primary)] p-4 font-serif text-base text-[color:var(--color-text-emphasis)] placeholder:font-sans placeholder:text-sm placeholder:text-[color:var(--color-text-muted)] focus:border-[color:var(--color-accent)] focus:outline-none"
        />
      </fieldset>

      {/* Dietary auto-flag */}
      {memberDietaryPreferences.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-[var(--radius-sm)] border border-[color:var(--color-accent-pale)] bg-[color:var(--color-accent-pale)]/30 p-4">
          <span className="text-xs text-[color:var(--color-accent-deep)]">
            Dietary needs the kitchen will see:
          </span>
          {memberDietaryPreferences.map((d) => (
            <Badge key={d} tone="warning">
              {d.replace(/-/g, " ")}
            </Badge>
          ))}
        </div>
      ) : null}

      <SubmitButton />

      {state.status === "error" ? (
        <p className="text-center text-sm text-[color:var(--color-status-danger)]">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
