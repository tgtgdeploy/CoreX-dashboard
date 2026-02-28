import { useTranslation } from "react-i18next";
import type { GpuSummary } from "@shared/schema";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from "@/components/ui/tooltip";

function getUtilColor(util: number, status: string): string {
  if (status === "error") return "bg-red-500/80";
  if (status === "maintenance") return "bg-purple-500/50";
  if (util < 10) return "bg-zinc-800";
  if (util < 30) return "bg-emerald-900/60";
  if (util < 50) return "bg-emerald-700/60";
  if (util < 70) return "bg-blue-600/60";
  if (util < 85) return "bg-blue-500/70";
  if (util < 95) return "bg-amber-500/70";
  return "bg-red-500/70";
}

function getUtilBorder(util: number, status: string): string {
  if (status === "error") return "ring-1 ring-red-500/50";
  if (status === "maintenance") return "ring-1 ring-purple-500/30";
  if (util >= 95) return "ring-1 ring-red-500/30";
  return "";
}

export function GpuHeatmap({ gpus, dcFilter }: { gpus: GpuSummary[]; dcFilter?: string }) {
  const { t } = useTranslation();
  const filtered = dcFilter ? gpus.filter(g => g.dcName === dcFilter) : gpus;

  return (
    <TooltipProvider delayDuration={100}>
      <div className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(14px, 1fr))` }} data-testid="gpu-heatmap">
        {filtered.map((gpu) => (
          <Tooltip key={gpu.id}>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={t('heatmap.ariaGpuCell', { id: gpu.id, status: gpu.status, utilization: gpu.utilization })}
                className={`w-3.5 h-3.5 rounded-[2px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${getUtilColor(gpu.utilization, gpu.status)} ${getUtilBorder(gpu.utilization, gpu.status)}`}
                data-testid={`heatmap-cell-${gpu.id}`}
              />
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-zinc-900 border-zinc-700 shadow-xl">
              <div className="space-y-1">
                <p className="font-mono text-xs font-bold">{gpu.id}</p>
                <p className="text-[10px] text-muted-foreground">{gpu.model}</p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px]">
                  <span className="text-muted-foreground">{t('heatmap.tooltipUtil')}</span>
                  <span className="font-mono text-right">{gpu.utilization}%</span>
                  <span className="text-muted-foreground">{t('heatmap.tooltipTemp')}</span>
                  <span className="font-mono text-right">{gpu.temperature}°C</span>
                  <span className="text-muted-foreground">{t('heatmap.tooltipPower')}</span>
                  <span className="font-mono text-right">{gpu.powerDraw}W</span>
                  <span className="text-muted-foreground">{t('heatmap.tooltipVram')}</span>
                  <span className="font-mono text-right">{gpu.memoryUsedGb}/{gpu.memoryTotalGb}GB</span>
                  <span className="text-muted-foreground">{t('heatmap.tooltipStatus')}</span>
                  <span className={`font-mono text-right capitalize ${gpu.status === "error" ? "text-red-400" : gpu.status === "maintenance" ? "text-purple-400" : ""}`}>{gpu.status}</span>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}

export function HeatmapLegend() {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('heatmap.util')}</span>
      {[
        { label: "0-10%", color: "bg-zinc-800" },
        { label: "10-30%", color: "bg-emerald-900/60" },
        { label: "30-50%", color: "bg-emerald-700/60" },
        { label: "50-70%", color: "bg-blue-600/60" },
        { label: "70-85%", color: "bg-blue-500/70" },
        { label: "85-95%", color: "bg-amber-500/70" },
        { label: "95%+", color: "bg-red-500/70" },
      ].map((item) => (
        <div key={item.label} className="flex items-center gap-1">
          <div className={`w-3 h-3 rounded-[2px] ${item.color}`} />
          <span className="text-[10px] text-muted-foreground">{item.label}</span>
        </div>
      ))}
      <div className="ml-2 flex items-center gap-1">
        <div className="w-3 h-3 rounded-[2px] bg-red-500/80 ring-1 ring-red-500/50" />
        <span className="text-[10px] text-muted-foreground">{t('heatmap.error')}</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded-[2px] bg-purple-500/50 ring-1 ring-purple-500/30" />
        <span className="text-[10px] text-muted-foreground">{t('heatmap.maint')}</span>
      </div>
    </div>
  );
}
