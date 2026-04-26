import Link from "next/link";
import { requireCurrentMember } from "@/lib/session";
import { getAdapter } from "@/lib/adapter";
import { MemberShell } from "@/components/layouts/MemberShell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

interface PageProps {
  readonly searchParams: Promise<{ q?: string }>;
}

export default async function DirectoryPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const query = (sp.q ?? "").trim();

  const member = await requireCurrentMember();
  const adapter = getAdapter();

  const directory = query
    ? await adapter.searchMembers({ query, limit: 50 })
    : (await adapter.listDirectory({ limit: 50 })).items;

  type Entry = (typeof directory)[number];
  const grouped = new Map<string, Entry[]>();
  for (const m of directory) {
    const initial = m.displayName.split(" ").pop()?.[0]?.toUpperCase() ?? "—";
    const list = grouped.get(initial) ?? [];
    list.push(m);
    grouped.set(initial, list);
  }
  const sortedGroups = [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b));

  return (
    <MemberShell member={member} current="directory">
      <header className="mb-10">
        <p className="eyebrow">The Membership</p>
        <h1 className="mt-3 font-serif text-4xl leading-[1.05] tracking-tight md:text-5xl">
          A familiar room.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[color:var(--color-text-secondary)]">
          Search by name or member number.
        </p>
      </header>

      <form action="/directory" className="mb-12 max-w-md">
        <Input name="q" defaultValue={query} placeholder="Search the membership…" />
      </form>

      {directory.length === 0 ? (
        <Card variant="outlined">
          <CardContent className="py-12 text-center text-sm text-[color:var(--color-text-secondary)]">
            No members match {query ? `"${query}"` : "your search"}.
          </CardContent>
        </Card>
      ) : (
        <section className="space-y-12">
          {sortedGroups.map(([letter, list]) => (
            <div key={letter}>
              <h2 className="mb-4 font-serif text-3xl text-[color:var(--color-accent-deep)]">
                {letter}
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((m) => (
                  <li key={m.id}>
                    <Link
                      href={`/directory/${m.id}`}
                      className="group flex items-center justify-between gap-4 rounded-[var(--radius-sm)] border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-primary)] px-4 py-3 transition-colors hover:border-[color:var(--color-accent)] hover:bg-[color:var(--color-accent-pale)]/30"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-full bg-[color:var(--color-text-emphasis)] font-serif text-xs text-[color:var(--color-surface-canvas)]">
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
                      </div>
                      <Badge tone="default" className="hidden sm:inline-flex">
                        {m.tier.replace(/-/g, " ")}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}
    </MemberShell>
  );
}
