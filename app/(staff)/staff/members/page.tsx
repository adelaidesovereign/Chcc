import Link from "next/link";
import { requireStaff } from "@/lib/staff";
import { getAdapter } from "@/lib/adapter";
import { StaffShell } from "@/components/layouts/StaffShell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

interface PageProps {
  readonly searchParams: Promise<{ q?: string; tier?: string }>;
}

export default async function StaffMembers({ searchParams }: PageProps) {
  const sp = await searchParams;
  const staff = await requireStaff();
  const adapter = getAdapter();

  const query = (sp.q ?? "").trim();
  const tierFilter = sp.tier;

  let members = query
    ? await adapter.searchMembers({ query, limit: 200 })
    : (await adapter.listDirectory({ limit: 200 })).items;

  if (tierFilter) {
    members = members.filter((m) => m.tier === tierFilter);
  }

  // Tier counts (from full directory, not filtered)
  const fullDirectory = (await adapter.listDirectory({ limit: 200 })).items;
  const tierCounts = new Map<string, number>();
  for (const m of fullDirectory) {
    tierCounts.set(m.tier, (tierCounts.get(m.tier) ?? 0) + 1);
  }

  return (
    <StaffShell member={staff} current="members">
      <header className="mb-10">
        <p className="eyebrow">Membership</p>
        <h1 className="mt-3 font-serif text-4xl leading-[1.05] tracking-tight md:text-5xl">
          Directory
        </h1>
        <p className="mt-3 text-sm text-[color:var(--color-text-secondary)]">
          {fullDirectory.length} active members · {members.length} matching
        </p>
      </header>

      <form action="/staff/members" className="mb-6 max-w-xl">
        <Input name="q" defaultValue={query} placeholder="Search by name or member number…" />
        {tierFilter ? <input type="hidden" name="tier" value={tierFilter} /> : null}
      </form>

      <section className="mb-10 flex flex-wrap gap-2">
        <Link
          href={`/staff/members${query ? `?q=${query}` : ""}`}
          className={`rounded-[var(--radius-pill)] border px-4 py-2 text-xs font-medium tracking-[var(--tracking-widest)] uppercase ${
            !tierFilter
              ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent-pale)]/30 text-[color:var(--color-accent-deep)]"
              : "border-[color:var(--color-border-default)] bg-[color:var(--color-surface-primary)] text-[color:var(--color-text-secondary)] hover:border-[color:var(--color-accent)]"
          }`}
        >
          All ({fullDirectory.length})
        </Link>
        {[...tierCounts.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([tier, count]) => (
            <Link
              key={tier}
              href={`/staff/members?tier=${tier}${query ? `&q=${query}` : ""}`}
              className={`rounded-[var(--radius-pill)] border px-4 py-2 text-xs font-medium tracking-[var(--tracking-widest)] uppercase ${
                tierFilter === tier
                  ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent-pale)]/30 text-[color:var(--color-accent-deep)]"
                  : "border-[color:var(--color-border-default)] bg-[color:var(--color-surface-primary)] text-[color:var(--color-text-secondary)] hover:border-[color:var(--color-accent)]"
              }`}
            >
              {tier.replace(/-/g, " ")} ({count})
            </Link>
          ))}
      </section>

      {members.length === 0 ? (
        <Card variant="outlined">
          <CardContent className="py-12 text-center text-sm text-[color:var(--color-text-secondary)]">
            No members match.
          </CardContent>
        </Card>
      ) : (
        <Card variant="outlined">
          <CardContent className="p-0">
            <ul className="divide-y divide-[color:var(--color-border-subtle)]">
              {members.map((m) => (
                <li key={m.id}>
                  <Link
                    href={`/directory/${m.id}`}
                    className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-6 py-4 transition-colors hover:bg-[color:var(--color-accent-pale)]/10"
                  >
                    <span className="flex size-9 items-center justify-center rounded-full bg-[color:var(--color-accent)] font-serif text-xs text-[color:var(--color-text-on-accent)]">
                      {m.displayName
                        .split(" ")
                        .map((s) => s[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <div className="font-serif text-base text-[color:var(--color-text-emphasis)]">
                        {m.displayName}
                      </div>
                      <div className="text-xs text-[color:var(--color-text-muted)]">
                        No. {m.memberNumber}
                      </div>
                    </div>
                    <Badge tone="default">{m.tier.replace(/-/g, " ")}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </StaffShell>
  );
}
