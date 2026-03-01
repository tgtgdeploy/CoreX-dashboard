import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { DashboardData } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Cpu, Server, Activity, ListTodo, DollarSign,
  TrendingUp, TrendingDown, Zap, Shield, Radio,
  AlertTriangle
} from "lucide-react";
import dcHeroSrc from "@assets/dc-hero.png";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
  LineChart, Line
} from "recharts";

const CHART_COLORS = [
  "hsl(217, 91%, 60%)",
  "hsl(195, 87%, 55%)",
  "hsl(160, 75%, 50%)",
  "hsl(280, 82%, 60%)",
  "hsl(45, 90%, 55%)",
];

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString([], { weekday: "short" });
}

function formatNumber(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toFixed(0);
}

function StatCard({ title, value, subtitle, icon: Icon, trend, color, loading }: {
  title: string; value: string; subtitle?: string; icon: any; trend?: number; color: string; loading?: boolean;
}) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="w-9 h-9 rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid={`stat-${title.toLowerCase().replace(/\s/g, "-")}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{title}</p>
            <p className="text-2xl font-bold font-mono tracking-tight mt-1">{value}</p>
            {subtitle && (
              <div className="flex items-center gap-1 mt-1.5">
                {trend !== undefined && (
                  <>
                    {trend >= 0 ? (
                      <TrendingUp className="w-3 h-3 text-status-online" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-status-busy" />
                    )}
                    <span className={`text-xs font-mono ${trend >= 0 ? "text-status-online" : "text-status-busy"}`}>
                      {trend >= 0 ? "+" : ""}{trend.toFixed(1)}%
                    </span>
                  </>
                )}
                <span className="text-xs text-muted-foreground">{subtitle}</span>
              </div>
            )}
          </div>
          <div className={`p-2 rounded-md ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ChartTooltipContent({ active, payload, label, formatter }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-popover-border rounded-md px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-sm font-mono font-medium" style={{ color: entry.color }}>
          {formatter ? formatter(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { t } = useTranslation();
  useEffect(() => { document.title = t('dashboard.pageTitle'); }, [t]);

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
    refetchInterval: 4000,
  });

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-[1600px] mx-auto">
      <div className="relative rounded-xl overflow-hidden mb-2 scan-line gradient-border floating-orbs">
        <img src={dcHeroSrc} alt="Infrastructure" className="w-full h-[140px] md:h-[180px] object-cover brightness-[0.3]" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/60 to-transparent" />
        <div className="absolute inset-0 tech-grid z-[1]" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="absolute inset-0 flex items-center justify-between gap-4 px-6 md:px-8 flex-wrap z-[2]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">{t('common.allSystemsOperational')}</span>
            </div>
            <h1 className="text-xl md:text-2xl font-display font-bold tracking-tight text-white" data-testid="text-page-title">
              {t('dashboard.title')}
            </h1>
            <p className="text-sm text-zinc-400 mt-0.5">
              {t('dashboard.subtitle')}
            </p>
          </div>
          <Badge variant="outline" className="font-mono text-xs border-zinc-600 text-zinc-300 neon-border">
            {new Date().toLocaleTimeString()}
          </Badge>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent z-[3]" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard
          title={t('dashboard.totalGpus')}
          value={data ? data.totalGpus.toLocaleString() : "—"}
          subtitle={t('dashboard.acrossRegions')}
          icon={Cpu}
          color="bg-primary/10 text-primary"
          loading={isLoading}
        />
        <StatCard
          title={t('dashboard.available')}
          value={data ? data.availableGpus.toLocaleString() : "—"}
          subtitle={data ? t('dashboard.idle', { value: ((data.availableGpus / data.totalGpus) * 100).toFixed(1) }) : ""}
          icon={Server}
          color="bg-chart-5/10 text-chart-5"
          loading={isLoading}
        />
        <StatCard
          title={t('dashboard.utilization')}
          value={data ? `${data.utilization}%` : "—"}
          subtitle={t('dashboard.avgAcrossFleet')}
          trend={data?.revenueTrend}
          icon={Activity}
          color="bg-chart-2/10 text-chart-2"
          loading={isLoading}
        />
        <StatCard
          title={t('dashboard.activeTasks')}
          value={data ? `${data.activeTasks}` : "—"}
          subtitle={data ? t('dashboard.queued', { count: data.queuedTasks }) : ""}
          icon={ListTodo}
          color="bg-chart-4/10 text-chart-4"
          loading={isLoading}
        />
        <StatCard
          title={t('dashboard.revenue24h')}
          value={data ? `$${formatNumber(data.revenue24h)}` : "—"}
          subtitle={t('dashboard.vsLastPeriod')}
          trend={data?.revenueTrend}
          icon={DollarSign}
          color="bg-chart-1/10 text-chart-1"
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-zinc-950/60 border-zinc-800/60">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium">{t('dashboard.gpuUtilization24h')}</CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[0] }} />
                <span className="text-[10px] text-muted-foreground">{t('dashboard.utilizationPct')}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-2 pb-2 tech-grid">
            {isLoading ? (
              <Skeleton className="h-[240px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={data?.utilizationHistory}>
                  <defs>
                    <linearGradient id="utilGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS[0]} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="time" tickFormatter={formatTime}
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={false} interval={7}
                  />
                  <YAxis
                    domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false} tickLine={false} width={35}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip content={<ChartTooltipContent formatter={(v: number) => `${v.toFixed(1)}%`} />} />
                  <Area
                    type="monotone" dataKey="value"
                    stroke={CHART_COLORS[0]} strokeWidth={2}
                    fill="url(#utilGradient)"
                    dot={false} activeDot={{ r: 3, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-950/60 border-zinc-800/60">
          <CardHeader className="px-4 pt-4 pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">{t('dashboard.gpuFleetDistribution')}</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-2 tech-grid">
            {isLoading ? (
              <Skeleton className="h-[240px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={data?.gpuModelDistribution}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={80}
                    dataKey="value" nameKey="name"
                    strokeWidth={2} stroke="hsl(var(--card))"
                  >
                    {data?.gpuModelDistribution.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="bg-popover border border-popover-border rounded-md px-3 py-2 shadow-lg">
                          <p className="text-xs text-muted-foreground">{payload[0].name}</p>
                          <p className="text-sm font-mono font-medium">{t('dashboard.gpuCount', { count: Number(payload[0].value) })}</p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            {data && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 px-3 mt-1">
                {data.gpuModelDistribution.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-1.5" data-testid={`text-gpu-model-${i}`}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="text-[10px] text-muted-foreground truncate">{item.name}</span>
                    <span className="text-[10px] font-mono ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-zinc-950/60 border-zinc-800/60">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 px-4 pt-4 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.revenueTrend7d')}</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-2 pb-2 tech-grid">
            {isLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data?.revenueHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="time" tickFormatter={formatDay}
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }} tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false} tickLine={false} width={45}
                    tickFormatter={(v) => `$${formatNumber(v)}`}
                  />
                  <Tooltip content={<ChartTooltipContent formatter={(v: number) => `$${v.toLocaleString()}`} />} />
                  <Bar dataKey="value" fill={CHART_COLORS[2]} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-950/60 border-zinc-800/60">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 px-4 pt-4 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.regionalPerformance')}</CardTitle>
            <Server className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-2 pb-2 tech-grid">
            {isLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data?.regionStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }} tickLine={false}
                  />
                  <YAxis
                    dataKey="region" type="category" width={65}
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false} tickLine={false}
                  />
                  <Tooltip content={<ChartTooltipContent formatter={(v: number) => t('dashboard.gpuCount', { count: Number(v) })} />} />
                  <Bar dataKey="totalGpus" fill={CHART_COLORS[1]} radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1 cyber-corners">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 px-4 pt-4 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.systemHealth')}</CardTitle>
            <Shield className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">{t('dashboard.healthScore')}</span>
                  <span className="text-lg font-mono font-bold text-status-online">{data?.healthScore}%</span>
                </div>
                <div className="flex items-center justify-between py-2 border-t">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-chart-2" />
                    <span className="text-sm text-muted-foreground">{t('dashboard.powerDraw')}</span>
                  </div>
                  <span className="text-sm font-mono">{data?.totalPowerKw} kW</span>
                </div>
                <div className="flex items-center justify-between py-2 border-t">
                  <div className="flex items-center gap-2">
                    <Radio className="w-3.5 h-3.5 text-chart-4" />
                    <span className="text-sm text-muted-foreground">{t('dashboard.activeEndpoints')}</span>
                  </div>
                  <span className="text-sm font-mono">{data?.activeEndpoints}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-t">
                  <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-chart-5" />
                    <span className="text-sm text-muted-foreground">{t('dashboard.completed24h')}</span>
                  </div>
                  <span className="text-sm font-mono">{data?.completedTasks24h}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-t">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-status-busy" />
                    <span className="text-sm text-muted-foreground">{t('dashboard.failed24h')}</span>
                  </div>
                  <span className="text-sm font-mono text-status-busy">{data?.failedTasks24h}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 px-4 pt-4 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.recentAlerts')}</CardTitle>
            <Badge variant="outline" className="text-[10px] font-mono">
              {data?.recentAlerts?.length || 0} {t('common.recent')}
            </Badge>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <div className="space-y-1.5">
                {data?.recentAlerts?.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 p-2.5 rounded-md bg-muted/30"
                    data-testid={`alert-${alert.id}`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                      alert.severity === "critical" ? "bg-status-busy" :
                      alert.severity === "warning" ? "bg-status-away" : "bg-primary"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{alert.title}</span>
                        <Badge
                          variant={alert.severity === "critical" ? "destructive" : "secondary"}
                          className="text-[9px] px-1.5 py-0"
                        >
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{alert.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-muted-foreground font-mono">{alert.dcName}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 px-4 pt-4 pb-2">
          <CardTitle className="text-sm font-medium">{t('dashboard.topTenantsByRevenue')}</CardTitle>
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {data?.topTenants?.map((tenant, idx) => (
                <div
                  key={tenant.name}
                  className="flex items-center gap-3 p-3 rounded-md bg-muted/30"
                  data-testid={`tenant-${idx}`}
                >
                  <div
                    className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0"
                    style={{ background: CHART_COLORS[idx % CHART_COLORS.length] }}
                  >
                    {tenant.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{tenant.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[11px] text-muted-foreground font-mono">{t('dashboard.gpuHours', { hours: tenant.gpuHours })}</span>
                      <span className="text-[11px] font-mono text-status-online">${tenant.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
