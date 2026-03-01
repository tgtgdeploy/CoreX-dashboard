import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { Tenant } from "@shared/schema";
import { KpiStatCard } from "@/components/kpi-stat-card";
import { HealthBadge } from "@/components/health-badge";
import { DataTable, type Column } from "@/components/data-table";
import { Building2, DollarSign, Cpu, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import dcAerialSrc from "@assets/dc-aerial.png";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from "recharts";

const CHART_COLORS = [
  "hsl(280, 82%, 60%)",
  "hsl(217, 91%, 60%)",
  "hsl(160, 75%, 50%)",
  "hsl(45, 90%, 55%)",
  "hsl(195, 87%, 55%)",
];

export default function Tenants() {
  const { t } = useTranslation();
  const { data = [] } = useQuery<Tenant[]>({ queryKey: ["/api/tenants"], refetchInterval: 30000 });

  const totalMrr = data.reduce((s, tn) => s + tn.mrr, 0);
  const totalGpuUsed = data.reduce((s, tn) => s + tn.gpuUsed, 0);
  const enterprise = data.filter(tn => tn.tier === "enterprise").length;

  // Tier distribution donut
  const tierCounts: Record<string, number> = {};
  data.forEach(tn => { tierCounts[tn.tier] = (tierCounts[tn.tier] || 0) + 1; });
  const tierDonut = Object.entries(tierCounts).map(([name, value]) => ({ name, value }));

  // MRR by tier bar chart
  const mrrByTier: Record<string, number> = {};
  data.forEach(tn => { mrrByTier[tn.tier] = (mrrByTier[tn.tier] || 0) + tn.mrr; });
  const mrrBars = Object.entries(mrrByTier).map(([name, mrr]) => ({ name, mrr }));

  const columns: Column<Tenant>[] = [
    { key: "name", header: t('tenants.tableTenant'), render: r => <span className="font-medium">{r.name}</span> },
    { key: "tier", header: t('tenants.tableTier'), render: r => <HealthBadge status={r.tier} showDot={false} /> },
    { key: "status", header: t('tenants.tableStatus'), render: r => <HealthBadge status={r.status} /> },
    { key: "mrr", header: t('tenants.tableMrr'), render: r => <span className="font-mono">${r.mrr.toLocaleString()}</span> },
    { key: "gpu", header: t('tenants.tableGpuUsage'), render: r => (
      <div className="flex items-center gap-2 min-w-[120px]">
        <Progress value={(r.gpuUsed / r.gpuQuota) * 100} className="h-1.5 flex-1" />
        <span className="font-mono text-xs">{r.gpuUsed}/{r.gpuQuota}</span>
      </div>
    )},
    { key: "email", header: t('tenants.tableContact'), render: r => <span className="text-xs text-muted-foreground">{r.contactEmail}</span>, hideOnMobile: true },
    { key: "created", header: t('tenants.tableSince'), render: r => new Date(r.createdAt).toLocaleDateString(), hideOnMobile: true },
  ];

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Hero Banner */}
      <div className="relative rounded-xl overflow-hidden mb-2">
        <img src={dcAerialSrc} alt="Infrastructure" className="w-full h-[120px] md:h-[160px] object-cover brightness-[0.3]" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/60 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-between gap-4 px-6 md:px-8 flex-wrap hero-shimmer">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">{t('common.allSystemsOperational')}</span>
            </div>
            <h1 className="text-xl md:text-2xl font-display font-bold tracking-tight text-white">{t('tenants.title')}</h1>
            <p className="text-sm text-zinc-400 mt-0.5">{t('tenants.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiStatCard title={t('tenants.totalTenants')} value={data.length} icon={<Building2 className="w-5 h-5 text-muted-foreground" />} />
        <KpiStatCard title={t('tenants.enterprise')} value={enterprise} icon={<Users className="w-5 h-5 text-purple-400" />} />
        <KpiStatCard title={t('tenants.totalMrr')} value={`$${(totalMrr / 1000).toFixed(0)}K`} icon={<DollarSign className="w-5 h-5 text-emerald-400" />} />
        <KpiStatCard title={t('tenants.gpusAllocated')} value={totalGpuUsed} icon={<Cpu className="w-5 h-5 text-muted-foreground" />} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="px-4 pt-4 pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">{t('tenants.mrrByTier')}</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-2">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={mrrBars}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={{ stroke: "hsl(var(--border))" }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={50} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-popover border border-popover-border rounded-md px-3 py-2 shadow-lg">
                        <p className="text-xs text-muted-foreground capitalize">{label}</p>
                        <p className="text-sm font-mono font-medium">${Number(payload[0].value).toLocaleString()}</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="mrr" radius={[3, 3, 0, 0]}>
                  {mrrBars.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="px-4 pt-4 pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">{t('tenants.tierDistribution')}</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-2">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={tierDonut}
                  cx="50%" cy="50%"
                  innerRadius={50} outerRadius={75}
                  dataKey="value" nameKey="name"
                  strokeWidth={2} stroke="hsl(var(--card))"
                >
                  {tierDonut.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-popover border border-popover-border rounded-md px-3 py-2 shadow-lg">
                        <p className="text-xs text-muted-foreground capitalize">{payload[0].name}</p>
                        <p className="text-sm font-mono font-medium">{Number(payload[0].value)}</p>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 px-3 mt-1">
              {tierDonut.map((item, i) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="text-[10px] text-muted-foreground capitalize">{item.name}</span>
                  <span className="text-[10px] font-mono">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50 p-4">
        <DataTable data={data} columns={columns} pageSize={15} />
      </Card>
    </div>
  );
}
