import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { SchedulerPolicy } from "@shared/schema";
import { KpiStatCard } from "@/components/kpi-stat-card";
import { HealthBadge } from "@/components/health-badge";
import { DataTable, type Column } from "@/components/data-table";
import { ShieldCheck, CheckCircle2, XCircle, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dcAerialSrc from "@assets/dc-aerial.png";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const CHART_COLORS = [
  "hsl(217, 91%, 60%)",
  "hsl(195, 87%, 55%)",
  "hsl(160, 75%, 50%)",
  "hsl(280, 82%, 60%)",
  "hsl(45, 90%, 55%)",
];

export default function Policies() {
  const { t } = useTranslation();
  const { data = [] } = useQuery<SchedulerPolicy[]>({ queryKey: ["/api/policies"], refetchInterval: 30000 });

  const active = data.filter(p => p.enabled).length;
  const disabled = data.filter(p => !p.enabled).length;
  const typeCounts: Record<string, number> = {};
  data.forEach(p => { typeCounts[p.type] = (typeCounts[p.type] || 0) + 1; });
  const typePie = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
  const uniqueTypes = Object.keys(typeCounts).length;

  const columns: Column<SchedulerPolicy>[] = [
    { key: "name", header: t('policies.tablePolicyName'), render: r => <span className="font-medium">{r.name}</span> },
    { key: "tenant", header: t('policies.tableTenant'), render: r => <span className="text-muted-foreground text-xs">{r.tenantName}</span>, hideOnMobile: true },
    { key: "type", header: t('policies.tableType'), render: r => <HealthBadge status={r.type} showDot={false} /> },
    { key: "rules", header: t('policies.tableRules'), render: r => <span className="font-mono text-[10px] text-muted-foreground">{JSON.stringify(r.rules)}</span>, hideOnMobile: true },
    { key: "enabled", header: t('policies.tableEnabled'), render: r => <HealthBadge status={r.enabled ? "active" : "disabled"} /> },
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
            <h1 className="text-xl md:text-2xl font-display font-bold tracking-tight text-white">{t('policies.title')}</h1>
            <p className="text-sm text-zinc-400 mt-0.5">{t('policies.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiStatCard title={t('policies.totalPolicies')} value={data.length} icon={<ShieldCheck className="w-5 h-5 text-muted-foreground" />} />
        <KpiStatCard title={t('policies.active')} value={active} variant="success" icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />} />
        <KpiStatCard title={t('policies.disabled')} value={disabled} icon={<XCircle className="w-5 h-5 text-zinc-400" />} />
        <KpiStatCard title={t('policies.policyTypes')} value={uniqueTypes} icon={<Layers className="w-5 h-5 text-blue-400" />} />
      </div>

      {/* Policy type distribution chart */}
      {typePie.length > 0 && (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="px-4 pt-4 pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">{t('policies.typeDistribution')}</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-2">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={typePie}
                  cx="50%" cy="50%"
                  innerRadius={50} outerRadius={75}
                  dataKey="value" nameKey="name"
                  strokeWidth={2} stroke="hsl(var(--card))"
                >
                  {typePie.map((_, i) => (
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
              {typePie.map((item, i) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="text-[10px] text-muted-foreground capitalize">{item.name}</span>
                  <span className="text-[10px] font-mono">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card/50 backdrop-blur-sm border-border/50 p-4">
        <DataTable data={data} columns={columns} pageSize={15} />
      </Card>
    </div>
  );
}
