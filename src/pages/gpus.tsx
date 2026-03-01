import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { GpuSummary } from "@shared/schema";
import { KpiStatCard } from "@/components/kpi-stat-card";
import { HealthBadge } from "@/components/health-badge";
import { DataTable, type Column } from "@/components/data-table";
import { Cpu, Zap, Thermometer, AlertTriangle, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import dcHeroSrc from "@assets/dc-hero.png";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from "recharts";

const CHART_COLORS = [
  "hsl(217, 91%, 60%)",
  "hsl(195, 87%, 55%)",
  "hsl(160, 75%, 50%)",
  "hsl(280, 82%, 60%)",
  "hsl(45, 90%, 55%)",
];

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

  // GPU model distribution
  const modelCounts: Record<string, number> = {};
  data.forEach(g => { modelCounts[g.model] = (modelCounts[g.model] || 0) + 1; });
  const modelPie = Object.entries(modelCounts).map(([name, value]) => ({ name, value }));

  // Temperature distribution
  const tempBins = [
    { name: "<50°C", value: data.filter(g => g.temperature < 50).length },
    { name: "50-65°C", value: data.filter(g => g.temperature >= 50 && g.temperature < 65).length },
    { name: "65-80°C", value: data.filter(g => g.temperature >= 65 && g.temperature < 80).length },
    { name: ">80°C", value: data.filter(g => g.temperature >= 80).length },
  ].filter(d => d.value > 0);

  const TEMP_COLORS = ["hsl(217, 91%, 60%)", "hsl(160, 75%, 50%)", "hsl(45, 90%, 55%)", "hsl(0, 84%, 50%)"];

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
      {/* Hero Banner */}
      <div className="relative rounded-xl overflow-hidden mb-2">
        <img src={dcHeroSrc} alt="Infrastructure" className="w-full h-[120px] md:h-[160px] object-cover brightness-[0.3]" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/60 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-between gap-4 px-6 md:px-8 flex-wrap hero-shimmer">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">{t('common.allSystemsOperational')}</span>
            </div>
            <h1 className="text-xl md:text-2xl font-display font-bold tracking-tight text-white">{t('gpus.title')}</h1>
            <p className="text-sm text-zinc-400 mt-0.5">{t('gpus.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <KpiStatCard title={t('gpus.totalGpus')} value={data.length} icon={<Cpu className="w-5 h-5 text-muted-foreground" />} />
        <KpiStatCard title={t('gpus.busy')} value={busy} icon={<Activity className="w-5 h-5 text-blue-400" />} />
        <KpiStatCard title={t('gpus.idle')} value={idle} icon={<Cpu className="w-5 h-5 text-slate-400" />} />
        <KpiStatCard title={t('gpus.error')} value={errors} variant={errors > 0 ? "critical" : "default"} icon={<AlertTriangle className="w-5 h-5 text-red-400" />} />
        <KpiStatCard title={t('gpus.avgUtil')} value={`${avgUtil}%`} icon={<Zap className="w-5 h-5 text-muted-foreground" />} />
        <KpiStatCard title={t('gpus.avgTemp')} value={`${avgTemp}°C`} icon={<Thermometer className="w-5 h-5 text-muted-foreground" />} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="px-4 pt-4 pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">{t('gpus.modelDistribution')}</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-2">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={modelPie}
                  cx="50%" cy="50%"
                  innerRadius={50} outerRadius={75}
                  dataKey="value" nameKey="name"
                  strokeWidth={2} stroke="hsl(var(--card))"
                >
                  {modelPie.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-popover border border-popover-border rounded-md px-3 py-2 shadow-lg">
                        <p className="text-xs text-muted-foreground">{payload[0].name}</p>
                        <p className="text-sm font-mono font-medium">{Number(payload[0].value)} GPUs</p>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 px-3 mt-1">
              {modelPie.map((item, i) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="text-[10px] text-muted-foreground truncate">{item.name}</span>
                  <span className="text-[10px] font-mono ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="px-4 pt-4 pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">{t('gpus.temperatureDistribution')}</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-2">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={tempBins}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={{ stroke: "hsl(var(--border))" }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={35} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-popover border border-popover-border rounded-md px-3 py-2 shadow-lg">
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="text-sm font-mono font-medium">{Number(payload[0].value)} GPUs</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                  {tempBins.map((_, i) => (
                    <Cell key={i} fill={TEMP_COLORS[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
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
