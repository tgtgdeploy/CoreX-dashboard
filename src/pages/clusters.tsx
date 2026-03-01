import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { Cluster } from "@shared/schema";
import { KpiStatCard } from "@/components/kpi-stat-card";
import { HealthBadge } from "@/components/health-badge";
import { DataTable, type Column } from "@/components/data-table";
import { Network, Server, Cpu, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dcHeroSrc from "@assets/dc-hero.png";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from "recharts";

const CHART_COLORS = [
  "hsl(160, 75%, 50%)",
  "hsl(45, 90%, 55%)",
  "hsl(0, 84%, 50%)",
  "hsl(217, 91%, 60%)",
  "hsl(280, 82%, 60%)",
];

export default function Clusters() {
  const { t } = useTranslation();
  const { data = [] } = useQuery<Cluster[]>({ queryKey: ["/api/clusters"], refetchInterval: 15000 });
  const healthy = data.filter(c => c.status === "healthy").length;
  const degraded = data.filter(c => c.status === "degraded").length;
  const offline = data.filter(c => c.status !== "healthy" && c.status !== "degraded").length;
  const avgUtil = data.length ? Math.round(data.reduce((s, c) => s + c.utilization, 0) / data.length * 10) / 10 : 0;

  const healthDonut = [
    { name: t('clusters.healthy'), value: healthy },
    { name: t('clusters.degraded'), value: degraded },
    { name: t('clusters.offline'), value: offline },
  ].filter(d => d.value > 0);

  const utilBars = data.map(c => ({
    name: c.name.length > 12 ? c.name.slice(0, 12) + "…" : c.name,
    utilization: c.utilization,
  }));

  const columns: Column<Cluster>[] = [
    { key: "name", header: t('clusters.tableName'), render: r => <span className="font-mono font-medium">{r.name}</span> },
    { key: "dc", header: t('clusters.tableDataCenter'), render: r => <span className="text-muted-foreground">{r.dcName}</span> },
    { key: "status", header: t('clusters.tableStatus'), render: r => <HealthBadge status={r.status} /> },
    { key: "nodes", header: t('clusters.tableNodes'), render: r => r.nodeCount, hideOnMobile: true },
    { key: "gpus", header: t('clusters.tableGpus'), render: r => r.totalGpus },
    { key: "avail", header: t('clusters.tableAvailable'), render: r => r.availableGpus, hideOnMobile: true },
    { key: "util", header: t('clusters.tableUtilization'), render: r => <span className="font-mono">{r.utilization}%</span> },
    { key: "fabric", header: t('clusters.tableNetwork'), render: r => <span className="text-xs text-muted-foreground">{r.networkFabric}</span>, hideOnMobile: true },
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
            <h1 className="text-xl md:text-2xl font-display font-bold tracking-tight text-white">{t('clusters.title')}</h1>
            <p className="text-sm text-zinc-400 mt-0.5">{t('clusters.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiStatCard title={t('clusters.totalClusters')} value={data.length} icon={<Network className="w-5 h-5 text-muted-foreground" />} />
        <KpiStatCard title={t('clusters.healthy')} value={healthy} variant="success" icon={<Server className="w-5 h-5 text-emerald-400" />} />
        <KpiStatCard title={t('clusters.degraded')} value={degraded} variant={degraded > 0 ? "warning" : "default"} icon={<Activity className="w-5 h-5 text-amber-400" />} />
        <KpiStatCard title={t('clusters.avgUtilization')} value={`${avgUtil}%`} icon={<Cpu className="w-5 h-5 text-muted-foreground" />} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="px-4 pt-4 pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">{t('clusters.healthDistribution')}</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-2">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={healthDonut}
                  cx="50%" cy="50%"
                  innerRadius={50} outerRadius={75}
                  dataKey="value" nameKey="name"
                  strokeWidth={2} stroke="hsl(var(--card))"
                >
                  {healthDonut.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-popover border border-popover-border rounded-md px-3 py-2 shadow-lg">
                        <p className="text-xs text-muted-foreground">{payload[0].name}</p>
                        <p className="text-sm font-mono font-medium">{Number(payload[0].value)}</p>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 px-3 mt-1">
              {healthDonut.map((item, i) => (
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
            <CardTitle className="text-sm font-medium">{t('clusters.utilizationByCluster')}</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-2">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={utilBars} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
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
                <Bar dataKey="utilization" fill={CHART_COLORS[3]} radius={[0, 3, 3, 0]} />
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
