/**
 * Auth route group — login + magic-link callback.
 * No header / footer chrome; the login page renders its own.
 */
export default function AuthLayout({ children }: { readonly children: React.ReactNode }) {
  return <div data-theme="parchment">{children}</div>;
}
