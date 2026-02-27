import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KpiStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  trendLabel?: string;
  icon?: React.ReactNode;
  variant?: "default" | "success" | "warning" | "critical";
  className?: string;
}

export function KpiStatCard({ title, value, subtitle, trend, trendLabel, icon, variant = "default", className }: KpiStatCardProps) {
  const trendColor = trend && trend > 0 ? "text-emerald-400" : trend && trend < 0 ? "text-red-400" : "text-muted-foreground";
  const TrendIcon = trend && trend > 0 ? TrendingUp : trend && trend < 0 ? TrendingDown : Minus;

  const borderColor = {
    default: "border-border/50",
    success: "border-emerald-500/30",
    warning: "border-amber-500/30",
    critical: "border-red-500/30",
  }[variant];

  return (
    <Card className={cn(
      "relative overflow-hidden border bg-card/50 backdrop-blur-sm p-4 sm:p-5 transition-all hover:bg-card/70",
      borderColor,
      className
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider truncate">{title}</p>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold mt-1 tracking-tight truncate">{value}</p>
          {(trend !== undefined || subtitle) && (
            <div className="flex items-center gap-1.5 mt-1.5">
              {trend !== undefined && (
                <span className={cn("flex items-center gap-0.5 text-[11px] sm:text-xs font-medium", trendColor)}>
                  <TrendIcon className="w-3 h-3" />
                  {Math.abs(trend).toFixed(1)}%
                </span>
              )}
              {(trendLabel || subtitle) && (
                <span className="text-[10px] sm:text-[11px] text-muted-foreground truncate">{trendLabel || subtitle}</span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div className="shrink-0 p-2 rounded-lg bg-muted/50">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
