"use client";

import { useActionState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendMagicLink, signInAsDemo, type SignInState } from "./actions";

const initialState: SignInState = { status: "idle" };

interface LoginFormProps {
  readonly demoMembers: ReadonlyArray<{
    readonly id: string;
    readonly displayName: string;
    readonly tier: string;
    readonly hint: string;
  }>;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="accent" size="lg" className="w-full" disabled={pending}>
      {pending ? "Sending…" : "Send Sign-in Link"}
    </Button>
  );
}

export function LoginForm({ demoMembers }: LoginFormProps) {
  const [state, action] = useActionState(sendMagicLink, initialState);
  const [isPending, startTransition] = useTransition();

  const handleDemoSignIn = (memberId: string) => {
    startTransition(async () => {
      await signInAsDemo(memberId);
    });
  };

  return (
    <div className="space-y-12">
      <form action={action} className="space-y-10" noValidate>
        <div className="space-y-3">
          <Label htmlFor="email">Member Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@chapelhillcc.com"
            aria-describedby="login-status"
            defaultValue={state.email}
          />
        </div>

        <SubmitButton />

        <AnimatePresence mode="wait">
          {state.status !== "idle" ? (
            <motion.p
              key={state.status}
              id="login-status"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="text-center text-sm leading-relaxed font-light text-[color:var(--color-text-secondary)]"
            >
              {state.message}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </form>

      {demoMembers.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <hr className="flex-1 border-[color:var(--color-border-default)]" />
            <span className="text-xs tracking-[var(--tracking-widest)] text-[color:var(--color-text-muted)] uppercase">
              or try the demo
            </span>
            <hr className="flex-1 border-[color:var(--color-border-default)]" />
          </div>
          <ul className="space-y-2">
            {demoMembers.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => handleDemoSignIn(m.id)}
                  disabled={isPending}
                  className="group flex w-full items-center justify-between gap-4 border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-primary)] px-5 py-4 text-left transition-all duration-[var(--duration-quick)] hover:border-[color:var(--color-accent)] hover:bg-[color:var(--color-accent-pale)]/40 disabled:opacity-50"
                >
                  <div className="min-w-0">
                    <div className="font-serif text-base text-[color:var(--color-text-emphasis)]">
                      {m.displayName}
                    </div>
                    <div className="text-xs text-[color:var(--color-text-muted)]">{m.hint}</div>
                  </div>
                  <span className="font-sans text-[10px] tracking-[var(--tracking-widest)] text-[color:var(--color-accent-deep)] uppercase transition-transform group-hover:translate-x-1">
                    Sign in →
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="text-[11px] leading-relaxed text-[color:var(--color-text-muted)]">
            Demo accounts are sample data only. Real members sign in with the email link above.
          </p>
        </div>
      ) : null}
    </div>
  );
}
