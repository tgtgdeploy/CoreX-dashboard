import { useEffect } from "react";
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
  useEffect(() => { document.title = "Billing & Revenue | CoreX"; }, []);
  const { data, isLoading } = useQuery<BillingData>({
    queryKey: ["/api/billing"],
    refetchInterval: 30000,
  });

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-xl md:text-2xl font-display font-bold tracking-tight" data-testid="text-page-title">
          Billing & Revenue
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Financial overview and invoice management
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Revenue", value: data ? `$${(data.totalRevenue / 1000).toFixed(0)}K` : "—", icon: DollarSign, color: "text-chart-1" },
          { label: "Monthly Revenue", value: data ? `$${(data.monthlyRevenue / 1000).toFixed(0)}K` : "—", icon: TrendingUp, color: "text-status-online" },
          { label: "Outstanding", value: data ? `$${(data.outstandingAmount / 1000).toFixed(0)}K` : "—", icon: AlertCircle, color: "text-status-away" },
          { label: "Active Invoices", value: data ? `${data.records.filter(r => r.status !== "paid").length}` : "—", icon: Receipt, color: "text-chart-4" },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="px-4 pt-4 pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Monthly Revenue Trend</CardTitle>
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
            <CardTitle className="text-sm font-medium">Revenue by Tier</CardTitle>
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
          <CardTitle className="text-sm font-medium">Cost Breakdown (Current Month)</CardTitle>
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
                      <p className="text-xs text-muted-foreground">{pct}% of costs</p>
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
          <CardTitle className="text-sm font-medium">Invoice History</CardTitle>
          <Badge variant="outline" className="text-[10px] font-mono">{data?.records.length || 0} records</Badge>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Invoice</TableHead>
                  <TableHead className="text-xs">Tenant</TableHead>
                  <TableHead className="text-xs">Tier</TableHead>
                  <TableHead className="text-xs">Period</TableHead>
                  <TableHead className="text-xs">GPU Hours</TableHead>
                  <TableHead className="text-xs text-right">Amount</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Due Date</TableHead>
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
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">{record.tier}</Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono">{record.period}</TableCell>
                      <TableCell className="text-xs font-mono">{record.gpuHours.toLocaleString()}</TableCell>
                      <TableCell className="text-xs font-mono text-right">${record.amount.toLocaleString()}</TableCell>
                      <TableCell><StatusBadge status={record.status} /></TableCell>
                      <TableCell className="text-xs">{record.dueDate}</TableCell>
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
