import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { Cluster } from "@shared/schema";
import { KpiStatCard } from "@/components/kpi-stat-card";
import { HealthBadge } from "@/components/health-badge";
import { DataTable, type Column } from "@/components/data-table";
import { Network, Server, Cpu, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function Clusters() {
  const { t } = useTranslation();
  const { data = [] } = useQuery<Cluster[]>({ queryKey: ["/api/clusters"], refetchInterval: 15000 });
  const healthy = data.filter(c => c.status === "healthy").length;
  const degraded = data.filter(c => c.status === "degraded").length;
  const avgUtil = data.length ? Math.round(data.reduce((s, c) => s + c.utilization, 0) / data.length * 10) / 10 : 0;

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
      <h1 className="text-xl sm:text-2xl font-display font-bold">{t('clusters.title')}</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiStatCard title={t('clusters.totalClusters')} value={data.length} icon={<Network className="w-5 h-5 text-muted-foreground" />} />
        <KpiStatCard title={t('clusters.healthy')} value={healthy} variant="success" icon={<Server className="w-5 h-5 text-emerald-400" />} />
        <KpiStatCard title={t('clusters.degraded')} value={degraded} variant={degraded > 0 ? "warning" : "default"} icon={<Activity className="w-5 h-5 text-amber-400" />} />
        <KpiStatCard title={t('clusters.avgUtilization')} value={`${avgUtil}%`} icon={<Cpu className="w-5 h-5 text-muted-foreground" />} />
      </div>
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 p-4">
        <DataTable data={data} columns={columns} pageSize={15} />
      </Card>
    </div>
  );
}
