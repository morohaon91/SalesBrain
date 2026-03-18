import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string | Date;
  isLoading?: boolean;
}

export function MessageBubble({
  role,
  content,
  timestamp,
  isLoading,
}: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-xs rounded-lg px-4 py-2 text-sm",
          isUser
            ? "bg-primary-600 text-white"
            : "bg-gray-100 text-gray-900"
        )}
      >
        <p className="whitespace-pre-wrap">{content}</p>
        {timestamp && (
          <p
            className={cn(
              "mt-1 text-xs",
              isUser ? "text-primary-100" : "text-gray-500"
            )}
          >
            {typeof timestamp === "string"
              ? format(new Date(timestamp), "HH:mm")
              : format(timestamp, "HH:mm")}
          </p>
        )}
      </div>
    </div>
  );
}
