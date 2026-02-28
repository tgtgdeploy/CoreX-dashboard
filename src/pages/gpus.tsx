import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { GpuSummary } from "@shared/schema";
import { KpiStatCard } from "@/components/kpi-stat-card";
import { HealthBadge } from "@/components/health-badge";
import { DataTable, type Column } from "@/components/data-table";
import { Cpu, Zap, Thermometer, AlertTriangle, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const FILTERS = ["all", "busy", "idle", "error", "maintenance"] as const;

export default function Gpus() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<string>("all");
  const { data = [] } = useQuery<GpuSummary[]>({ queryKey: ["/api/gpus"], refetchInterval: 5000 });

  const filtered = filter === "all" ? data : data.filter(g => g.status === filter);
  const busy = data.filter(g => g.status === "busy").length;
  const idle = data.filter(g => g.status === "idle").length;
  const errors = data.filter(g => g.status === "error").length;
  const avgUtil = data.length ? Math.round(data.reduce((s, g) => s + g.utilization, 0) / data.length * 10) / 10 : 0;
  const avgTemp = data.length ? Math.round(data.reduce((s, g) => s + g.temperature, 0) / data.length * 10) / 10 : 0;

  const columns: Column<GpuSummary>[] = [
    { key: "id", header: t('gpus.tableId'), render: r => <span className="font-mono text-xs">{r.id}</span> },
    { key: "node", header: t('gpus.tableNode'), render: r => <span className="text-xs text-muted-foreground">{r.nodeHostname}</span>, hideOnMobile: true },
    { key: "dc", header: t('gpus.tableDc'), render: r => <span className="text-xs text-muted-foreground">{r.dcName}</span>, hideOnMobile: true },
    { key: "model", header: t('gpus.tableModel'), render: r => <span className="font-medium">{r.model}</span> },
    { key: "vram", header: t('gpus.tableVram'), render: r => `${r.vramGb}GB`, hideOnMobile: true },
    { key: "util", header: t('gpus.tableUtilization'), render: r => (
      <div className="flex items-center gap-2 min-w-[100px]">
        <Progress value={r.utilization} className="h-1.5 flex-1" />
        <span className="font-mono text-xs w-10 text-right">{r.utilization}%</span>
      </div>
    )},
    { key: "temp", header: t('gpus.tableTemp'), render: r => <span className={cn("font-mono text-xs", r.temperature > 80 ? "text-red-400" : r.temperature > 70 ? "text-amber-400" : "")}>{r.temperature}°C</span>, hideOnMobile: true },
    { key: "power", header: t('gpus.tablePower'), render: r => <span className="font-mono text-xs">{r.powerDraw}W</span>, hideOnMobile: true },
    { key: "mem", header: t('gpus.tableMemory'), render: r => <span className="text-xs">{r.memoryUsedGb}/{r.memoryTotalGb}GB</span>, hideOnMobile: true },
    { key: "status", header: t('gpus.tableStatus'), render: r => <HealthBadge status={r.status} /> },
    { key: "ecc", header: t('gpus.tableEcc'), render: r => r.eccErrors > 0 ? <span className="text-red-400 font-mono text-xs">{r.eccErrors}</span> : <span className="text-muted-foreground text-xs">0</span>, hideOnMobile: true },
  ];

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-display font-bold">{t('gpus.title')}</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <KpiStatCard title={t('gpus.totalGpus')} value={data.length} icon={<Cpu className="w-5 h-5 text-muted-foreground" />} />
        <KpiStatCard title={t('gpus.busy')} value={busy} icon={<Activity className="w-5 h-5 text-blue-400" />} />
        <KpiStatCard title={t('gpus.idle')} value={idle} icon={<Cpu className="w-5 h-5 text-slate-400" />} />
        <KpiStatCard title={t('gpus.error')} value={errors} variant={errors > 0 ? "critical" : "default"} icon={<AlertTriangle className="w-5 h-5 text-red-400" />} />
        <KpiStatCard title={t('gpus.avgUtil')} value={`${avgUtil}%`} icon={<Zap className="w-5 h-5 text-muted-foreground" />} />
        <KpiStatCard title={t('gpus.avgTemp')} value={`${avgTemp}°C`} icon={<Thermometer className="w-5 h-5 text-muted-foreground" />} />
      </div>
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 p-4">
        <div className="flex flex-nowrap gap-1.5 mb-4 overflow-x-auto">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn("px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-mono uppercase transition-colors shrink-0",
                filter === f ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:text-foreground"
              )}>
              {t(`gpus.filter_${f}`)} {f !== "all" ? `(${data.filter(g => g.status === f).length})` : `(${data.length})`}
            </button>
          ))}
        </div>
        <DataTable data={filtered} columns={columns} pageSize={20} />
      </Card>
    </div>
  );
}
