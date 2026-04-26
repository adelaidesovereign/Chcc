import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "default" | "accent" | "forest" | "heritage" | "warning" | "danger";

export function Badge({
  className,
  tone = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { readonly tone?: BadgeTone }) {
  const tones: Record<BadgeTone, string> = {
    default: "bg-[color:var(--color-surface-secondary)] text-[color:var(--color-text-secondary)]",
    accent: "bg-[color:var(--color-accent-pale)] text-[color:var(--color-accent-deep)]",
    forest: "bg-[color:var(--color-forest-soft)]/15 text-[color:var(--color-forest-deep)]",
    heritage: "bg-[color:var(--color-heritage-soft)]/15 text-[color:var(--color-heritage-deep)]",
    warning: "bg-[color:var(--color-status-warning)]/15 text-[color:var(--color-status-warning)]",
    danger: "bg-[color:var(--color-status-danger)]/15 text-[color:var(--color-status-danger)]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-3 py-1",
        "text-[10px] font-medium tracking-[var(--tracking-widest)] uppercase",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
