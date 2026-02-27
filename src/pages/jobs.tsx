import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { Job } from "@shared/schema";
import { KpiStatCard } from "@/components/kpi-stat-card";
import { HealthBadge } from "@/components/health-badge";
import { DataTable, type Column } from "@/components/data-table";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, CheckCircle2, Clock, XCircle, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

const columns: Column<Job>[] = [
  { key: "id", header: "Job ID", render: r => <span className="font-mono text-xs">{r.id}</span> },
  { key: "tenant", header: "Tenant", render: r => <span className="text-xs">{r.tenantName}</span>, hideOnMobile: true },
  { key: "model", header: "Model", render: r => <span className="font-medium text-xs">{r.modelName}</span> },
  { key: "type", header: "Type", render: r => <HealthBadge status={r.type} showDot={false} />, hideOnMobile: true },
  { key: "gpus", header: "GPUs", render: r => <span className="text-xs">{r.requestedGpus}x {r.requestedGpuModel}</span> },
  { key: "priority", header: "Priority", render: r => <HealthBadge status={r.priority} showDot={false} />, hideOnMobile: true },
  { key: "progress", header: "Progress", render: r => (
    <div className="flex items-center gap-2 min-w-[80px]">
      <Progress value={r.progress} className="h-1.5 flex-1" />
      <span className="font-mono text-[10px] w-8 text-right">{r.progress}%</span>
    </div>
  )},
  { key: "cost", header: "Cost", render: r => <span className="font-mono text-xs">${r.cost.toFixed(2)}</span>, hideOnMobile: true },
  { key: "status", header: "Status", render: r => <HealthBadge status={r.status} /> },
];

export default function Jobs() {
  const [tab, setTab] = useState("all");
  const [selected, setSelected] = useState<Job | null>(null);
  const { data = [] } = useQuery<Job[]>({ queryKey: ["/api/jobs"], refetchInterval: 5000 });

  const filtered = tab === "all" ? data : data.filter(j => j.status === tab);
  const running = data.filter(j => j.status === "running").length;
  const queued = data.filter(j => j.status === "queued").length;
  const completed = data.filter(j => j.status === "completed").length;
  const failed = data.filter(j => j.status === "failed").length;

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-display font-bold">Jobs</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiStatCard title="Running" value={running} variant="success" icon={<Play className="w-5 h-5 text-emerald-400" />} />
        <KpiStatCard title="Queued" value={queued} icon={<Clock className="w-5 h-5 text-amber-400" />} />
        <KpiStatCard title="Completed (24h)" value={completed} icon={<CheckCircle2 className="w-5 h-5 text-muted-foreground" />} />
        <KpiStatCard title="Failed (24h)" value={failed} variant={failed > 0 ? "critical" : "default"} icon={<XCircle className="w-5 h-5 text-red-400" />} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 p-4 lg:col-span-2">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="mb-3">
              <TabsTrigger value="all">All ({data.length})</TabsTrigger>
              <TabsTrigger value="running">Running</TabsTrigger>
              <TabsTrigger value="queued">Queued</TabsTrigger>
              <TabsTrigger value="completed">Done</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
            </TabsList>
            <TabsContent value={tab}>
              <DataTable data={filtered} columns={columns} pageSize={12} onRowClick={setSelected} />
            </TabsContent>
          </Tabs>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 p-4">
          <h3 className="text-sm font-medium mb-3">
            {selected ? `Job Events — ${selected.id}` : "Select a job to view events"}
          </h3>
          {selected ? (
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                <div className="text-xs space-y-1 mb-3">
                  <div className="flex justify-between"><span className="text-muted-foreground">Trace ID</span><span className="font-mono">{selected.traceId}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Image</span><span className="font-mono text-[10px]">{selected.image}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Command</span><span className="font-mono text-[10px] truncate max-w-[200px]">{selected.command}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Region</span><span>{selected.regionPref}</span></div>
                </div>
                {selected.events.map((e, i) => (
                  <div key={i} className={cn("text-xs border-l-2 pl-3 py-1",
                    e.level === "error" ? "border-red-500" : e.level === "warn" ? "border-amber-500" : "border-blue-500/50"
                  )}>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-muted-foreground">{new Date(e.ts).toLocaleTimeString()}</span>
                      <HealthBadge status={e.level} size="sm" showDot={false} />
                    </div>
                    <p className="mt-0.5 text-muted-foreground">{e.message}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex items-center justify-center h-[400px] text-muted-foreground text-sm">
              <Cpu className="w-8 h-8 mr-3 opacity-30" />
              Click a job row to inspect
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
