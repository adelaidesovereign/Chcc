"use server";

import { z } from "zod";
import { requireCurrentMember } from "@/lib/session";
import { runConcierge, type ConciergeMessage } from "@/lib/concierge/run";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

const inputSchema = z.object({
  history: z.array(messageSchema).max(20),
  message: z.string().min(1).max(2000),
});

export interface AskState {
  readonly status: "idle" | "ok" | "error";
  readonly history: ReadonlyArray<ConciergeMessage>;
  readonly source?: "anthropic" | "fallback";
  readonly error?: string;
}

export async function ask(prev: AskState, formData: FormData): Promise<AskState> {
  const member = await requireCurrentMember();
  const message = String(formData.get("message") ?? "").trim();
  if (!message) return prev;

  const parsed = inputSchema.safeParse({
    history: prev.history,
    message,
  });
  if (!parsed.success) {
    return { ...prev, status: "error", error: "Message is too long." };
  }

  const newHistory: ConciergeMessage[] = [
    ...parsed.data.history,
    { role: "user", content: message },
  ];

  try {
    const { reply, source } = await runConcierge(newHistory, member);
    return {
      status: "ok",
      history: [...newHistory, { role: "assistant", content: reply }],
      source,
    };
  } catch (err) {
    return {
      ...prev,
      history: newHistory,
      status: "error",
      error: err instanceof Error ? err.message : "Concierge error",
    };
  }
}
