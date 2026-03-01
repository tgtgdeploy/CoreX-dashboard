import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
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
import dcHeroSrc from "@assets/dc-hero.png";

export default function Jobs() {
  const { t } = useTranslation();
  const [tab, setTab] = useState("all");
  const [selected, setSelected] = useState<Job | null>(null);
  const { data = [] } = useQuery<Job[]>({ queryKey: ["/api/jobs"], refetchInterval: 5000 });

  const columns: Column<Job>[] = [
    { key: "id", header: t('jobs.tableJobId'), render: r => <span className="font-mono text-xs">{r.id}</span> },
    { key: "tenant", header: t('jobs.tableTenant'), render: r => <span className="text-xs">{r.tenantName}</span>, hideOnMobile: true },
    { key: "model", header: t('jobs.tableModel'), render: r => <span className="font-medium text-xs">{r.modelName}</span> },
    { key: "type", header: t('jobs.tableType'), render: r => <HealthBadge status={r.type} showDot={false} />, hideOnMobile: true },
    { key: "gpus", header: t('jobs.tableGpus'), render: r => <span className="text-xs">{r.requestedGpus}x {r.requestedGpuModel}</span> },
    { key: "priority", header: t('jobs.tablePriority'), render: r => <HealthBadge status={r.priority} showDot={false} />, hideOnMobile: true },
    { key: "progress", header: t('jobs.tableProgress'), render: r => (
      <div className="flex items-center gap-2 min-w-[80px]">
        <Progress value={r.progress} className="h-1.5 flex-1" />
        <span className="font-mono text-[10px] w-8 text-right">{r.progress}%</span>
      </div>
    )},
    { key: "cost", header: t('jobs.tableCost'), render: r => <span className="font-mono text-xs">${r.cost.toFixed(2)}</span>, hideOnMobile: true },
    { key: "status", header: t('jobs.tableStatus'), render: r => <HealthBadge status={r.status} /> },
  ];

  const filtered = tab === "all" ? data : data.filter(j => j.status === tab);
  const running = data.filter(j => j.status === "running").length;
  const queued = data.filter(j => j.status === "queued").length;
  const completed = data.filter(j => j.status === "completed").length;
  const failed = data.filter(j => j.status === "failed").length;

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Hero Banner */}
      <div className="relative rounded-xl overflow-hidden mb-2 scan-line gradient-border">
        <img src={dcHeroSrc} alt="Infrastructure" className="w-full h-[140px] md:h-[180px] object-cover brightness-[0.3]" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/60 to-transparent" />
        <div className="absolute inset-0 tech-grid z-[1]" />
        <div className="absolute inset-0 flex items-center justify-between gap-4 px-6 md:px-8 flex-wrap hero-shimmer z-[2]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">{t('common.allSystemsOperational')}</span>
            </div>
            <h1 className="text-xl md:text-2xl font-display font-bold tracking-tight text-white">{t('jobs.title')}</h1>
            <p className="text-sm text-zinc-400 mt-0.5">{t('jobs.subtitle')}</p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent z-[3]" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiStatCard title={t('jobs.running')} value={running} variant="success" icon={<Play className="w-5 h-5 text-emerald-400" />} />
        <KpiStatCard title={t('jobs.queued')} value={queued} icon={<Clock className="w-5 h-5 text-amber-400" />} />
        <KpiStatCard title={t('jobs.completed24h')} value={completed} icon={<CheckCircle2 className="w-5 h-5 text-muted-foreground" />} />
        <KpiStatCard title={t('jobs.failed24h')} value={failed} variant={failed > 0 ? "critical" : "default"} icon={<XCircle className="w-5 h-5 text-red-400" />} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 p-4 md:col-span-2">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="mb-3 w-full justify-start overflow-x-auto">
              <TabsTrigger value="all" className="shrink-0">{`${t('jobs.tabAll')} (${data.length})`}</TabsTrigger>
              <TabsTrigger value="running" className="shrink-0">{t('jobs.tabRunning')}</TabsTrigger>
              <TabsTrigger value="queued" className="shrink-0">{t('jobs.tabQueued')}</TabsTrigger>
              <TabsTrigger value="completed" className="shrink-0">{t('jobs.tabDone')}</TabsTrigger>
              <TabsTrigger value="failed" className="shrink-0">{t('jobs.tabFailed')}</TabsTrigger>
            </TabsList>
            <TabsContent value={tab}>
              <DataTable data={filtered} columns={columns} pageSize={12} onRowClick={setSelected} />
            </TabsContent>
          </Tabs>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 p-4">
          <h3 className="text-sm font-medium mb-3">
            {selected ? t('jobs.jobEvents', { id: selected.id }) : t('jobs.selectJob')}
          </h3>
          {selected ? (
            <ScrollArea className="h-[300px] md:h-[400px]">
              <div className="space-y-2">
                <div className="text-xs space-y-1 mb-3">
                  <div className="flex justify-between"><span className="text-muted-foreground">{t('jobs.traceId')}</span><span className="font-mono">{selected.traceId}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{t('jobs.image')}</span><span className="font-mono text-[10px]">{selected.image}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{t('jobs.command')}</span><span className="font-mono text-[10px] truncate max-w-[200px]">{selected.command}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{t('jobs.region')}</span><span>{selected.regionPref}</span></div>
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
            <div className="flex items-center justify-center h-[300px] md:h-[400px] text-muted-foreground text-sm">
              <Cpu className="w-8 h-8 mr-3 opacity-30" />
              {t('jobs.clickToInspect')}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
