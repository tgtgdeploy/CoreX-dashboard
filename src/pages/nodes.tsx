import { useQuery } from "@tanstack/react-query";
import type { Node } from "@shared/schema";
import { KpiStatCard } from "@/components/kpi-stat-card";
import { HealthBadge } from "@/components/health-badge";
import { DataTable, type Column } from "@/components/data-table";
import { HardDrive, Server, Wrench, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";

const columns: Column<Node>[] = [
  { key: "host", header: "Hostname", render: r => <span className="font-mono text-xs">{r.hostname}</span> },
  { key: "dc", header: "DC", render: r => <span className="text-muted-foreground text-xs">{r.dcName}</span>, hideOnMobile: true },
  { key: "cluster", header: "Cluster", render: r => r.clusterName, hideOnMobile: true },
  { key: "gpus", header: "GPUs", render: r => <span>{r.gpuCount}x {r.gpuModel}</span> },
  { key: "cpu", header: "CPU", render: r => <span className="text-xs text-muted-foreground truncate max-w-[140px] block">{r.cpu}</span>, hideOnMobile: true },
  { key: "ram", header: "RAM", render: r => `${r.ramGb} GB`, hideOnMobile: true },
  { key: "status", header: "Status", render: r => <HealthBadge status={r.status} /> },
  { key: "util", header: "Util", render: r => <span className="font-mono">{r.utilization}%</span> },
];

export default function Nodes() {
  const { data = [] } = useQuery<Node[]>({ queryKey: ["/api/nodes"], refetchInterval: 15000 });
  const online = data.filter(n => n.status === "online").length;
  const maint = data.filter(n => n.status === "maintenance").length;
  const avgUtil = data.length ? Math.round(data.reduce((s, n) => s + n.utilization, 0) / data.length * 10) / 10 : 0;

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-display font-bold">Nodes</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiStatCard title="Total Nodes" value={data.length} icon={<HardDrive className="w-5 h-5 text-muted-foreground" />} />
        <KpiStatCard title="Online" value={online} variant="success" icon={<Server className="w-5 h-5 text-emerald-400" />} />
        <KpiStatCard title="Maintenance" value={maint} variant={maint > 0 ? "warning" : "default"} icon={<Wrench className="w-5 h-5 text-amber-400" />} />
        <KpiStatCard title="Avg Utilization" value={`${avgUtil}%`} icon={<Activity className="w-5 h-5 text-muted-foreground" />} />
      </div>
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 p-4">
        <DataTable data={data} columns={columns} pageSize={15} />
      </Card>
    </div>
  );
}
