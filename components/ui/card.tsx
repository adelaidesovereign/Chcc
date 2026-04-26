import * as React from "react";
import { cn } from "@/lib/utils";

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { readonly variant?: "default" | "raised" | "outlined" }
>(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative rounded-[var(--radius-lg)] bg-[color:var(--color-surface-primary)]",
      variant === "raised" && "shadow-[var(--shadow-md)]",
      variant === "outlined" && "border border-[color:var(--color-border-default)]",
      variant === "default" && "border border-[color:var(--color-border-subtle)]",
      className,
    )}
    {...props}
  />
));
Card.displayName = "Card";

export const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-6 pb-4", className)} {...props} />
);

export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn(
      "font-serif text-xl tracking-tight text-[color:var(--color-text-emphasis)]",
      className,
    )}
    {...props}
  />
);

export const CardDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cn(
      "mt-1 text-sm leading-relaxed font-light text-[color:var(--color-text-secondary)]",
      className,
    )}
    {...props}
  />
);

export const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("px-6 pb-6", className)} {...props} />
);

export const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex items-center gap-3 border-t border-[color:var(--color-border-subtle)] px-6 py-4",
      className,
    )}
    {...props}
  />
);
