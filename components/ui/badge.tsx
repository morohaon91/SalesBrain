import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-primary-600/20 text-primary-400 border border-primary-500/30",
        secondary:
          "bg-white/[0.07] text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))]",
        destructive:
          "bg-danger-500/15 text-danger-400 border border-danger-500/25",
        outline:
          "border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]",
        success:
          "bg-success-500/15 text-success-400 border border-success-500/25",
        warning:
          "bg-warning-500/15 text-warning-400 border border-warning-500/25",
        accent:
          "bg-accent-500/15 text-accent-400 border border-accent-500/25",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
