import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))] disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-primary-500 to-primary-600 text-[hsl(var(--primary-foreground))] shadow-gold hover:-translate-y-px hover:shadow-[0_10px_32px_rgba(200,136,26,0.45)] active:translate-y-0",
        destructive:
          "bg-danger-600 text-white hover:bg-danger-700 shadow-sm",
        outline:
          "border border-[hsl(var(--border))] bg-transparent text-[hsl(var(--foreground))] hover:bg-white/5 hover:border-[hsl(var(--primary)/0.4)]",
        secondary:
          "bg-white/[0.06] text-[hsl(var(--foreground))] hover:bg-white/[0.1] border border-[hsl(var(--border))]",
        ghost:
          "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-white/[0.05]",
        link:
          "text-primary-500 hover:text-primary-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-7",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
