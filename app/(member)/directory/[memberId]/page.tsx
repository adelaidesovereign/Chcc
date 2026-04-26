import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCurrentMember } from "@/lib/session";
import { getAdapter } from "@/lib/adapter";
import { MemberShell } from "@/components/layouts/MemberShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMonthDay } from "@/lib/format";

export const dynamic = "force-dynamic";

interface PageProps {
  readonly params: Promise<{ memberId: string }>;
}

export default async function MemberProfile({ params }: PageProps) {
  const { memberId } = await params;
  const me = await requireCurrentMember();
  const adapter = getAdapter();
  const profile = await adapter.getMember(memberId);
  if (!profile) notFound();

  // Privacy: only show full details to the member themselves;
  // others see name + tier + household connection.
  const isSelf = me.id === profile.id;
  const sameHousehold = me.householdId === profile.householdId;
  const showDetails = isSelf || sameHousehold;

  const display = profile.preferredName
    ? `${profile.preferredName} ${profile.lastName}`
    : `${profile.firstName} ${profile.lastName}`;

  const initials = `${profile.firstName[0] ?? ""}${profile.lastName[0] ?? ""}`.toUpperCase();

  return (
    <MemberShell member={me} current="directory">
      <div className="mb-8">
        <Link
          href="/directory"
          className="text-xs tracking-[var(--tracking-widest)] text-[color:var(--color-text-muted)] uppercase hover:text-[color:var(--color-accent-deep)]"
        >
          ← The Membership
        </Link>
      </div>

      <header className="mb-12 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <span className="flex size-24 flex-shrink-0 items-center justify-center rounded-full bg-[color:var(--color-text-emphasis)] font-serif text-3xl text-[color:var(--color-surface-canvas)]">
          {initials}
        </span>
        <div>
          <p className="eyebrow">{profile.tier.replace(/-/g, " ")} member</p>
          <h1 className="mt-2 font-serif text-4xl tracking-tight md:text-5xl">{display}</h1>
          <p className="mt-2 text-sm text-[color:var(--color-text-muted)]">
            Member No. {profile.memberNumber}
            {profile.joinedOn ? ` · since ${profile.joinedOn.slice(0, 4)}` : ""}
          </p>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card variant="outlined">
          <CardContent className="space-y-4 py-6">
            <p className="eyebrow">Profile</p>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[color:var(--color-text-muted)]">Tier</dt>
                <dd className="text-[color:var(--color-text-primary)]">
                  {profile.tier.replace(/-/g, " ")}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[color:var(--color-text-muted)]">Status</dt>
                <dd>
                  <Badge tone={profile.status === "active" ? "forest" : "default"}>
                    {profile.status.replace(/-/g, " ")}
                  </Badge>
                </dd>
              </div>
              {showDetails && profile.email ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-[color:var(--color-text-muted)]">Email</dt>
                  <dd className="text-[color:var(--color-text-primary)]">{profile.email}</dd>
                </div>
              ) : null}
              {showDetails && profile.phone ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-[color:var(--color-text-muted)]">Phone</dt>
                  <dd className="text-[color:var(--color-text-primary)]">{profile.phone}</dd>
                </div>
              ) : null}
              {profile.birthday ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-[color:var(--color-text-muted)]">Birthday</dt>
                  <dd className="text-[color:var(--color-text-primary)]">
                    {formatMonthDay(profile.birthday)}
                  </dd>
                </div>
              ) : null}
              {showDetails && profile.anniversaryDate ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-[color:var(--color-text-muted)]">Anniversary</dt>
                  <dd className="text-[color:var(--color-text-primary)]">
                    {formatMonthDay(profile.anniversaryDate)}
                  </dd>
                </div>
              ) : null}
            </dl>
          </CardContent>
        </Card>

        {showDetails && profile.dietaryPreferences.length > 0 ? (
          <Card variant="outlined">
            <CardContent className="space-y-4 py-6">
              <p className="eyebrow">Dietary preferences</p>
              <div className="flex flex-wrap gap-2">
                {profile.dietaryPreferences.map((d) => (
                  <Badge key={d} tone="warning">
                    {d.replace(/-/g, " ")}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-[color:var(--color-text-muted)]">
                Visible to household members and our culinary team only.
              </p>
            </CardContent>
          </Card>
        ) : null}
      </section>
    </MemberShell>
  );
}
