import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border border-transparent bg-primary-500 text-white hover:bg-primary-600",
        secondary:
          "border border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200",
        destructive:
          "border border-transparent bg-danger-500 text-white hover:bg-danger-600",
        outline: "border border-gray-300 text-gray-900",
        success:
          "border border-transparent bg-success-500 text-white hover:bg-success-600",
        warning:
          "border border-transparent bg-warning-500 text-white hover:bg-warning-600",
        accent:
          "border border-transparent bg-accent-500 text-white hover:bg-accent-600",
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
