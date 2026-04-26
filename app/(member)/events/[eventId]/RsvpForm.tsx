"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { rsvpToEvent, type RsvpState } from "./actions";

interface RsvpFormProps {
  readonly eventId: string;
  readonly currentRsvpStatus?: "attending" | "tentative" | "declined" | "waitlist";
}

const initial: RsvpState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="accent" size="lg" className="w-full" disabled={pending}>
      {pending ? "Saving…" : "Confirm RSVP"}
    </Button>
  );
}

export function RsvpForm({ eventId, currentRsvpStatus }: RsvpFormProps) {
  const [state, action] = useActionState(rsvpToEvent, initial);
  const [status, setStatus] = useState<"attending" | "tentative" | "declined">(
    currentRsvpStatus === "declined" || currentRsvpStatus === "tentative"
      ? currentRsvpStatus
      : "attending",
  );
  const [partySize, setPartySize] = useState<number>(2);
  const [guestNames, setGuestNames] = useState<string>("");

  const showParty = status === "attending" || status === "tentative";

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="eventId" value={eventId} />
      <input type="hidden" name="status" value={status} />

      <fieldset className="space-y-3">
        <legend className="text-xs font-medium tracking-[var(--tracking-widest)] text-[color:var(--color-accent-deep)] uppercase">
          Will you join us?
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { v: "attending", label: "Yes" },
              { v: "tentative", label: "Maybe" },
              { v: "declined", label: "No" },
            ] as const
          ).map((o) => (
            <button
              key={o.v}
              type="button"
              onClick={() => setStatus(o.v)}
              className={cn(
                "h-12 rounded-[var(--radius-sm)] border text-sm font-medium",
                status === o.v
                  ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent-pale)] text-[color:var(--color-accent-deep)]"
                  : "border-[color:var(--color-border-default)] bg-[color:var(--color-surface-primary)] text-[color:var(--color-text-primary)] hover:border-[color:var(--color-accent)]",
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </fieldset>

      {showParty ? (
        <>
          <fieldset className="space-y-3">
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

          {partySize > 1 ? (
            <fieldset className="space-y-3">
              <legend className="text-xs font-medium tracking-[var(--tracking-widest)] text-[color:var(--color-accent-deep)] uppercase">
                Guest names{" "}
                <span className="ml-1 tracking-normal text-[color:var(--color-text-muted)] normal-case">
                  — optional
                </span>
              </legend>
              <textarea
                name="guestNames"
                value={guestNames}
                onChange={(e) => setGuestNames(e.target.value)}
                rows={Math.max(1, Math.min(3, partySize - 1))}
                placeholder="One name per line"
                className="block w-full resize-none rounded-[var(--radius-sm)] border border-[color:var(--color-border-default)] bg-[color:var(--color-surface-primary)] p-4 font-serif text-base text-[color:var(--color-text-emphasis)] placeholder:font-sans placeholder:text-sm placeholder:text-[color:var(--color-text-muted)] focus:border-[color:var(--color-accent)] focus:outline-none"
              />
            </fieldset>
          ) : null}
        </>
      ) : (
        <input type="hidden" name="partySize" value="1" />
      )}

      <SubmitButton />

      {state.status === "error" ? (
        <p className="text-center text-sm text-[color:var(--color-status-danger)]">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
