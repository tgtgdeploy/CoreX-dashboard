import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import type { BillingData } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from "@/components/ui/table";
import {
  DollarSign, TrendingUp, AlertCircle, CreditCard, Receipt
} from "lucide-react";
import dcAerialSrc from "@assets/dc-aerial.png";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

const CHART_COLORS = [
  "hsl(217, 91%, 60%)",
  "hsl(195, 87%, 55%)",
  "hsl(160, 75%, 50%)",
  "hsl(280, 82%, 60%)",
  "hsl(45, 90%, 55%)",
  "hsl(340, 80%, 55%)",
];

function formatMonth(iso: string) {
  return new Date(iso).toLocaleDateString([], { month: "short", year: "2-digit" });
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: "bg-status-online/10 text-status-online border-status-online/20",
    pending: "bg-status-away/10 text-status-away border-status-away/20",
    overdue: "bg-status-busy/10 text-status-busy border-status-busy/20",
  };
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wide border ${styles[status] || ""}`}>
      {status}
    </span>
  );
}

export default function Billing() {
  const { t } = useTranslation();
  useEffect(() => { document.title = t('billing.pageTitle'); }, []);
  const { data, isLoading } = useQuery<BillingData>({
    queryKey: ["/api/billing"],
    refetchInterval: 30000,
  });

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-[1600px] mx-auto">
      {/* Hero Banner */}
      <div className="relative rounded-xl overflow-hidden mb-2 scan-line gradient-border">
        <img src={dcAerialSrc} alt="Infrastructure" className="w-full h-[140px] md:h-[180px] object-cover brightness-[0.3]" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/60 to-transparent" />
        <div className="absolute inset-0 tech-grid z-[1]" />
        <div className="absolute inset-0 flex items-center justify-between gap-4 px-6 md:px-8 flex-wrap hero-shimmer z-[2]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">{t('common.allSystemsOperational')}</span>
            </div>
            <h1 className="text-xl md:text-2xl font-display font-bold tracking-tight text-white" data-testid="text-page-title">
              {t('billing.title')}
            </h1>
            <p className="text-sm text-zinc-400 mt-0.5">{t('billing.subtitle')}</p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent z-[3]" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: t('billing.totalRevenue'), value: data ? `$${(data.totalRevenue / 1000).toFixed(0)}K` : "—", icon: DollarSign, color: "text-chart-1" },
          { label: t('billing.monthlyRevenue'), value: data ? `$${(data.monthlyRevenue / 1000).toFixed(0)}K` : "—", icon: TrendingUp, color: "text-status-online" },
          { label: t('billing.outstanding'), value: data ? `$${(data.outstandingAmount / 1000).toFixed(0)}K` : "—", icon: AlertCircle, color: "text-status-away" },
          { label: t('billing.activeInvoices'), value: data ? `${data.records.filter(r => r.status !== "paid").length}` : "—", icon: Receipt, color: "text-chart-4" },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="p-4 flex items-center gap-3">
              {isLoading ? (
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
              ) : (
                <>
                  <div className={`p-2 rounded-md bg-muted/50`}>
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-xl font-mono font-bold">{item.value}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader className="px-4 pt-4 pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">{t('billing.monthlyRevenueTrend')}</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-2">
            {isLoading ? <Skeleton className="h-[240px] w-full" /> : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data?.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="time" tickFormatter={formatMonth} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={{ stroke: "hsl(var(--border))" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={50} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                  <Tooltip content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-popover border border-popover-border rounded-md px-3 py-2 shadow-lg">
                        <p className="text-xs text-muted-foreground">{label ? formatMonth(label) : ""}</p>
                        <p className="text-sm font-mono font-medium" style={{ color: CHART_COLORS[0] }}>${Number(payload[0].value).toLocaleString()}</p>
                      </div>
                    );
                  }} />
                  <Bar dataKey="value" fill={CHART_COLORS[0]} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-4 pt-4 pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">{t('billing.revenueByTier')}</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-2">
            {isLoading ? <Skeleton className="h-[180px] w-full" /> : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={data?.revenueByTier} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="revenue" nameKey="tier" strokeWidth={2} stroke="hsl(var(--card))">
                      {data?.revenueByTier.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="bg-popover border border-popover-border rounded-md px-3 py-2 shadow-lg">
                          <p className="text-xs text-muted-foreground">{payload[0].name}</p>
                          <p className="text-sm font-mono font-medium">${Number(payload[0].value).toLocaleString()}</p>
                        </div>
                      );
                    }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 px-3">
                  {data?.revenueByTier.map((item, i) => (
                    <div key={item.tier} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CHART_COLORS[i] }} />
                      <span className="text-xs text-muted-foreground flex-1">{item.tier}</span>
                      <span className="text-xs font-mono">${(item.revenue / 1000).toFixed(0)}K</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 px-4 pt-4 pb-2">
          <CardTitle className="text-sm font-medium">{t('billing.costBreakdown')}</CardTitle>
          <CreditCard className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {data?.costBreakdown.map((item, i) => {
                const totalCost = data.costBreakdown.reduce((s, c) => s + c.amount, 0);
                const pct = ((item.amount / totalCost) * 100).toFixed(1);
                return (
                  <div key={item.category} className="flex items-center gap-3 p-3 rounded-md bg-muted/30" data-testid={`cost-${i}`}>
                    <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{item.category}</p>
                      <p className="text-xs text-muted-foreground">{t('billing.ofCosts', { pct })}</p>
                    </div>
                    <span className="text-sm font-mono font-medium">${(item.amount / 1000).toFixed(1)}K</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 px-4 pt-4 pb-2">
          <CardTitle className="text-sm font-medium">{t('billing.invoiceHistory')}</CardTitle>
          <Badge variant="outline" className="text-[10px] font-mono">{data?.records.length || 0} {t('common.records')}</Badge>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">{t('billing.tableInvoice')}</TableHead>
                  <TableHead className="text-xs">{t('billing.tableTenant')}</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">{t('billing.tableTier')}</TableHead>
                  <TableHead className="text-xs">{t('billing.tablePeriod')}</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">{t('billing.tableGpuHours')}</TableHead>
                  <TableHead className="text-xs text-right">{t('billing.tableAmount')}</TableHead>
                  <TableHead className="text-xs">{t('billing.tableStatus')}</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">{t('billing.tableDueDate')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(8)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(8)].map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-16" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  data?.records.map((record) => (
                    <TableRow key={record.id} data-testid={`invoice-row-${record.id}`}>
                      <TableCell className="font-mono text-xs">{record.id}</TableCell>
                      <TableCell className="text-xs">{record.tenantName}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">{record.tier}</Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono">{record.period}</TableCell>
                      <TableCell className="text-xs font-mono hidden md:table-cell">{record.gpuHours.toLocaleString()}</TableCell>
                      <TableCell className="text-xs font-mono text-right">${record.amount.toLocaleString()}</TableCell>
                      <TableCell><StatusBadge status={record.status} /></TableCell>
                      <TableCell className="text-xs hidden md:table-cell">{record.dueDate}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
