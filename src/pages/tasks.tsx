import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { Task } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from "@/components/ui/table";
import {
  PlayCircle, Clock, CheckCircle2, XCircle,
  Cpu, Timer, DollarSign
} from "lucide-react";
import dcHeroSrc from "@assets/dc-hero.png";

function StatusBadge({ status }: { status: Task["status"] }) {
  const styles = {
    running: "bg-status-online/10 text-status-online border-status-online/20",
    queued: "bg-status-away/10 text-status-away border-status-away/20",
    completed: "bg-primary/10 text-primary border-primary/20",
    failed: "bg-status-busy/10 text-status-busy border-status-busy/20",
  };
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wide border ${styles[status]}`}>
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: Task["priority"] }) {
  const styles = {
    urgent: "destructive" as const,
    high: "secondary" as const,
    normal: "outline" as const,
    low: "outline" as const,
  };
  return (
    <Badge variant={styles[priority]} className="text-[10px] px-1.5 py-0 capitalize">
      {priority}
    </Badge>
  );
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function TaskTable({ tasks, showProgress }: { tasks: Task[]; showProgress: boolean }) {
  const { t } = useTranslation();
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs">{t('tasks.tableTaskId')}</TableHead>
            <TableHead className="text-xs">{t('tasks.tableTenant')}</TableHead>
            <TableHead className="text-xs">{t('tasks.tableModel')}</TableHead>
            <TableHead className="text-xs">{t('tasks.tableType')}</TableHead>
            <TableHead className="text-xs">{t('tasks.tablePriority')}</TableHead>
            <TableHead className="text-xs">{t('tasks.tableGpus')}</TableHead>
            <TableHead className="text-xs">{t('tasks.tableStatus')}</TableHead>
            {showProgress && <TableHead className="text-xs">{t('tasks.tableProgress')}</TableHead>}
            <TableHead className="text-xs">{t('tasks.tableDuration')}</TableHead>
            <TableHead className="text-xs text-right">{t('tasks.tableCost')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id} data-testid={`task-row-${task.id}`}>
              <TableCell className="font-mono text-xs">{task.id}</TableCell>
              <TableCell className="text-xs truncate max-w-[120px]">{task.tenantName}</TableCell>
              <TableCell className="text-xs truncate max-w-[120px]">{task.modelName}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <span className="text-xs capitalize">{task.type}</span>
                  {task.taskMode === "endpoint" && (
                    <Badge variant="outline" className="text-[9px] px-1 py-0">EP</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell><PriorityBadge priority={task.priority} /></TableCell>
              <TableCell className="font-mono text-xs">{task.gpuCount}x {task.gpuModel}</TableCell>
              <TableCell><StatusBadge status={task.status} /></TableCell>
              {showProgress && (
                <TableCell>
                  <div className="flex items-center gap-2 min-w-[80px]">
                    <Progress value={task.progress} className="h-1 flex-1" />
                    <span className="text-[10px] font-mono w-8 text-right">{task.progress}%</span>
                  </div>
                </TableCell>
              )}
              <TableCell className="text-xs font-mono">{formatDuration(task.estimatedMinutes)}</TableCell>
              <TableCell className="text-xs font-mono text-right">${task.cost.toFixed(2)}</TableCell>
            </TableRow>
          ))}
          {tasks.length === 0 && (
            <TableRow>
              <TableCell colSpan={showProgress ? 10 : 9} className="text-center py-8 text-sm text-muted-foreground">
                {t('tasks.noTasks')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default function Tasks() {
  const { t } = useTranslation();
  useEffect(() => { document.title = t('tasks.pageTitle'); }, [t]);
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    refetchInterval: 8000,
  });

  const running = tasks?.filter(tk => tk.status === "running") || [];
  const queued = tasks?.filter(tk => tk.status === "queued") || [];
  const completed = tasks?.filter(tk => tk.status === "completed") || [];
  const failed = tasks?.filter(tk => tk.status === "failed") || [];
  const totalCost = tasks?.reduce((s, tk) => s + tk.cost, 0) || 0;
  const totalGpuHours = tasks?.reduce((s, tk) => s + tk.gpuHoursUsed, 0) || 0;

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-[1600px] mx-auto">
      {/* Hero Banner */}
      <div className="relative rounded-xl overflow-hidden mb-2">
        <img src={dcHeroSrc} alt="Infrastructure" className="w-full h-[120px] md:h-[160px] object-cover brightness-[0.3]" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/60 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-between gap-4 px-6 md:px-8 flex-wrap hero-shimmer">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">{t('common.allSystemsOperational')}</span>
            </div>
            <h1 className="text-xl md:text-2xl font-display font-bold tracking-tight text-white" data-testid="text-page-title">
              {t('tasks.title')}
            </h1>
            <p className="text-sm text-zinc-400 mt-0.5">{t('tasks.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: t('tasks.running'), value: running.length, icon: PlayCircle, color: "text-status-online" },
          { label: t('tasks.queued'), value: queued.length, icon: Clock, color: "text-status-away" },
          { label: t('tasks.gpuHours'), value: totalGpuHours.toFixed(1), icon: Cpu, color: "text-chart-2" },
          { label: t('tasks.totalCost'), value: `$${totalCost.toFixed(0)}`, icon: DollarSign, color: "text-chart-1" },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="p-3 flex items-center gap-2">
              {isLoading ? (
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-12" />
                </div>
              ) : (
                <>
                  <item.icon className={`w-4 h-4 ${item.color} flex-shrink-0`} />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{item.label}</p>
                    <p className="text-lg font-mono font-bold leading-tight">{item.value}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="running" className="space-y-4">
        <TabsList data-testid="tabs-tasks" className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="running" data-testid="tab-running" className="shrink-0">
            {t('tasks.tabRunning')} ({running.length})
          </TabsTrigger>
          <TabsTrigger value="queued" data-testid="tab-queued" className="shrink-0">
            {t('tasks.tabQueued')} ({queued.length})
          </TabsTrigger>
          <TabsTrigger value="completed" data-testid="tab-completed" className="shrink-0">
            {t('tasks.tabCompleted')} ({completed.length})
          </TabsTrigger>
          <TabsTrigger value="failed" data-testid="tab-failed" className="shrink-0">
            {t('tasks.tabFailed')} ({failed.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="running">
          <Card>
            <CardContent className="px-0 pb-0 pt-0">
              {isLoading ? (
                <div className="p-4 space-y-2">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : (
                <TaskTable tasks={running} showProgress={true} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queued">
          <Card>
            <CardContent className="px-0 pb-0 pt-0">
              <TaskTable tasks={queued} showProgress={false} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardContent className="px-0 pb-0 pt-0">
              <TaskTable tasks={completed} showProgress={false} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failed">
          <Card>
            <CardContent className="px-0 pb-0 pt-0">
              <TaskTable tasks={failed} showProgress={true} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
