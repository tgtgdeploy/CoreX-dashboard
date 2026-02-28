import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import type { ActivityEvent } from "@shared/schema";
import { CheckCircle2, XCircle, AlertTriangle, ArrowUpCircle, ArrowDownCircle, Rocket, FileText, AlertOctagon, Play, Zap, Server } from "lucide-react";
import { timeAgoShort } from "@/i18n/utils";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  job_started: Play,
  job_completed: CheckCircle2,
  job_failed: XCircle,
  alert_fired: AlertTriangle,
  alert_resolved: CheckCircle2,
  scale_up: ArrowUpCircle,
  scale_down: ArrowDownCircle,
  endpoint_deployed: Rocket,
  invoice_generated: FileText,
  incident_opened: AlertOctagon,
  node_added: Server,
};

const COLORS: Record<string, string> = {
  info: "text-blue-400",
  success: "text-emerald-400",
  warning: "text-amber-400",
  critical: "text-red-400",
};

interface LiveActivityFeedProps {
  events: ActivityEvent[];
  maxItems?: number;
  className?: string;
}

export function LiveActivityFeed({ events, maxItems = 12, className }: LiveActivityFeedProps) {
  const { t } = useTranslation();
  return (
    <div className={cn("space-y-0.5 overflow-hidden", className)}>
      {events.slice(0, maxItems).map((event, i) => {
        const Icon = ICONS[event.type] || Zap;
        return (
          <div
            key={event.id || i}
            className="flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-muted/30 transition-colors group"
          >
            <Icon className={cn("w-3.5 h-3.5 shrink-0", COLORS[event.severity])} />
            <span className="truncate flex-1 text-[11px] sm:text-xs">{event.title}</span>
            <span className="text-[10px] text-muted-foreground font-mono shrink-0 opacity-60 group-hover:opacity-100">
              {timeAgoShort(event.ts, t)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
