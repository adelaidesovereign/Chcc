import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = "text", ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        "block w-full bg-transparent",
        "h-14 px-0 py-3",
        "border-0 border-b border-[color:var(--color-border-strong)]",
        "font-serif text-lg tracking-[var(--tracking-tight)]",
        "text-[color:var(--color-text-emphasis)]",
        "placeholder:font-sans placeholder:text-base placeholder:tracking-[0.04em] placeholder:text-[color:var(--color-text-muted)]",
        "transition-colors duration-[var(--duration-quick)] ease-[var(--ease-standard)]",
        "focus:border-[color:var(--color-accent)] focus:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";
