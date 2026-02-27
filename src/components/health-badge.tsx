import { cn } from "@/lib/utils";

type HealthStatus = "healthy" | "degraded" | "down" | "online" | "offline" | "maintenance" |
  "running" | "stopped" | "error" | "deploying" | "scaling" |
  "idle" | "busy" |
  "queued" | "completed" | "failed" | "cancelled" |
  "active" | "paused" | "disabled" | "failing" |
  "firing" | "resolved" | "acknowledged" |
  "investigating" | "identified" | "monitoring" |
  "critical" | "major" | "minor" | "warning" | "info" |
  "paid" | "pending" | "overdue" | "sent" | "draft" |
  "enterprise" | "pro" | "starter" | "trial" | "suspended" |
  string;

const STATUS_MAP: Record<string, { bg: string; text: string; dot: string }> = {
  // green
  healthy: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
  online: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
  running: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
  active: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
  completed: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
  resolved: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
  paid: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
  busy: { bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-400" },
  // yellow
  degraded: { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
  warning: { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
  maintenance: { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
  scaling: { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
  queued: { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
  pending: { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
  acknowledged: { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
  investigating: { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
  identified: { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
  monitoring: { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
  sent: { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
  draft: { bg: "bg-slate-500/10", text: "text-slate-400", dot: "bg-slate-400" },
  // blue
  deploying: { bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-400" },
  info: { bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-400" },
  idle: { bg: "bg-slate-500/10", text: "text-slate-400", dot: "bg-slate-400" },
  // red
  down: { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400" },
  offline: { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400" },
  error: { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400" },
  stopped: { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400" },
  failed: { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400" },
  cancelled: { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400" },
  critical: { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400" },
  major: { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400" },
  firing: { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400" },
  overdue: { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400" },
  failing: { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400" },
  disabled: { bg: "bg-slate-500/10", text: "text-slate-400", dot: "bg-slate-400" },
  paused: { bg: "bg-slate-500/10", text: "text-slate-400", dot: "bg-slate-400" },
  // tiers
  enterprise: { bg: "bg-purple-500/10", text: "text-purple-400", dot: "bg-purple-400" },
  pro: { bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-400" },
  starter: { bg: "bg-slate-500/10", text: "text-slate-400", dot: "bg-slate-400" },
  trial: { bg: "bg-cyan-500/10", text: "text-cyan-400", dot: "bg-cyan-400" },
  suspended: { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400" },
  minor: { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
};

interface HealthBadgeProps {
  status: HealthStatus;
  className?: string;
  showDot?: boolean;
  size?: "sm" | "md";
}

export function HealthBadge({ status, className, showDot = true, size = "sm" }: HealthBadgeProps) {
  const s = STATUS_MAP[status] || { bg: "bg-muted", text: "text-muted-foreground", dot: "bg-muted-foreground" };
  const textSize = size === "sm" ? "text-[10px] sm:text-[11px]" : "text-xs";
  const px = size === "sm" ? "px-1.5 py-0.5" : "px-2 py-0.5";

  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full font-mono font-medium uppercase", s.bg, s.text, textSize, px, className)}>
      {showDot && <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", s.dot)} />}
      {status}
    </span>
  );
}
