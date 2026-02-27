import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { MonitoringData } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Activity, Thermometer, Zap, HardDrive, AlertCircle,
  MemoryStick, Gauge, Server, Eye
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from "recharts";
import { RadialGauge } from "@/components/radial-gauge";
import { GpuHeatmap, HeatmapLegend } from "@/components/gpu-heatmap";
import { LiveConsole } from "@/components/live-console";
import dcHeroSrc from "@assets/dc-hero.png";

const CHART_COLORS = [
  "hsl(217, 91%, 60%)",
  "hsl(195, 87%, 55%)",
  "hsl(160, 75%, 50%)",
  "hsl(280, 82%, 60%)",
  "hsl(45, 90%, 55%)",
];

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function StatusDot({ status }: { status: string }) {
  const color = status === "busy" ? "bg-emerald-400" : status === "idle" ? "bg-zinc-500" : status === "error" ? "bg-red-400" : "bg-purple-400";
  return <div className={`w-2 h-2 rounded-full ${color}`} />;
}

export default function Monitoring() {
  useEffect(() => { document.title = "GPU Monitoring | CoreX"; }, []);
  const [dcFilter, setDcFilter] = useState<string | null>(null);

  const { data, isLoading } = useQuery<MonitoringData>({
    queryKey: ["/api/monitoring"],
    refetchInterval: 8000,
  });

  const statusCounts = data?.gpusByStatus || [];
  const busyCount = statusCounts.find(s => s.status === "busy")?.count || 0;
  const idleCount = statusCounts.find(s => s.status === "idle")?.count || 0;
  const errorCount = statusCounts.find(s => s.status === "error")?.count || 0;
  const maintCount = statusCounts.find(s => s.status === "maintenance")?.count || 0;
  const totalGpus = busyCount + idleCount + errorCount + maintCount;

  const dcBarData = data?.gpusByDc?.map(d => ({
    name: d.dc.split(" (")[0],
    busy: d.busy,
    idle: d.idle,
    error: d.error,
    maintenance: d.maintenance,
  })) || [];

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-[1600px] mx-auto">
      <div className="relative rounded-xl overflow-hidden mb-2">
        <img
          src={dcHeroSrc}
          alt="Data Center"
          className="w-full h-[140px] md:h-[180px] object-cover brightness-[0.35]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/60 to-transparent" />
        <div className="absolute inset-0 flex items-center px-6 md:px-8">
          <div className="flex items-center justify-between gap-4 w-full flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">Live Monitoring</span>
              </div>
              <h1 className="text-xl md:text-2xl font-display font-bold tracking-tight text-white" data-testid="text-page-title">
                GPU Fleet Observability
              </h1>
              <p className="text-sm text-zinc-400 mt-0.5">
                Real-time telemetry across {totalGpus} GPUs in 4 regions
              </p>
            </div>
            <div className="flex items-center gap-4">
              {[
                { label: "Active", count: busyCount, color: "text-emerald-400", dot: "bg-emerald-400" },
                { label: "Idle", count: idleCount, color: "text-zinc-400", dot: "bg-zinc-500" },
                { label: "Error", count: errorCount, color: "text-red-400", dot: "bg-red-400" },
                { label: "Maint", count: maintCount, color: "text-purple-400", dot: "bg-purple-400" },
              ].map(item => (
                <div key={item.label} className="text-center">
                  <div className="flex items-center gap-1.5 justify-center mb-0.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{item.label}</span>
                  </div>
                  <span className={`text-lg font-mono font-bold ${item.color}`} data-testid={`text-status-${item.label.toLowerCase()}`}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {isLoading ? (
          [...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex justify-center">
                <Skeleton className="w-[120px] h-[120px] rounded-full" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card className="bg-zinc-950/50 border-zinc-800/50">
              <CardContent className="p-4 flex justify-center">
                <RadialGauge
                  value={data?.avgUtilization || 0}
                  max={100}
                  label="Utilization"
                  unit="%"
                  color="hsl(217, 91%, 60%)"
                  warning={80}
                  critical={95}
                />
              </CardContent>
            </Card>
            <Card className="bg-zinc-950/50 border-zinc-800/50">
              <CardContent className="p-4 flex justify-center">
                <RadialGauge
                  value={data?.avgTemperature || 0}
                  max={100}
                  label="Temperature"
                  unit="°C"
                  color="hsl(195, 87%, 55%)"
                  warning={75}
                  critical={85}
                />
              </CardContent>
            </Card>
            <Card className="bg-zinc-950/50 border-zinc-800/50">
              <CardContent className="p-4 flex justify-center">
                <RadialGauge
                  value={data?.totalPowerKw || 0}
                  max={250}
                  label="Power"
                  unit="kW"
                  color="hsl(45, 90%, 55%)"
                  warning={200}
                  critical={230}
                />
              </CardContent>
            </Card>
            <Card className="bg-zinc-950/50 border-zinc-800/50">
              <CardContent className="p-4 flex justify-center">
                <RadialGauge
                  value={data?.totalMemoryUsedGb || 0}
                  max={data?.totalMemoryTotalGb || 1}
                  label="VRAM"
                  unit="GB"
                  color="hsl(280, 82%, 60%)"
                />
              </CardContent>
            </Card>
            <Card className="bg-zinc-950/50 border-zinc-800/50">
              <CardContent className="p-4 flex justify-center">
                <RadialGauge
                  value={errorCount}
                  max={Math.max(totalGpus * 0.05, errorCount + 1)}
                  label="Errors"
                  unit="GPUs"
                  color="hsl(160, 75%, 50%)"
                  warning={5}
                  critical={10}
                />
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList data-testid="tabs-monitoring" className="bg-zinc-900/50">
          <TabsTrigger value="overview" data-testid="tab-overview">
            <Eye className="w-3.5 h-3.5 mr-1.5" />Overview
          </TabsTrigger>
          <TabsTrigger value="heatmap" data-testid="tab-heatmap">
            <Gauge className="w-3.5 h-3.5 mr-1.5" />GPU Grid
          </TabsTrigger>
          <TabsTrigger value="charts" data-testid="tab-charts">
            <Activity className="w-3.5 h-3.5 mr-1.5" />Charts
          </TabsTrigger>
          <TabsTrigger value="gpus" data-testid="tab-gpus">
            <Server className="w-3.5 h-3.5 mr-1.5" />Fleet Table
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <Card className="bg-zinc-950/50 border-zinc-800/50">
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 px-4 pt-4 pb-2">
                  <CardTitle className="text-sm font-medium">GPUs by Region</CardTitle>
                  <Server className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="px-2 pb-2">
                  {isLoading ? <Skeleton className="h-[200px] w-full" /> : (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={dcBarData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 16%)" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(0, 0%, 55%)" }} axisLine={false} tickLine={false} />
                        <YAxis dataKey="name" type="category" width={60} tick={{ fontSize: 10, fill: "hsl(0, 0%, 55%)" }} axisLine={false} tickLine={false} />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (!active || !payload?.length) return null;
                            return (
                              <div className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 shadow-xl">
                                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                                {payload.map((p: any) => (
                                  <p key={p.dataKey} className="text-xs font-mono" style={{ color: p.fill }}>{p.dataKey}: {p.value}</p>
                                ))}
                              </div>
                            );
                          }}
                        />
                        <Bar dataKey="busy" stackId="a" fill="hsl(160, 75%, 50%)" radius={0} />
                        <Bar dataKey="idle" stackId="a" fill="hsl(0, 0%, 40%)" radius={0} />
                        <Bar dataKey="error" stackId="a" fill="hsl(0, 84%, 50%)" radius={0} />
                        <Bar dataKey="maintenance" stackId="a" fill="hsl(280, 82%, 50%)" radius={[0, 3, 3, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
              <Card className="bg-zinc-950/50 border-zinc-800/50">
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 px-4 pt-4 pb-2">
                  <CardTitle className="text-sm font-medium">Utilization Trend (24h)</CardTitle>
                  <Activity className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="px-2 pb-2">
                  {isLoading ? <Skeleton className="h-[160px] w-full" /> : (
                    <ResponsiveContainer width="100%" height={160}>
                      <AreaChart data={data?.utilizationHistory}>
                        <defs>
                          <linearGradient id="utilMonGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={CHART_COLORS[0]} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 16%)" vertical={false} />
                        <XAxis dataKey="time" tickFormatter={formatTime} tick={{ fontSize: 9, fill: "hsl(0, 0%, 55%)" }} axisLine={false} tickLine={false} interval={11} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "hsl(0, 0%, 55%)" }} axisLine={false} tickLine={false} width={30} tickFormatter={v => `${v}%`} />
                        <Tooltip content={({ active, payload, label }) => {
                          if (!active || !payload?.length) return null;
                          return (
                            <div className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 shadow-xl">
                              <p className="text-xs text-muted-foreground">{label ? formatTime(label) : ""}</p>
                              <p className="text-sm font-mono font-medium" style={{ color: CHART_COLORS[0] }}>{Number(payload[0].value).toFixed(1)}%</p>
                            </div>
                          );
                        }} />
                        <Area type="monotone" dataKey="value" stroke={CHART_COLORS[0]} strokeWidth={2} fill="url(#utilMonGrad)" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
            <Card className="lg:col-span-3 bg-zinc-950 border-zinc-800/50 overflow-hidden">
              <div className="h-[440px]">
                {isLoading ? (
                  <div className="p-4 space-y-2">
                    {[...Array(15)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
                  </div>
                ) : (
                  <LiveConsole logs={data?.logs || []} />
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="heatmap">
          <Card className="bg-zinc-950/50 border-zinc-800/50">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 px-4 pt-4 pb-2">
              <div>
                <CardTitle className="text-sm font-medium">GPU Fleet Topology</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Each cell represents one GPU — hover for details</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setDcFilter(null)}
                  className={`text-[10px] font-mono px-2 py-1 rounded transition-colors ${!dcFilter ? "bg-primary/20 text-primary" : "text-zinc-500 hover:text-zinc-300"}`}
                  data-testid="button-filter-all"
                >
                  All
                </button>
                {data?.gpusByDc?.map(d => (
                  <button
                    key={d.dc}
                    onClick={() => setDcFilter(dcFilter === d.dc ? null : d.dc)}
                    className={`text-[10px] font-mono px-2 py-1 rounded transition-colors ${dcFilter === d.dc ? "bg-primary/20 text-primary" : "text-zinc-500 hover:text-zinc-300"}`}
                    data-testid={`button-filter-dc-${d.dc.split(" ")[0].toLowerCase()}`}
                  >
                    {d.dc.split(" (")[0]}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="mb-3">
                <HeatmapLegend />
              </div>
              {isLoading ? <Skeleton className="h-[300px] w-full" /> : (
                <GpuHeatmap gpus={data?.gpus || []} dcFilter={dcFilter || undefined} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: "Temperature History (24h)", data: data?.temperatureHistory, color: CHART_COLORS[3], unit: "°C", id: "tempGrad" },
              { title: "Power Usage History (24h)", data: data?.powerHistory, color: CHART_COLORS[4], unit: " kW", id: "powerGrad" },
              { title: "Memory Utilization (24h)", data: data?.memoryHistory, color: CHART_COLORS[1], unit: "%", id: "memGrad" },
              { title: "Utilization (24h)", data: data?.utilizationHistory, color: CHART_COLORS[0], unit: "%", id: "util2Grad" },
            ].map((chart) => (
              <Card key={chart.title} className="bg-zinc-950/50 border-zinc-800/50">
                <CardHeader className="px-4 pt-4 pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">{chart.title}</CardTitle>
                </CardHeader>
                <CardContent className="px-2 pb-2">
                  {isLoading ? <Skeleton className="h-[200px] w-full" /> : (
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={chart.data}>
                        <defs>
                          <linearGradient id={chart.id} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chart.color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={chart.color} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 16%)" vertical={false} />
                        <XAxis dataKey="time" tickFormatter={formatTime} tick={{ fontSize: 10, fill: "hsl(0, 0%, 55%)" }} axisLine={false} tickLine={false} interval={7} />
                        <YAxis tick={{ fontSize: 10, fill: "hsl(0, 0%, 55%)" }} axisLine={false} tickLine={false} width={40} />
                        <Tooltip content={({ active, payload, label }) => {
                          if (!active || !payload?.length) return null;
                          return (
                            <div className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 shadow-xl">
                              <p className="text-xs text-muted-foreground">{label ? formatTime(label) : ""}</p>
                              <p className="text-sm font-mono font-medium" style={{ color: chart.color }}>{payload[0].value}{chart.unit}</p>
                            </div>
                          );
                        }} />
                        <Area type="monotone" dataKey="value" stroke={chart.color} strokeWidth={2} fill={`url(#${chart.id})`} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="gpus">
          <Card className="bg-zinc-950/50 border-zinc-800/50">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 px-4 pt-4 pb-2">
              <CardTitle className="text-sm font-medium">GPU Fleet Status</CardTitle>
              <Badge variant="outline" className="text-[10px] font-mono">{data?.gpus?.length || 0} GPUs shown</Badge>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800">
                      <TableHead className="text-xs">ID</TableHead>
                      <TableHead className="text-xs">Model</TableHead>
                      <TableHead className="text-xs">DC</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Utilization</TableHead>
                      <TableHead className="text-xs">Temp</TableHead>
                      <TableHead className="text-xs">Power</TableHead>
                      <TableHead className="text-xs">Memory</TableHead>
                      <TableHead className="text-xs">ECC</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      [...Array(10)].map((_, i) => (
                        <TableRow key={i}>
                          {[...Array(9)].map((_, j) => (
                            <TableCell key={j}><Skeleton className="h-4 w-16" /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      data?.gpus?.slice(0, 50).map((gpu) => (
                        <TableRow key={gpu.id} data-testid={`gpu-row-${gpu.id}`} className="border-zinc-800/50">
                          <TableCell className="font-mono text-xs text-blue-400">{gpu.id}</TableCell>
                          <TableCell className="text-xs">{gpu.model}</TableCell>
                          <TableCell className="text-xs truncate max-w-[120px]">{gpu.dcName.split(" (")[0]}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <StatusDot status={gpu.status} />
                              <span className="text-xs capitalize">{gpu.status}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 min-w-[100px]">
                              <Progress value={gpu.utilization} className="h-1 flex-1" />
                              <span className="text-xs font-mono w-10 text-right">{gpu.utilization}%</span>
                            </div>
                          </TableCell>
                          <TableCell className={`text-xs font-mono ${gpu.temperature > 80 ? "text-red-400" : gpu.temperature > 70 ? "text-amber-400" : ""}`}>
                            {gpu.temperature}°C
                          </TableCell>
                          <TableCell className="text-xs font-mono">{gpu.powerDraw}W</TableCell>
                          <TableCell className="text-xs font-mono">{gpu.memoryUsedGb}/{gpu.memoryTotalGb}GB</TableCell>
                          <TableCell className={`text-xs font-mono ${gpu.eccErrors > 0 ? "text-red-400" : "text-zinc-600"}`}>
                            {gpu.eccErrors > 0 ? gpu.eccErrors : "—"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
