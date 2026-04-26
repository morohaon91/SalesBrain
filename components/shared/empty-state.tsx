import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl px-6 py-14 text-center",
        className
      )}
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px dashed rgba(255,255,255,0.1)",
      }}
    >
      {Icon && (
        <div
          className="mb-4 w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: "rgba(200,136,26,0.08)", border: "1px solid rgba(200,136,26,0.15)" }}
        >
          <Icon className="h-6 w-6" style={{ color: "hsl(38, 84%, 61%)" }} />
        </div>
      )}
      <h3
        className="text-heading-3 mb-2"
        style={{ color: "hsl(38, 25%, 88%)", fontFamily: "'Cormorant', Georgia, serif", fontWeight: 600 }}
      >
        {title}
      </h3>
      {description && (
        <p className="mb-6 text-small max-w-xs" style={{ color: "hsl(228, 12%, 47%)" }}>
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
