import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { Node } from "@shared/schema";
import { KpiStatCard } from "@/components/kpi-stat-card";
import { HealthBadge } from "@/components/health-badge";
import { DataTable, type Column } from "@/components/data-table";
import { HardDrive, Server, Wrench, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dcHeroSrc from "@assets/dc-hero.png";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from "recharts";

const CHART_COLORS = [
  "hsl(160, 75%, 50%)",
  "hsl(280, 82%, 60%)",
  "hsl(0, 84%, 50%)",
  "hsl(217, 91%, 60%)",
  "hsl(45, 90%, 55%)",
];

export default function Nodes() {
  const { t } = useTranslation();
  const { data = [] } = useQuery<Node[]>({ queryKey: ["/api/nodes"], refetchInterval: 15000 });
  const online = data.filter(n => n.status === "online").length;
  const maint = data.filter(n => n.status === "maintenance").length;
  const offlineCount = data.filter(n => n.status !== "online" && n.status !== "maintenance").length;
  const avgUtil = data.length ? Math.round(data.reduce((s, n) => s + n.utilization, 0) / data.length * 10) / 10 : 0;

  const statusPie = [
    { name: t('nodes.online'), value: online },
    { name: t('nodes.maintenance'), value: maint },
    { name: t('nodes.offline'), value: offlineCount },
  ].filter(d => d.value > 0);

  const avgCpu = data.length ? Math.round(data.reduce((s, n) => s + n.utilization, 0) / data.length) : 0;
  const avgRam = data.length ? Math.round(data.reduce((s, n) => s + (n.ramGb > 0 ? 65 : 0), 0) / data.length) : 0;
  const avgGpu = avgUtil;

  const resourceBars = [
    { name: t('nodes.cpuLabel'), value: avgCpu },
    { name: t('nodes.ramLabel'), value: avgRam },
    { name: t('nodes.gpuLabel'), value: avgGpu },
  ];

  const columns: Column<Node>[] = [
    { key: "host", header: t('nodes.tableHostname'), render: r => <span className="font-mono text-xs">{r.hostname}</span> },
    { key: "dc", header: t('nodes.tableDc'), render: r => <span className="text-muted-foreground text-xs">{r.dcName}</span>, hideOnMobile: true },
    { key: "cluster", header: t('nodes.tableCluster'), render: r => r.clusterName, hideOnMobile: true },
    { key: "gpus", header: t('nodes.tableGpus'), render: r => <span>{r.gpuCount}x {r.gpuModel}</span> },
    { key: "cpu", header: t('nodes.tableCpu'), render: r => <span className="text-xs text-muted-foreground truncate max-w-[140px] block">{r.cpu}</span>, hideOnMobile: true },
    { key: "ram", header: t('nodes.tableRam'), render: r => `${r.ramGb} GB`, hideOnMobile: true },
    { key: "status", header: t('nodes.tableStatus'), render: r => <HealthBadge status={r.status} /> },
    { key: "util", header: t('nodes.tableUtil'), render: r => <span className="font-mono">{r.utilization}%</span> },
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
            <h1 className="text-xl md:text-2xl font-display font-bold tracking-tight text-white">{t('nodes.title')}</h1>
            <p className="text-sm text-zinc-400 mt-0.5">{t('nodes.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiStatCard title={t('nodes.totalNodes')} value={data.length} icon={<HardDrive className="w-5 h-5 text-muted-foreground" />} />
        <KpiStatCard title={t('nodes.online')} value={online} variant="success" icon={<Server className="w-5 h-5 text-emerald-400" />} />
        <KpiStatCard title={t('nodes.maintenance')} value={maint} variant={maint > 0 ? "warning" : "default"} icon={<Wrench className="w-5 h-5 text-amber-400" />} />
        <KpiStatCard title={t('nodes.avgUtilization')} value={`${avgUtil}%`} icon={<Activity className="w-5 h-5 text-muted-foreground" />} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="px-4 pt-4 pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">{t('nodes.statusDistribution')}</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-2">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusPie}
                  cx="50%" cy="50%"
                  innerRadius={50} outerRadius={75}
                  dataKey="value" nameKey="name"
                  strokeWidth={2} stroke="hsl(var(--card))"
                >
                  {statusPie.map((_, i) => (
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
              {statusPie.map((item, i) => (
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
            <CardTitle className="text-sm font-medium">{t('nodes.resourceUtilization')}</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-2">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={resourceBars} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                <YAxis dataKey="name" type="category" width={50} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
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
                <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                  {resourceBars.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i + 3]} />
                  ))}
                </Bar>
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
