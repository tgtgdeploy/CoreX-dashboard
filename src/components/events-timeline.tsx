import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Info, XCircle, Zap, ArrowUpCircle, Rocket, FileText, AlertOctagon, Play, Clock } from "lucide-react";
import type { ActivityEvent, ReplayEvent } from "@shared/schema";

const SEVERITY_COLORS = {
  info: "border-blue-500/30 bg-blue-500/5",
  success: "border-emerald-500/30 bg-emerald-500/5",
  warning: "border-amber-500/30 bg-amber-500/5",
  critical: "border-red-500/30 bg-red-500/5",
};

const SEVERITY_DOT = {
  info: "bg-blue-400",
  success: "bg-emerald-400",
  warning: "bg-amber-400",
  critical: "bg-red-400",
};

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Play, CheckCircle: CheckCircle2, CheckCircle2, XCircle, AlertTriangle,
  ArrowUpCircle, Rocket, FileText, AlertOctagon, Info, Zap, Clock,
};

function formatTimeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface EventsTimelineProps {
  events: (ActivityEvent | ReplayEvent)[];
  maxItems?: number;
  className?: string;
  showTime?: "relative" | "absolute";
}

export function EventsTimeline({ events, maxItems = 15, className, showTime = "relative" }: EventsTimelineProps) {
  const items = events.slice(0, maxItems);

  return (
    <div className={cn("space-y-1", className)}>
      {items.map((event, i) => {
        const severity = event.severity;
        const iconName = "icon" in event ? event.icon : "Info";
        const IconComponent = ICON_MAP[iconName] || Info;
        const ts = "ts" in event ? event.ts : "";
        const title = event.title;

        return (
          <div key={i} className={cn(
            "flex items-start gap-2.5 px-3 py-2 rounded-md border transition-colors",
            SEVERITY_COLORS[severity]
          )}>
            <div className={cn("mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center", SEVERITY_DOT[severity])}>
              <IconComponent className="w-3 h-3 text-background" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium leading-tight truncate">{title}</p>
              {"description" in event && event.description && (
                <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{event.description}</p>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground font-mono shrink-0 mt-0.5">
              {showTime === "relative" && ts ? formatTimeAgo(ts) : ts ? new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}
