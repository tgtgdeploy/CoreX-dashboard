import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import type { ReplayScenario, ReplayEvent, MetricPoint } from "@shared/schema";
import { KpiStatCard } from "@/components/kpi-stat-card";
import { HealthBadge } from "@/components/health-badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, RotateCcw, FastForward, Film, Clock, Zap, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { cn } from "@/lib/utils";
import { supabaseHeaders } from "@/lib/queryClient";

export default function Replay() {
  const queryClient = useQueryClient();
  const { data: scenarios = [] } = useQuery<ReplayScenario[]>({ queryKey: ["/api/replay/scenarios"] });

  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scenario = scenarios.find(s => s.id === activeScenario);
  const durationSec = (scenario?.durationMinutes ?? 10) * 60;

  const { data: events = [] } = useQuery<ReplayEvent[]>({
    queryKey: ["/api/replay/events", elapsed],
    queryFn: () => fetch(`/api/replay/events?from=0&to=${elapsed}`, { headers: supabaseHeaders }).then(r => r.json()),
    enabled: !!activeScenario,
    refetchInterval: playing ? 2000 : false,
  });

  const { data: metrics } = useQuery<{
    utilization: MetricPoint[];
    revenue: MetricPoint[];
    queueDepth: MetricPoint[];
    latency: MetricPoint[];
  }>({
    queryKey: ["/api/replay/metrics", elapsed],
    queryFn: () => fetch(`/api/replay/metrics`, { headers: supabaseHeaders }).then(r => r.json()),
    enabled: !!activeScenario,
    refetchInterval: playing ? 3000 : false,
  });

  const startMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/replay/start`, {
      method: "POST",
      headers: { ...supabaseHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ scenarioId: id }),
    }).then(r => r.json()),
    onSuccess: (_, id) => {
      setActiveScenario(id);
      setElapsed(0);
      setPlaying(true);
    },
  });

  useEffect(() => {
    if (playing && activeScenario) {
      timerRef.current = setInterval(() => {
        setElapsed(prev => {
          const next = prev + speed;
          if (next >= durationSec) {
            setPlaying(false);
            return durationSec;
          }
          return next;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing, activeScenario, speed, durationSec]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3">
        <Film className="w-6 h-6 text-muted-foreground" />
        <h1 className="text-xl sm:text-2xl font-display font-bold">Replay Mode</h1>
      </div>

      {!activeScenario ? (
        <div>
          <p className="text-sm text-muted-foreground mb-4">Select a scenario to replay infrastructure events in real-time simulation.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {scenarios.map(s => (
              <Card
                key={s.id}
                className="bg-card/50 backdrop-blur-sm border-border/50 p-4 cursor-pointer transition-all hover:border-primary/30"
                onClick={() => startMutation.mutate(s.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-sm">{s.name}</h3>
                  <span className="text-lg">{s.icon}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{s.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {s.tags.map(t => (
                      <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">{t}</span>
                    ))}
                  </div>
                  <span className="text-[10px] text-muted-foreground">{s.durationMinutes}min</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Controls */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm">{scenario?.name}</h3>
                <p className="text-xs text-muted-foreground truncate">{scenario?.description}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button size="sm" variant="outline" onClick={() => { setPlaying(!playing); }}>
                  {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setElapsed(0); setPlaying(false); }}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSpeed(s => s >= 4 ? 1 : s * 2)}>
                  <FastForward className="w-4 h-4" />
                  <span className="ml-1 text-xs">{speed}x</span>
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setActiveScenario(null); setPlaying(false); setElapsed(0); }}>
                  Exit
                </Button>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <span className="font-mono text-xs text-muted-foreground w-10">{formatTime(elapsed)}</span>
              <Slider
                value={[elapsed]}
                max={durationSec}
                step={1}
                onValueChange={([v]) => setElapsed(v)}
                className="flex-1"
              />
              <span className="font-mono text-xs text-muted-foreground w-10">{formatTime(durationSec)}</span>
            </div>
          </Card>

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiStatCard title="Elapsed" value={formatTime(elapsed)} icon={<Clock className="w-5 h-5 text-muted-foreground" />} />
            <KpiStatCard title="Events" value={events.length} icon={<Zap className="w-5 h-5 text-amber-400" />} />
            <KpiStatCard title="Speed" value={`${speed}x`} icon={<FastForward className="w-5 h-5 text-blue-400" />} />
            <KpiStatCard title="Progress" value={`${Math.round((elapsed / durationSec) * 100)}%`} icon={<Activity className="w-5 h-5 text-emerald-400" />} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Metrics Charts */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 p-4 lg:col-span-2">
              <h3 className="text-sm font-medium mb-3">Live Metrics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {metrics?.utilization && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">GPU Utilization %</p>
                    <ResponsiveContainer width="100%" height={140}>
                      <AreaChart data={metrics.utilization}>
                        <XAxis dataKey="time" tick={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                        <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 6, fontSize: 12 }} />
                        <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={1.5} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {metrics?.latency && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Latency (ms)</p>
                    <ResponsiveContainer width="100%" height={140}>
                      <LineChart data={metrics.latency}>
                        <XAxis dataKey="time" tick={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 6, fontSize: 12 }} />
                        <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={1.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {metrics?.queueDepth && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Queue Depth</p>
                    <ResponsiveContainer width="100%" height={140}>
                      <AreaChart data={metrics.queueDepth}>
                        <XAxis dataKey="time" tick={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 6, fontSize: 12 }} />
                        <Area type="monotone" dataKey="value" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={1.5} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {metrics?.revenue && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Revenue ($)</p>
                    <ResponsiveContainer width="100%" height={140}>
                      <AreaChart data={metrics.revenue}>
                        <XAxis dataKey="time" tick={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 6, fontSize: 12 }} />
                        <Area type="monotone" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={1.5} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </Card>

            {/* Events Feed */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 p-4">
              <h3 className="text-sm font-medium mb-3">Event Stream</h3>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {events.map((e, i) => (
                    <div
                      key={i}
                      className={cn(
                        "text-xs border-l-2 pl-3 py-1.5",
                        e.severity === "critical" ? "border-red-500" :
                        e.severity === "warning" ? "border-amber-500" :
                        e.severity === "success" ? "border-emerald-500" :
                        "border-blue-500/50"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <HealthBadge status={e.severity} size="sm" showDot={false} />
                        <HealthBadge status={e.type} size="sm" showDot={false} />
                      </div>
                      <p className="font-medium text-xs mt-0.5">{e.title}</p>
                      <p className="text-muted-foreground text-[10px] mt-0.5">{e.description}</p>
                    </div>
                  ))}
                  {events.length === 0 && (
                    <p className="text-muted-foreground text-sm text-center py-8">
                      Press play to start the scenario
                    </p>
                  )}
                </div>
              </ScrollArea>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
