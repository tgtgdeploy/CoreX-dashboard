import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs">Task ID</TableHead>
            <TableHead className="text-xs">Tenant</TableHead>
            <TableHead className="text-xs">Model</TableHead>
            <TableHead className="text-xs">Type</TableHead>
            <TableHead className="text-xs">Priority</TableHead>
            <TableHead className="text-xs">GPUs</TableHead>
            <TableHead className="text-xs">Status</TableHead>
            {showProgress && <TableHead className="text-xs">Progress</TableHead>}
            <TableHead className="text-xs">Duration</TableHead>
            <TableHead className="text-xs text-right">Cost</TableHead>
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
                No tasks in this category
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default function Tasks() {
  useEffect(() => { document.title = "Task Management | CoreX"; }, []);
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    refetchInterval: 8000,
  });

  const running = tasks?.filter(t => t.status === "running") || [];
  const queued = tasks?.filter(t => t.status === "queued") || [];
  const completed = tasks?.filter(t => t.status === "completed") || [];
  const failed = tasks?.filter(t => t.status === "failed") || [];
  const totalCost = tasks?.reduce((s, t) => s + t.cost, 0) || 0;
  const totalGpuHours = tasks?.reduce((s, t) => s + t.gpuHoursUsed, 0) || 0;

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-xl md:text-2xl font-display font-bold tracking-tight" data-testid="text-page-title">
          Task Management
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Batch jobs and endpoint services orchestration
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Running", value: running.length, icon: PlayCircle, color: "text-status-online" },
          { label: "Queued", value: queued.length, icon: Clock, color: "text-status-away" },
          { label: "GPU Hours", value: totalGpuHours.toFixed(1), icon: Cpu, color: "text-chart-2" },
          { label: "Total Cost", value: `$${totalCost.toFixed(0)}`, icon: DollarSign, color: "text-chart-1" },
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
        <TabsList data-testid="tabs-tasks">
          <TabsTrigger value="running" data-testid="tab-running">
            Running ({running.length})
          </TabsTrigger>
          <TabsTrigger value="queued" data-testid="tab-queued">
            Queued ({queued.length})
          </TabsTrigger>
          <TabsTrigger value="completed" data-testid="tab-completed">
            Completed ({completed.length})
          </TabsTrigger>
          <TabsTrigger value="failed" data-testid="tab-failed">
            Failed ({failed.length})
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
