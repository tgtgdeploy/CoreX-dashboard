import { useQuery } from "@tanstack/react-query";
import type { Tenant } from "@shared/schema";
import { KpiStatCard } from "@/components/kpi-stat-card";
import { HealthBadge } from "@/components/health-badge";
import { DataTable, type Column } from "@/components/data-table";
import { Building2, DollarSign, Cpu, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const columns: Column<Tenant>[] = [
  { key: "name", header: "Tenant", render: r => <span className="font-medium">{r.name}</span> },
  { key: "tier", header: "Tier", render: r => <HealthBadge status={r.tier} showDot={false} /> },
  { key: "status", header: "Status", render: r => <HealthBadge status={r.status} /> },
  { key: "mrr", header: "MRR", render: r => <span className="font-mono">${r.mrr.toLocaleString()}</span> },
  { key: "gpu", header: "GPU Usage", render: r => (
    <div className="flex items-center gap-2 min-w-[120px]">
      <Progress value={(r.gpuUsed / r.gpuQuota) * 100} className="h-1.5 flex-1" />
      <span className="font-mono text-xs">{r.gpuUsed}/{r.gpuQuota}</span>
    </div>
  )},
  { key: "email", header: "Contact", render: r => <span className="text-xs text-muted-foreground">{r.contactEmail}</span>, hideOnMobile: true },
  { key: "created", header: "Since", render: r => new Date(r.createdAt).toLocaleDateString(), hideOnMobile: true },
];

export default function Tenants() {
  const { data = [] } = useQuery<Tenant[]>({ queryKey: ["/api/tenants"], refetchInterval: 30000 });
  const totalMrr = data.reduce((s, t) => s + t.mrr, 0);
  const totalGpuUsed = data.reduce((s, t) => s + t.gpuUsed, 0);
  const enterprise = data.filter(t => t.tier === "enterprise").length;

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-display font-bold">Tenants</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiStatCard title="Total Tenants" value={data.length} icon={<Building2 className="w-5 h-5 text-muted-foreground" />} />
        <KpiStatCard title="Enterprise" value={enterprise} icon={<Users className="w-5 h-5 text-purple-400" />} />
        <KpiStatCard title="Total MRR" value={`$${(totalMrr / 1000).toFixed(0)}K`} icon={<DollarSign className="w-5 h-5 text-emerald-400" />} />
        <KpiStatCard title="GPUs Allocated" value={totalGpuUsed} icon={<Cpu className="w-5 h-5 text-muted-foreground" />} />
      </div>
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 p-4">
        <DataTable data={data} columns={columns} pageSize={15} />
      </Card>
    </div>
  );
}
