import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { SchedulerPolicy } from "@shared/schema";
import { HealthBadge } from "@/components/health-badge";
import { DataTable, type Column } from "@/components/data-table";
import { ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function Policies() {
  const { t } = useTranslation();
  const { data = [] } = useQuery<SchedulerPolicy[]>({ queryKey: ["/api/policies"], refetchInterval: 30000 });

  const columns: Column<SchedulerPolicy>[] = [
    { key: "name", header: t('policies.tablePolicyName'), render: r => <span className="font-medium">{r.name}</span> },
    { key: "tenant", header: t('policies.tableTenant'), render: r => <span className="text-muted-foreground text-xs">{r.tenantName}</span>, hideOnMobile: true },
    { key: "type", header: t('policies.tableType'), render: r => <HealthBadge status={r.type} showDot={false} /> },
    { key: "rules", header: t('policies.tableRules'), render: r => <span className="font-mono text-[10px] text-muted-foreground">{JSON.stringify(r.rules)}</span>, hideOnMobile: true },
    { key: "enabled", header: t('policies.tableEnabled'), render: r => <HealthBadge status={r.enabled ? "active" : "disabled"} /> },
  ];

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-6 h-6 text-muted-foreground" />
        <h1 className="text-xl sm:text-2xl font-display font-bold">{t('policies.title')}</h1>
      </div>
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 p-4">
        <DataTable data={data} columns={columns} pageSize={15} />
      </Card>
    </div>
  );
}
