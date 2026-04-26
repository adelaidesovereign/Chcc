import { cn } from "@/lib/utils";

interface PhotoFallbackProps {
  readonly label?: string;
  readonly className?: string;
}

/**
 * Warm typography-led fallback that renders when a photograph file is
 * missing. Used by the marketing page so the demo is presentable even
 * before the real CHCC photography is dropped into /public/club-assets.
 *
 * In production we'd use next/image with a `placeholder` blur — but
 * for an entirely missing file we want a graceful, on-brand fallback.
 */
export function PhotoFallback({ label, className }: PhotoFallbackProps) {
  return (
    <div
      className={cn(
        "relative isolate flex items-center justify-center overflow-hidden",
        "bg-[color:var(--color-surface-secondary)]",
        className,
      )}
    >
      {/* Subtle noise + diagonal lines so it doesn't read as broken */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-50"
        style={{
          background:
            "repeating-linear-gradient(45deg, transparent 0 14px, rgba(176,141,87,0.04) 14px 16px)",
        }}
      />
      {label ? (
        <span className="relative z-10 text-center font-serif text-xl text-[color:var(--color-text-muted)] italic">
          {label}
        </span>
      ) : null}
    </div>
  );
}
