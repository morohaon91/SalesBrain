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
        "flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 px-6 py-12 text-center",
        className
      )}
    >
      {Icon && <Icon className="mb-4 h-12 w-12 text-gray-300" />}
      <h3 className="text-heading-3 mb-2 text-gray-900">{title}</h3>
      {description && (
        <p className="mb-6 text-small text-gray-600">{description}</p>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          className="bg-primary-600 hover:bg-primary-700 text-white"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
