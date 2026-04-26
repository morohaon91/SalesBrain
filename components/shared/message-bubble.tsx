import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string | Date;
  isLoading?: boolean;
}

export function MessageBubble({ role, content, timestamp, isLoading }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      <div
        className="max-w-xs rounded-2xl px-4 py-2 text-sm"
        style={isUser
          ? { background: 'linear-gradient(135deg, hsl(38,78%,46%), hsl(38,84%,61%))', color: '#fff', borderBottomRightRadius: '4px' }
          : { background: 'hsl(228,32%,12%)', color: 'hsl(38,25%,90%)', border: '1px solid rgba(255,255,255,0.07)', borderBottomLeftRadius: '4px' }
        }
      >
        <p className="whitespace-pre-wrap">{isLoading ? '…' : content}</p>
        {timestamp && (
          <p className="mt-1 text-xs opacity-60">
            {typeof timestamp === "string" ? format(new Date(timestamp), "HH:mm") : format(timestamp, "HH:mm")}
          </p>
        )}
      </div>
    </div>
  );
}
