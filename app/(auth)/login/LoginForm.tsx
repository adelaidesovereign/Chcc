"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendMagicLink, type SignInState } from "./actions";

const initialState: SignInState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="accent" size="lg" className="w-full" disabled={pending}>
      {pending ? "Sending…" : "Send Sign-in Link"}
    </Button>
  );
}

export function LoginForm() {
  const [state, action] = useActionState(sendMagicLink, initialState);

  return (
    <form action={action} className="space-y-10" noValidate>
      <div className="space-y-3">
        <Label htmlFor="email">Member Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          autoFocus
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
  );
}
