/**
 * Marketing route group — public pages (landing, about, etc.).
 * No auth gate. Uses the default Parchment theme.
 */
export default function MarketingLayout({ children }: { readonly children: React.ReactNode }) {
  return <div data-theme="parchment">{children}</div>;
}
