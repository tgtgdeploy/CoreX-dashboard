import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { Queue } from "@shared/schema";
import { KpiStatCard } from "@/components/kpi-stat-card";
import { HealthBadge } from "@/components/health-badge";
import { DataTable, type Column } from "@/components/data-table";
import { Layers, Activity, Cpu, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import dcHeroSrc from "@assets/dc-hero.png";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from "recharts";

const CHART_COLORS = [
  "hsl(0, 84%, 50%)",
  "hsl(45, 90%, 55%)",
  "hsl(217, 91%, 60%)",
  "hsl(160, 75%, 50%)",
  "hsl(280, 82%, 60%)",
];

export default function Queues() {
  const { t } = useTranslation();
  const { data = [] } = useQuery<Queue[]>({ queryKey: ["/api/queues"], refetchInterval: 5000 });
  const totalPending = data.reduce((s, q) => s + q.pendingJobs, 0);
  const totalUsed = data.reduce((s, q) => s + q.usedGpu, 0);
  const totalQuota = data.reduce((s, q) => s + q.quotaGpu, 0);

  // Priority distribution donut
  const priorityCounts: Record<string, number> = {};
  data.forEach(q => { priorityCounts[`P${q.priority}`] = (priorityCounts[`P${q.priority}`] || 0) + 1; });
  const priorityDonut = Object.entries(priorityCounts)
    .sort(([a], [b]) => Number(a.slice(1)) - Number(b.slice(1)))
    .map(([name, value]) => ({ name, value }));

  // GPU quota utilization bars
  const quotaBars = data.map(q => ({
    name: q.name.length > 14 ? q.name.slice(0, 14) + "…" : q.name,
    used: q.usedGpu,
    quota: q.quotaGpu,
    pct: q.quotaGpu > 0 ? Math.round(q.usedGpu / q.quotaGpu * 100) : 0,
  }));

  const columns: Column<Queue>[] = [
    { key: "name", header: t('queues.tableQueue'), render: r => <span className="font-medium text-sm">{r.name}</span> },
    { key: "tenant", header: t('queues.tableTenant'), render: r => <span className="text-xs text-muted-foreground">{r.tenantName}</span>, hideOnMobile: true },
    { key: "priority", header: t('queues.tablePriority'), render: r => <span className="font-mono">{r.priority}</span> },
    { key: "usage", header: t('queues.tableGpuUsage'), render: r => (
      <div className="flex items-center gap-2 min-w-[120px]">
        <Progress value={(r.usedGpu / r.quotaGpu) * 100} className="h-1.5 flex-1" />
        <span className="font-mono text-xs">{r.usedGpu}/{r.quotaGpu}</span>
      </div>
    )},
    { key: "pending", header: t('queues.tablePending'), render: r => r.pendingJobs > 0 ? <span className="text-amber-400 font-mono">{r.pendingJobs}</span> : <span className="text-muted-foreground">0</span> },
    { key: "status", header: t('queues.tableStatus'), render: r => <HealthBadge status={r.status} /> },
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
            <h1 className="text-xl md:text-2xl font-display font-bold tracking-tight text-white">{t('queues.title')}</h1>
            <p className="text-sm text-zinc-400 mt-0.5">{t('queues.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiStatCard title={t('queues.activeQueues')} value={data.filter(q => q.status === "active").length} icon={<Layers className="w-5 h-5 text-muted-foreground" />} />
        <KpiStatCard title={t('queues.totalPending')} value={totalPending} icon={<Clock className="w-5 h-5 text-amber-400" />} />
        <KpiStatCard title={t('queues.gpusAllocated')} value={totalUsed} subtitle={t('queues.ofQuota', { quota: totalQuota })} icon={<Cpu className="w-5 h-5 text-muted-foreground" />} />
        <KpiStatCard title={t('queues.avgUtilization')} value={totalQuota > 0 ? `${Math.round(totalUsed / totalQuota * 100)}%` : "0%"} icon={<Activity className="w-5 h-5 text-muted-foreground" />} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="px-4 pt-4 pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">{t('queues.priorityDistribution')}</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-2">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={priorityDonut}
                  cx="50%" cy="50%"
                  innerRadius={50} outerRadius={75}
                  dataKey="value" nameKey="name"
                  strokeWidth={2} stroke="hsl(var(--card))"
                >
                  {priorityDonut.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-popover border border-popover-border rounded-md px-3 py-2 shadow-lg">
                        <p className="text-xs text-muted-foreground">{payload[0].name}</p>
                        <p className="text-sm font-mono font-medium">{Number(payload[0].value)} queues</p>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 px-3 mt-1">
              {priorityDonut.map((item, i) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="text-[10px] text-muted-foreground">{item.name}</span>
                  <span className="text-[10px] font-mono">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="px-4 pt-4 pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">{t('queues.gpuQuotaUtilization')}</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-2">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={quotaBars} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-popover border border-popover-border rounded-md px-3 py-2 shadow-lg">
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="text-sm font-mono font-medium">{Number(payload[0].value)}%</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="pct" fill={CHART_COLORS[2]} radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50 p-4">
        <DataTable data={data} columns={columns} pageSize={15} />
      </Card>
    </div>
  );
}
