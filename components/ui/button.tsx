import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-sans text-sm font-medium tracking-[0.04em]",
    "transition-[background,color,border-color,transform,box-shadow]",
    "duration-[var(--duration-quick)] ease-[var(--ease-standard)]",
    "disabled:pointer-events-none disabled:opacity-50",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-surface-canvas)]",
    "active:translate-y-[1px]",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: [
          "bg-[color:var(--color-text-emphasis)] text-[color:var(--color-surface-canvas)]",
          "hover:bg-[color:var(--color-heritage-deep)]",
        ].join(" "),
        accent: [
          "bg-[color:var(--color-accent)] text-[color:var(--color-text-on-accent)]",
          "hover:bg-[color:var(--color-accent-deep)] hover:text-[color:var(--color-surface-canvas)]",
        ].join(" "),
        outline: [
          "bg-transparent text-[color:var(--color-text-primary)]",
          "border border-[color:var(--color-border-strong)]",
          "hover:bg-[color:var(--color-surface-secondary)]",
        ].join(" "),
        ghost: [
          "bg-transparent text-[color:var(--color-text-primary)]",
          "hover:bg-[color:var(--color-surface-secondary)]",
        ].join(" "),
        link: [
          "h-auto p-0 text-[color:var(--color-accent-deep)] underline-offset-4",
          "hover:underline",
        ].join(" "),
      },
      size: {
        sm: "h-9 rounded-[var(--radius-sm)] px-4 text-xs",
        md: "h-11 rounded-[var(--radius-sm)] px-6",
        lg: "h-14 rounded-[var(--radius-sm)] px-8 text-base tracking-[0.06em]",
        icon: "size-10 rounded-[var(--radius-sm)]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
