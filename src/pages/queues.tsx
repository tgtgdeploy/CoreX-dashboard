import { useQuery } from "@tanstack/react-query";
import type { Queue } from "@shared/schema";
import { KpiStatCard } from "@/components/kpi-stat-card";
import { HealthBadge } from "@/components/health-badge";
import { DataTable, type Column } from "@/components/data-table";
import { Layers, Activity, Cpu, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const columns: Column<Queue>[] = [
  { key: "name", header: "Queue", render: r => <span className="font-medium text-sm">{r.name}</span> },
  { key: "tenant", header: "Tenant", render: r => <span className="text-xs text-muted-foreground">{r.tenantName}</span>, hideOnMobile: true },
  { key: "priority", header: "Priority", render: r => <span className="font-mono">{r.priority}</span> },
  { key: "usage", header: "GPU Usage", render: r => (
    <div className="flex items-center gap-2 min-w-[120px]">
      <Progress value={(r.usedGpu / r.quotaGpu) * 100} className="h-1.5 flex-1" />
      <span className="font-mono text-xs">{r.usedGpu}/{r.quotaGpu}</span>
    </div>
  )},
  { key: "pending", header: "Pending", render: r => r.pendingJobs > 0 ? <span className="text-amber-400 font-mono">{r.pendingJobs}</span> : <span className="text-muted-foreground">0</span> },
  { key: "status", header: "Status", render: r => <HealthBadge status={r.status} /> },
];

export default function Queues() {
  const { data = [] } = useQuery<Queue[]>({ queryKey: ["/api/queues"], refetchInterval: 5000 });
  const totalPending = data.reduce((s, q) => s + q.pendingJobs, 0);
  const totalUsed = data.reduce((s, q) => s + q.usedGpu, 0);
  const totalQuota = data.reduce((s, q) => s + q.quotaGpu, 0);

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-display font-bold">Queues</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiStatCard title="Active Queues" value={data.filter(q => q.status === "active").length} icon={<Layers className="w-5 h-5 text-muted-foreground" />} />
        <KpiStatCard title="Total Pending" value={totalPending} icon={<Clock className="w-5 h-5 text-amber-400" />} />
        <KpiStatCard title="GPUs Allocated" value={totalUsed} subtitle={`of ${totalQuota} quota`} icon={<Cpu className="w-5 h-5 text-muted-foreground" />} />
        <KpiStatCard title="Avg Utilization" value={totalQuota > 0 ? `${Math.round(totalUsed / totalQuota * 100)}%` : "0%"} icon={<Activity className="w-5 h-5 text-muted-foreground" />} />
      </div>
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 p-4">
        <DataTable data={data} columns={columns} pageSize={15} />
      </Card>
    </div>
  );
}
