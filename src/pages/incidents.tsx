import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { Incident } from "@shared/schema";
import { KpiStatCard } from "@/components/kpi-stat-card";
import { HealthBadge } from "@/components/health-badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Shield, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Incidents() {
  const { data = [] } = useQuery<Incident[]>({ queryKey: ["/api/incidents"], refetchInterval: 15000 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = data.find(i => i.id === selectedId) ?? null;

  const active = data.filter(i => i.status !== "resolved").length;
  const critical = data.filter(i => i.severity === "critical" && i.status !== "resolved").length;
  const resolved = data.filter(i => i.status === "resolved").length;
  const avgMinutes = (() => {
    const r = data.filter(i => i.resolvedAt);
    if (!r.length) return 0;
    return Math.round(r.reduce((s, i) => s + (new Date(i.resolvedAt!).getTime() - new Date(i.startedAt).getTime()) / 60000, 0) / r.length);
  })();

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-display font-bold">Incidents</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiStatCard title="Active" value={active} variant={active > 0 ? "critical" : "default"} icon={<AlertTriangle className="w-5 h-5 text-red-400" />} />
        <KpiStatCard title="Critical" value={critical} variant={critical > 0 ? "critical" : "default"} icon={<Shield className="w-5 h-5 text-red-500" />} />
        <KpiStatCard title="Resolved (24h)" value={resolved} icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />} />
        <KpiStatCard title="Avg Resolution" value={`${avgMinutes}m`} icon={<Clock className="w-5 h-5 text-muted-foreground" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 p-4 lg:col-span-1">
          <h3 className="text-sm font-medium mb-3">All Incidents</h3>
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {data.map(inc => (
                <div
                  key={inc.id}
                  onClick={() => setSelectedId(inc.id)}
                  className={cn(
                    "p-3 rounded-lg cursor-pointer transition-all border",
                    selectedId === inc.id
                      ? "border-primary/60 bg-primary/5"
                      : "border-transparent hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-sm font-medium leading-tight line-clamp-1">{inc.title}</span>
                    <HealthBadge status={inc.severity} size="sm" showDot={false} />
                  </div>
                  <div className="flex items-center gap-2">
                    <HealthBadge status={inc.status} size="sm" />
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {new Date(inc.startedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
              {data.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No incidents</p>
              )}
            </div>
          </ScrollArea>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50 p-4 lg:col-span-2">
          {selected ? (
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-base font-medium">{selected.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{selected.summary}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <HealthBadge status={selected.severity} showDot={false} />
                  <HealthBadge status={selected.status} />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-xs">
                <div>
                  <span className="text-muted-foreground block">Commander</span>
                  <span className="font-medium">{selected.commander}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Started</span>
                  <span className="font-mono">{new Date(selected.startedAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Resolved</span>
                  <span className="font-mono">{selected.resolvedAt ? new Date(selected.resolvedAt).toLocaleString() : "—"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Affected</span>
                  <span>{selected.affectedServices.join(", ")}</span>
                </div>
              </div>

              <h4 className="text-sm font-medium mb-2">Timeline</h4>
              <ScrollArea className="h-[350px]">
                <div className="space-y-3">
                  {selected.updates.map((u, i) => (
                    <div key={u.id || i} className="border-l-2 border-blue-500/50 pl-3 py-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {new Date(u.ts).toLocaleTimeString()}
                        </span>
                        <span className="text-[10px] text-muted-foreground">by {u.author}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{u.message}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[500px] text-muted-foreground text-sm">
              <AlertTriangle className="w-8 h-8 mr-3 opacity-30" />
              Select an incident to view details
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
