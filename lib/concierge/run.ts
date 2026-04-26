import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { conciergeTools, executeTool } from "./tools";
import { clubConfig } from "@/club.config";
import type { Member } from "@/lib/adapter/types";
import { todayISO } from "@/lib/format";

const MODEL = "claude-sonnet-4-5";
const MAX_TURNS = 5; // tool-use loop ceiling
const MAX_TOKENS = 1024;

export interface ConciergeMessage {
  readonly role: "user" | "assistant";
  readonly content: string;
}

interface RunResult {
  readonly reply: string;
  readonly toolsCalled: ReadonlyArray<string>;
  readonly source: "anthropic" | "fallback";
}

/**
 * Runs a concierge turn.
 *
 * If ANTHROPIC_API_KEY is set, uses Claude with tool use grounded in
 * the adapter. Otherwise falls back to a deterministic intent-matched
 * response so the demo still feels responsive.
 */
export async function runConcierge(
  history: ReadonlyArray<ConciergeMessage>,
  member: Member,
): Promise<RunResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    const lastUser = [...history].reverse().find((m) => m.role === "user")?.content ?? "";
    return { reply: fallbackReply(lastUser, member), toolsCalled: [], source: "fallback" };
  }

  const client = new Anthropic({ apiKey });

  const systemPrompt = buildSystemPrompt(member);
  const messages: Anthropic.MessageParam[] = history.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const toolsCalled: string[] = [];

  for (let turn = 0; turn < MAX_TURNS; turn += 1) {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      tools: conciergeTools,
      messages,
    });

    // Stop when no tool is requested
    if (response.stop_reason !== "tool_use") {
      const textBlocks = response.content.filter(
        (b): b is Extract<Anthropic.ContentBlock, { type: "text" }> => b.type === "text",
      );
      const reply = textBlocks
        .map((b) => b.text)
        .join("\n")
        .trim();
      return {
        reply: reply || "I'm here. How can I help?",
        toolsCalled,
        source: "anthropic",
      };
    }

    // Resolve every tool_use block before continuing the loop
    const toolUses = response.content.filter(
      (b): b is Extract<Anthropic.ContentBlock, { type: "tool_use" }> => b.type === "tool_use",
    );

    messages.push({ role: "assistant", content: response.content });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const tu of toolUses) {
      toolsCalled.push(tu.name);
      try {
        const result = await executeTool(tu.name, tu.input, member);
        toolResults.push({
          type: "tool_result",
          tool_use_id: tu.id,
          content: result,
        });
      } catch (err) {
        toolResults.push({
          type: "tool_result",
          tool_use_id: tu.id,
          content: `Error: ${err instanceof Error ? err.message : "unknown"}`,
          is_error: true,
        });
      }
    }
    messages.push({ role: "user", content: toolResults });
  }

  return {
    reply:
      "I needed too many lookups to answer that one — let me try again with a simpler question?",
    toolsCalled,
    source: "anthropic",
  };
}

function buildSystemPrompt(member: Member): string {
  const display = member.preferredName ?? member.firstName;
  const dietary = member.dietaryPreferences.length
    ? `The member has noted these dietary preferences: ${member.dietaryPreferences.join(", ")}. Take them into account when discussing dining.`
    : "";
  const anniversary = member.anniversaryDate
    ? `The member's wedding anniversary is ${member.anniversaryDate}. If they're booking around that date, consider mentioning it warmly.`
    : "";

  return [
    `You are the Chapel Hill Country Club concierge — the digital equivalent of a long-tenured maître d' who knows the membership.`,
    `Today is ${todayISO()} in ${clubConfig.location.timezone}. The club is ${clubConfig.name}, established ${clubConfig.foundingYear}, in ${clubConfig.location.city}, ${clubConfig.location.state}.`,
    ``,
    `You are speaking with ${display} (member ${member.memberNumber}, ${member.tier} member).`,
    dietary,
    anniversary,
    ``,
    `Voice: warm, concise, and unflappable. Editorial — never breezy. Refer to the member by their preferred first name when natural. Never say "I'm an AI". Address the member as the club would: politely, with discretion.`,
    ``,
    `Operating rules:`,
    `- Always use tools to ground your answers. Never guess about availability, menus, events, or member data.`,
    `- When the member uses relative dates ("tomorrow", "next Saturday"), resolve them yourself before calling tools — today is ${todayISO()}.`,
    `- For dining or tee times, surface 2-4 specific options rather than dumping a long list.`,
    `- If a question requires booking, describe what you'd reserve and tell them which page to confirm on (e.g. /dining/main-dining, /golf, /events). Do not pretend to book on their behalf.`,
    `- If the member asks something the club can't help with, say so kindly and suggest who can.`,
    `- If a tool returns nothing, say so plainly — don't invent options.`,
    `- Keep replies under 120 words unless they ask for detail.`,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Pattern-matched offline reply. Used when no API key is configured —
 * keeps the demo from showing a dead "AI is unavailable" state.
 */
function fallbackReply(question: string, member: Member): string {
  const q = question.toLowerCase();
  const display = member.preferredName ?? member.firstName;

  if (q.includes("menu") || q.includes("dinner") || q.includes("eat")) {
    return `Hello ${display} — to see tonight's menu, head to /dining and pick a venue. The Main Dining Room dinner posts there with full descriptions and dietary tags.\n\n(I'm currently in offline demo mode — set ANTHROPIC_API_KEY in Vercel to enable the live concierge.)`;
  }
  if (q.includes("tee") || q.includes("golf")) {
    return `For tee times, /golf shows live availability across the next seven days. Tap a slot to book — you'll keep your foursome together.\n\n(Offline demo mode — add ANTHROPIC_API_KEY for live answers.)`;
  }
  if (q.includes("court") || q.includes("tennis") || q.includes("pickleball")) {
    return `Court reservations are at /courts — tennis, pickleball, and platform.\n\n(Offline demo mode — add ANTHROPIC_API_KEY for live answers.)`;
  }
  if (q.includes("event") || q.includes("rsvp")) {
    return `The full calendar is at /events. Tap any event to RSVP.\n\n(Offline demo mode — add ANTHROPIC_API_KEY for live answers.)`;
  }
  if (q.includes("hello") || q.includes("hi") || q.length < 12) {
    return `Hello, ${display}. I can help with reservations, tee times, menus, events, and questions about the club. What can I see to?`;
  }
  return `I'd be happy to help with that, ${display} — but the live concierge requires the ANTHROPIC_API_KEY environment variable to be set. Until then I can point you to the right surface: /dining, /golf, /courts, /events, or /account.`;
}
