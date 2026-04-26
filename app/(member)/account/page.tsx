import Link from "next/link";
import { requireCurrentMember } from "@/lib/session";
import { getAdapter } from "@/lib/adapter";
import { MemberShell } from "@/components/layouts/MemberShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatLongDate, formatPrice, formatMonthDay } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const member = await requireCurrentMember();
  const adapter = getAdapter();
  const charges = await adapter.listRecentCharges({ memberId: member.id, limit: 12 });

  const display = member.preferredName
    ? `${member.preferredName} ${member.lastName}`
    : `${member.firstName} ${member.lastName}`;

  const initials = `${member.firstName[0] ?? ""}${member.lastName[0] ?? ""}`.toUpperCase();

  return (
    <MemberShell member={member} current="account">
      <header className="mb-12 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <span className="flex size-24 flex-shrink-0 items-center justify-center rounded-full bg-[color:var(--color-text-emphasis)] font-serif text-3xl text-[color:var(--color-surface-canvas)]">
          {initials}
        </span>
        <div>
          <p className="eyebrow">{member.tier.replace(/-/g, " ")} member</p>
          <h1 className="mt-2 font-serif text-4xl tracking-tight md:text-5xl">{display}</h1>
          <p className="mt-2 text-sm text-[color:var(--color-text-muted)]">
            Member No. {member.memberNumber}
            {member.joinedOn ? ` · since ${member.joinedOn.slice(0, 4)}` : ""}
          </p>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        {/* Profile + dietary */}
        <Card variant="outlined">
          <CardContent className="space-y-6 py-6">
            <div>
              <p className="eyebrow">Profile</p>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-[color:var(--color-text-muted)]">Email</dt>
                  <dd className="text-[color:var(--color-text-primary)]">{member.email}</dd>
                </div>
                {member.phone ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-[color:var(--color-text-muted)]">Phone</dt>
                    <dd className="text-[color:var(--color-text-primary)]">{member.phone}</dd>
                  </div>
                ) : null}
                {member.birthday ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-[color:var(--color-text-muted)]">Birthday</dt>
                    <dd className="text-[color:var(--color-text-primary)]">
                      {formatMonthDay(member.birthday)}
                    </dd>
                  </div>
                ) : null}
                {member.anniversaryDate ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-[color:var(--color-text-muted)]">Anniversary</dt>
                    <dd className="text-[color:var(--color-text-primary)]">
                      {formatMonthDay(member.anniversaryDate)}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </div>

            <div className="border-t border-[color:var(--color-border-subtle)] pt-6">
              <p className="eyebrow">Dietary preferences</p>
              {member.dietaryPreferences.length === 0 ? (
                <p className="mt-3 text-sm text-[color:var(--color-text-secondary)]">
                  No preferences on file. Contact the front desk to update.
                </p>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  {member.dietaryPreferences.map((d) => (
                    <Badge key={d} tone="warning">
                      {d.replace(/-/g, " ")}
                    </Badge>
                  ))}
                </div>
              )}
              <p className="mt-3 text-xs text-[color:var(--color-text-muted)]">
                Automatically flagged on every dining reservation. Visible to our culinary team and
                household members only.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* House account */}
        <Card variant="outlined">
          <CardContent className="space-y-4 py-6">
            <p className="eyebrow">Recent charges</p>
            {charges.length === 0 ? (
              <p className="mt-3 text-sm text-[color:var(--color-text-secondary)]">
                No recent activity on your house account.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-[color:var(--color-border-subtle)]">
                {charges.map((c) => (
                  <li key={c.id} className="flex items-baseline justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <div className="text-sm text-[color:var(--color-text-primary)]">
                        {c.description}
                      </div>
                      <div className="text-xs text-[color:var(--color-text-muted)]">
                        {formatLongDate(c.postedAt)} · {c.category}
                      </div>
                    </div>
                    <div className="font-serif text-base text-[color:var(--color-text-emphasis)]">
                      {formatPrice(c.amountCents)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      <footer className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-[color:var(--color-border-subtle)] pt-6 text-center">
        <Link
          href="/directory"
          className="text-sm font-medium text-[color:var(--color-accent-deep)] hover:underline"
        >
          See your member directory entry →
        </Link>
        <span className="hidden text-[color:var(--color-text-muted)] sm:inline">·</span>
        <Link
          href="/staff"
          className="text-sm font-medium text-[color:var(--color-accent-deep)] hover:underline"
        >
          Switch to staff view →
        </Link>
      </footer>
    </MemberShell>
  );
}
