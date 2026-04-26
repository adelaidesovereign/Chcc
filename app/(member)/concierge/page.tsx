import { requireCurrentMember } from "@/lib/session";
import { MemberShell } from "@/components/layouts/MemberShell";
import { ConciergeChat } from "./ConciergeChat";

export const dynamic = "force-dynamic";

export default async function ConciergePage() {
  const member = await requireCurrentMember();
  const display = member.preferredName ?? member.firstName;

  const suggestions = [
    "What's on the menu tonight?",
    "Can I get a 7pm table for two on Saturday?",
    "Show me tee times for tomorrow morning",
    "What events are coming up this month?",
    "Do I have anything booked?",
  ];

  return (
    <MemberShell member={member} current="concierge">
      <header className="mb-8">
        <p className="eyebrow">Concierge</p>
        <h1 className="mt-3 font-serif text-4xl leading-[1.05] tracking-tight md:text-5xl">
          Ask anything.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[color:var(--color-text-secondary)]">
          Trained on the club's calendar, menus, and your own preferences.
        </p>
      </header>

      <ConciergeChat memberFirstName={display} suggestions={suggestions} />
    </MemberShell>
  );
}
