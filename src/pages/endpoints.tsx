import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { Endpoint, EndpointMetric } from "@shared/schema";
import { KpiStatCard } from "@/components/kpi-stat-card";
import { HealthBadge } from "@/components/health-badge";
import { Card } from "@/components/ui/card";
import { Globe, Activity, Clock, Zap } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { supabaseHeaders, apiBase } from "@/lib/queryClient";

export default function Endpoints() {
  const { data = [] } = useQuery<Endpoint[]>({ queryKey: ["/api/endpoints"], refetchInterval: 5000 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: metrics } = useQuery<EndpointMetric[]>({
    queryKey: ["/api/endpoints", selectedId, "metrics"],
    queryFn: () => fetch(`${apiBase}/api/endpoints/${selectedId}/metrics`, { headers: supabaseHeaders }).then(r => r.json()),
    enabled: !!selectedId,
    refetchInterval: 15000,
  });

  const running = data.filter(e => e.status === "running");
  const totalRps = running.reduce((s, e) => s + e.rps, 0);
  const avgLatency = running.length ? Math.round(running.reduce((s, e) => s + e.latencyP50, 0) / running.length) : 0;
  const totalCostHr = running.reduce((s, e) => s + e.costPerHour, 0);

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-display font-bold">Inference Endpoints</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiStatCard title="Active Endpoints" value={running.length} subtitle={`of ${data.length} total`} icon={<Globe className="w-5 h-5 text-emerald-400" />} />
        <KpiStatCard title="Total RPS" value={totalRps.toFixed(0)} icon={<Activity className="w-5 h-5 text-blue-400" />} />
        <KpiStatCard title="Avg Latency P50" value={`${avgLatency}ms`} icon={<Clock className="w-5 h-5 text-muted-foreground" />} />
        <KpiStatCard title="Cost / Hour" value={`$${totalCostHr.toFixed(2)}`} icon={<Zap className="w-5 h-5 text-amber-400" />} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {data.map(ep => (
          <Card key={ep.id}
            className={`bg-card/50 backdrop-blur-sm border-border/50 p-4 cursor-pointer transition-all hover:border-primary/30 ${selectedId === ep.id ? "border-primary/60 ring-1 ring-primary/20" : ""}`}
            onClick={() => setSelectedId(ep.id)}>
            <div className="flex items-start justify-between mb-2">
              <div className="min-w-0">
                <h3 className="font-medium text-sm truncate">{ep.name}</h3>
                <p className="text-[11px] text-muted-foreground">{ep.tenantName} · {ep.region}</p>
              </div>
              <HealthBadge status={ep.status} />
            </div>
            <div className="text-xs text-muted-foreground mb-2">{ep.gpus}x {ep.gpuModel} · {ep.modelName}</div>
            {ep.status === "running" && (
              <div className="grid grid-cols-3 gap-2 text-center">
                <div><p className="text-lg font-display font-bold">{ep.rps.toFixed(0)}</p><p className="text-[10px] text-muted-foreground">RPS</p></div>
                <div><p className="text-lg font-display font-bold">{ep.latencyP50.toFixed(0)}<span className="text-xs">ms</span></p><p className="text-[10px] text-muted-foreground">P50</p></div>
                <div><p className="text-lg font-display font-bold">{ep.currentReplicas}/{ep.maxReplicas}</p><p className="text-[10px] text-muted-foreground">Replicas</p></div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {selectedId && metrics && metrics.length > 0 && (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 p-4">
          <h3 className="text-sm font-medium mb-3">Metrics — {selectedId}</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-2">RPS</p>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={metrics}>
                  <XAxis dataKey="ts" tick={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 6, fontSize: 12 }} />
                  <Area type="monotone" dataKey="rps" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Latency (ms)</p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={metrics}>
                  <XAxis dataKey="ts" tick={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 6, fontSize: 12 }} />
                  <Line type="monotone" dataKey="latencyP50" stroke="#22c55e" strokeWidth={1.5} dot={false} name="P50" />
                  <Line type="monotone" dataKey="latencyP95" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="P95" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
