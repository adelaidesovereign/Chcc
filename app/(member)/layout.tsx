/**
 * Member route group — Phase 2.
 * Empty in Phase 1; placeholder to reserve the segment.
 *
 * The middleware redirects unauthenticated requests for any path under
 * here to /login, but no member routes exist yet.
 */
export default function MemberLayout({ children }: { readonly children: React.ReactNode }) {
  return <div data-theme="parchment">{children}</div>;
}
