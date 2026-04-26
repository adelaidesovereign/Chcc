"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ask, type AskState } from "./actions";
import type { ConciergeMessage } from "@/lib/concierge/run";

const initial: AskState = { status: "idle", history: [] };

interface ConciergeChatProps {
  readonly memberFirstName: string;
  readonly suggestions: ReadonlyArray<string>;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="accent" size="md" disabled={pending} className="px-6">
      {pending ? "…" : "Ask"}
    </Button>
  );
}

export function ConciergeChat({ memberFirstName, suggestions }: ConciergeChatProps) {
  const [state, action] = useActionState(ask, initial);
  const formRef = useRef<HTMLFormElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset the message field after each successful turn
  useEffect(() => {
    if (state.status === "ok") {
      formRef.current?.reset();
    }
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [state]);

  const send = (message: string) => {
    const fd = new FormData();
    fd.set("message", message);
    action(fd);
  };

  return (
    <div className="flex h-[calc(100dvh-280px)] min-h-[500px] flex-col rounded-[var(--radius-lg)] border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-primary)]">
      {/* Conversation */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 md:px-10">
        {state.history.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-8 text-center">
            <div className="space-y-3">
              <p className="eyebrow">The Concierge</p>
              <h2 className="font-serif text-3xl tracking-tight md:text-4xl">
                How may I help, {memberFirstName}?
              </h2>
              <p className="max-w-md text-sm leading-relaxed text-[color:var(--color-text-secondary)]">
                Reservations, tee times, menus, events — ask anything you'd ask the front desk.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-[var(--radius-pill)] border border-[color:var(--color-border-default)] bg-[color:var(--color-surface-canvas)] px-4 py-2 text-xs font-medium tracking-[0.04em] text-[color:var(--color-text-primary)] transition-colors hover:border-[color:var(--color-accent)] hover:bg-[color:var(--color-accent-pale)]/30"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ul className="space-y-6">
            {state.history.map((m, i) => (
              <MessageBubble key={i} message={m} />
            ))}
            <PendingBubble />
          </ul>
        )}
      </div>

      {state.source === "fallback" && state.history.length > 0 ? (
        <div className="border-t border-[color:var(--color-border-subtle)] bg-[color:var(--color-accent-pale)]/30 px-6 py-2 text-center text-[11px] text-[color:var(--color-accent-deep)]">
          Demo mode — set <code className="font-mono">ANTHROPIC_API_KEY</code> to enable the live
          concierge.
        </div>
      ) : null}

      {/* Input */}
      <form
        ref={formRef}
        action={action}
        className="flex items-center gap-3 border-t border-[color:var(--color-border-subtle)] p-4"
      >
        <input type="hidden" name="history" value={JSON.stringify(state.history)} />
        <input
          name="message"
          autoComplete="off"
          required
          maxLength={2000}
          placeholder="Ask the concierge…"
          className="flex-1 bg-transparent px-3 py-3 font-serif text-base text-[color:var(--color-text-emphasis)] placeholder:font-sans placeholder:text-sm placeholder:text-[color:var(--color-text-muted)] focus:outline-none"
        />
        <SubmitButton />
      </form>
    </div>
  );
}

function MessageBubble({ message }: { message: ConciergeMessage }) {
  const isUser = message.role === "user";
  return (
    <li className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={`max-w-[85%] rounded-[var(--radius-lg)] px-5 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-[color:var(--color-text-emphasis)] text-[color:var(--color-surface-canvas)]"
            : "border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-canvas)] text-[color:var(--color-text-primary)]"
        }`}
      >
        {message.content.split("\n").map((line, i) => (
          <p key={i} className={i > 0 ? "mt-2" : ""}>
            {line}
          </p>
        ))}
      </motion.div>
    </li>
  );
}

function PendingBubble() {
  const { pending } = useFormStatus();
  return (
    <AnimatePresence>
      {pending ? (
        <motion.li
          key="pending"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex justify-start"
        >
          <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-canvas)] px-5 py-3">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="block size-1.5 rounded-full bg-[color:var(--color-accent)]"
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </div>
        </motion.li>
      ) : null}
    </AnimatePresence>
  );
}
