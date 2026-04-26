import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { getAdapter } from "@/lib/adapter";
import { clubConfig } from "@/club.config";
import type { Member } from "@/lib/adapter/types";
import { formatLongDate, formatTime, formatPrice, todayISO, addDaysISO } from "@/lib/format";

/**
 * Concierge tool definitions — exposed to Claude via tool_use.
 * Every handler runs server-side and reads through the adapter.
 *
 * Privacy: tools are scoped to the current member only. No tool can
 * read another member's full profile or charges.
 */

export const conciergeTools: Anthropic.Tool[] = [
  {
    name: "get_my_profile",
    description:
      "Returns the signed-in member's profile: tier, email, dietary preferences, anniversary date, birthday, household. Use this to personalise responses.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "get_my_upcoming_reservations",
    description:
      "Returns the member's upcoming dining reservations across all venues. Use when the member asks 'do I have anything booked?' or similar.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "get_dining_availability",
    description:
      "Lists available dining time slots for a specific venue, date, and party size. Use when the member asks if they can book a table.",
    input_schema: {
      type: "object",
      properties: {
        venueId: {
          type: "string",
          enum: clubConfig.diningVenues.map((v) => v.id),
          description:
            "The venue id. Available: " +
            clubConfig.diningVenues.map((v) => `${v.id} (${v.name})`).join(", "),
        },
        date: {
          type: "string",
          description:
            "YYYY-MM-DD. If the member says 'tomorrow' or 'Saturday', resolve to a date.",
        },
        partySize: { type: "number", description: "Number of guests including the member." },
      },
      required: ["venueId", "date", "partySize"],
    },
  },
  {
    name: "get_tee_time_availability",
    description:
      "Lists available tee times for a date and party size. Use when the member asks about golf.",
    input_schema: {
      type: "object",
      properties: {
        date: { type: "string", description: "YYYY-MM-DD" },
        players: { type: "number", description: "1, 2, 3, or 4 players." },
      },
      required: ["date", "players"],
    },
  },
  {
    name: "get_menu_for_date",
    description:
      "Returns the full menu for a venue on a given date. Use when asked about food, dietary fit, or what's on the menu.",
    input_schema: {
      type: "object",
      properties: {
        venueId: {
          type: "string",
          enum: clubConfig.diningVenues.map((v) => v.id),
        },
        date: { type: "string", description: "YYYY-MM-DD" },
      },
      required: ["venueId", "date"],
    },
  },
  {
    name: "get_upcoming_events",
    description: "Lists upcoming club events. Filter by category if the member specifies one.",
    input_schema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          enum: [
            "golf-tournament",
            "wine-dinner",
            "holiday",
            "family",
            "social",
            "racquets",
            "junior",
          ],
        },
      },
    },
  },
  {
    name: "get_club_facts",
    description:
      "Returns static facts about the club: address, hours per venue, golf course details, court counts, pool season. Use when asked about the club itself.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
];

/**
 * Executes a tool call and returns a string result that the model
 * can use as the tool_result content. Always plain text — keeps
 * the model from hallucinating structure.
 */
export async function executeTool(
  toolName: string,
  toolInput: unknown,
  member: Member,
): Promise<string> {
  const adapter = getAdapter();
  const input = (toolInput ?? {}) as Record<string, unknown>;

  switch (toolName) {
    case "get_my_profile": {
      return [
        `Name: ${member.preferredName ?? member.firstName} ${member.lastName}`,
        `Member number: ${member.memberNumber}`,
        `Tier: ${member.tier}`,
        `Email: ${member.email}`,
        member.phone ? `Phone: ${member.phone}` : null,
        member.birthday ? `Birthday: ${member.birthday}` : null,
        member.anniversaryDate ? `Anniversary: ${member.anniversaryDate}` : null,
        member.dietaryPreferences.length
          ? `Dietary preferences: ${member.dietaryPreferences.join(", ")}`
          : "Dietary preferences: none on file",
        `Member since: ${member.joinedOn.slice(0, 4)}`,
      ]
        .filter(Boolean)
        .join("\n");
    }

    case "get_my_upcoming_reservations": {
      const now = new Date().toISOString();
      const reservations = await adapter.listMemberReservations({
        memberId: member.id,
        from: now,
      });
      const upcoming = reservations
        .filter((r) => r.status === "confirmed")
        .sort((a, b) => a.time.localeCompare(b.time));
      if (upcoming.length === 0) return "You have no upcoming reservations on the books.";
      return upcoming
        .map((r) => {
          const venue = clubConfig.diningVenues.find((v) => v.id === r.venueId)?.name ?? r.venueId;
          return `${venue} — ${formatLongDate(r.time)} at ${formatTime(r.time)}, party of ${r.partySize}${r.occasion ? ` (${r.occasion})` : ""}${r.notes ? ` — note: "${r.notes}"` : ""}`;
        })
        .join("\n");
    }

    case "get_dining_availability": {
      const venueId = String(input.venueId);
      const date = String(input.date);
      const partySize = Number(input.partySize);
      const slots = await adapter.listAvailableTimes({ venueId, date, partySize });
      const venueName = clubConfig.diningVenues.find((v) => v.id === venueId)?.name ?? venueId;
      if (slots.length === 0) {
        return `${venueName} has no available reservations for a party of ${partySize} on ${formatLongDate(date)}.`;
      }
      const times = slots
        .slice(0, 12)
        .map((s) => formatTime(s.time))
        .join(", ");
      return `${venueName} on ${formatLongDate(date)} — available times: ${times}${slots.length > 12 ? " (and more)" : ""}.`;
    }

    case "get_tee_time_availability": {
      const date = String(input.date);
      const players = Number(input.players) as 1 | 2 | 3 | 4;
      const slots = await adapter.listAvailableTeeTimes({ date, players });
      if (slots.length === 0) {
        return `No tee times for ${players} players on ${formatLongDate(date)}.`;
      }
      const times = slots
        .slice(0, 12)
        .map((s) => formatTime(s.time))
        .join(", ");
      return `Tee times on ${formatLongDate(date)} for ${players} player${players > 1 ? "s" : ""}: ${times}${slots.length > 12 ? " (and more)" : ""}.`;
    }

    case "get_menu_for_date": {
      const venueId = String(input.venueId);
      const date = String(input.date);
      const menus = await adapter.listMenusForDate({ date, venueId });
      const venueName = clubConfig.diningVenues.find((v) => v.id === venueId)?.name ?? venueId;
      if (menus.length === 0) {
        return `No menu posted for ${venueName} on ${formatLongDate(date)}.`;
      }
      return menus
        .map((m) => {
          const items = m.items
            .map(
              (i) =>
                `- ${i.section} — ${i.name}: ${i.description}${i.dietaryTags.length ? ` [${i.dietaryTags.join(", ")}]` : ""}${i.priceCents ? ` (${formatPrice(i.priceCents)})` : ""}`,
            )
            .join("\n");
          return `${venueName} ${m.service} — ${formatLongDate(m.date)}:\n${items}`;
        })
        .join("\n\n");
    }

    case "get_upcoming_events": {
      const now = new Date().toISOString();
      const category = input.category ? String(input.category) : undefined;
      const events = await adapter.listEvents({
        from: now,
        ...(category
          ? {
              category: category as Parameters<typeof adapter.listEvents>[0] extends {
                category?: infer C;
              }
                ? C
                : never,
            }
          : {}),
      });
      if (events.length === 0) return "No upcoming events match.";
      return events
        .slice(0, 8)
        .map(
          (e) =>
            `${e.title} (${e.category.replace(/-/g, " ")}) — ${formatLongDate(e.startsAt)} at ${formatTime(e.startsAt)}, ${e.location}. ${e.attendingCount}/${e.capacity} attending${e.priceCents ? `, ${formatPrice(e.priceCents)} per guest` : ""}.`,
        )
        .join("\n");
    }

    case "get_club_facts": {
      const venues = clubConfig.diningVenues
        .map((v) => `${v.name} (capacity ${v.capacity}, dress: ${v.dressCode})`)
        .join("; ");
      return [
        `Club: ${clubConfig.name}, founded ${clubConfig.foundingYear}`,
        `Address: ${clubConfig.location.addressLine1}, ${clubConfig.location.city}, ${clubConfig.location.state} ${clubConfig.location.postalCode}`,
        `Tagline: ${clubConfig.brand.tagline}`,
        `Golf: ${clubConfig.golf.name}, ${clubConfig.golf.holes} holes, par ${clubConfig.golf.par}, course rating ${clubConfig.golf.courseRating}, ${clubConfig.golf.architect}`,
        `Courts: ${clubConfig.courts.map((c) => `${c.count} ${c.type} (${c.surface})`).join(", ")}`,
        `Pool: ${clubConfig.pool.name} — ${clubConfig.pool.description}, season ${clubConfig.pool.seasonStart} to ${clubConfig.pool.seasonEnd}`,
        `Dining venues: ${venues}`,
        `Today: ${todayISO()} (use this when resolving relative dates).`,
        `Tomorrow: ${addDaysISO(todayISO(), 1)}`,
      ].join("\n");
    }

    default:
      return `Unknown tool: ${toolName}`;
  }
}
