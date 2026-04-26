"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { bookTeeTime, type BookTeeTimeState } from "./actions";

interface TeeTimeFormProps {
  readonly time: string;
  readonly displayTime: string;
  readonly displayDate: string;
  readonly maxPlayers: number;
  readonly nineHoleOnly: boolean;
}

const initial: BookTeeTimeState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="accent" size="lg" className="w-full" disabled={pending}>
      {pending ? "Reserving…" : "Confirm tee time"}
    </Button>
  );
}

export function TeeTimeForm({
  time,
  displayTime,
  displayDate,
  maxPlayers,
  nineHoleOnly,
}: TeeTimeFormProps) {
  const [state, action] = useActionState(bookTeeTime, initial);
  const [cartCount, setCartCount] = useState<number>(1);
  const [guestNames, setGuestNames] = useState<string>("");

  const guestRows = Math.max(1, Math.min(3, maxPlayers - 1));

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="time" value={time} />
      {nineHoleOnly ? <input type="hidden" name="nineHoleOnly" value="true" /> : null}

      <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border-default)] bg-[color:var(--color-surface-primary)] p-6">
        <div className="text-[10px] tracking-[var(--tracking-widest)] text-[color:var(--color-accent-deep)] uppercase">
          Selected
        </div>
        <div className="mt-2 font-serif text-3xl text-[color:var(--color-text-emphasis)]">
          {displayTime}
        </div>
        <div className="mt-1 text-sm text-[color:var(--color-text-secondary)]">
          {displayDate} · up to {maxPlayers} players
          {nineHoleOnly ? " · 9 holes only" : ""}
        </div>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-xs font-medium tracking-[var(--tracking-widest)] text-[color:var(--color-accent-deep)] uppercase">
          Carts
        </legend>
        <div className="flex gap-2">
          {[0, 1, 2].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setCartCount(n)}
              className={cn(
                "h-12 flex-1 rounded-[var(--radius-sm)] border text-sm font-medium tracking-[0.04em]",
                cartCount === n
                  ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent-pale)] text-[color:var(--color-accent-deep)]"
                  : "border-[color:var(--color-border-default)] bg-[color:var(--color-surface-primary)] text-[color:var(--color-text-primary)] hover:border-[color:var(--color-accent)]",
              )}
            >
              {n === 0 ? "Walking" : `${n} cart${n > 1 ? "s" : ""}`}
            </button>
          ))}
          <input type="hidden" name="cartCount" value={cartCount} />
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-xs font-medium tracking-[var(--tracking-widest)] text-[color:var(--color-accent-deep)] uppercase">
          Guests{" "}
          <span className="ml-1 tracking-normal text-[color:var(--color-text-muted)] normal-case">
            — one name per line, optional
          </span>
        </legend>
        <textarea
          name="guestNames"
          value={guestNames}
          onChange={(e) => setGuestNames(e.target.value)}
          rows={guestRows}
          placeholder={"e.g.\nJohn Pemberton\nWilliam Sterling"}
          className="block w-full resize-none rounded-[var(--radius-sm)] border border-[color:var(--color-border-default)] bg-[color:var(--color-surface-primary)] p-4 font-serif text-base text-[color:var(--color-text-emphasis)] placeholder:font-sans placeholder:text-sm placeholder:text-[color:var(--color-text-muted)] focus:border-[color:var(--color-accent)] focus:outline-none"
        />
      </fieldset>

      <SubmitButton />

      {state.status === "error" ? (
        <p className="text-center text-sm text-[color:var(--color-status-danger)]">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
