import Image from "next/image";
import { clubConfig } from "@/club.config";
import { cn } from "@/lib/utils";

interface WordmarkProps {
  readonly variant?: "stacked" | "inline" | "mark-only";
  readonly size?: "sm" | "md" | "lg" | "xl";
  readonly className?: string;
}

const SIZES = {
  sm: { mark: 32, text: "text-xs" },
  md: { mark: 56, text: "text-sm" },
  lg: { mark: 96, text: "text-base" },
  xl: { mark: 160, text: "text-base" },
} as const;

/**
 * The CHCC monogram + name lockup. Use everywhere the club identity
 * appears. Reads brand assets from club.config — never hard-codes.
 */
export function Wordmark({ variant = "stacked", size = "md", className }: WordmarkProps) {
  const dim = SIZES[size];
  return (
    <div
      className={cn(
        "flex items-center",
        variant === "stacked" ? "flex-col gap-3" : "flex-row gap-4",
        className,
      )}
    >
      <Image
        src={clubConfig.brand.logoMarkPath ?? clubConfig.brand.logoPath}
        alt={clubConfig.name}
        width={dim.mark}
        height={(dim.mark * 200) / 320}
        priority
      />
      {variant !== "mark-only" ? (
        <div
          className={cn(
            "font-serif tracking-tight text-[color:var(--color-text-emphasis)]",
            variant === "stacked" ? "text-center" : "text-left",
          )}
        >
          <div
            className={cn("tracking-[0.22em] uppercase", dim.text)}
            style={{ color: "var(--color-text-secondary)" }}
          >
            Chapel Hill
          </div>
          <div className={cn(variant === "stacked" ? "mt-1 text-2xl" : "text-xl")}>
            Country Club
          </div>
        </div>
      ) : null}
    </div>
  );
}
