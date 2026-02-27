import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Alert } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle, AlertCircle, Info, CheckCircle2,
  Bell, Clock, Server
} from "lucide-react";

function SeverityIcon({ severity }: { severity: Alert["severity"] }) {
  if (severity === "critical") return <AlertCircle className="w-4 h-4 text-status-busy" />;
  if (severity === "warning") return <AlertTriangle className="w-4 h-4 text-status-away" />;
  return <Info className="w-4 h-4 text-primary" />;
}

function timeAgo(timestamp: string) {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function AlertCard({ alert }: { alert: Alert }) {
  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-md border ${
        alert.severity === "critical" && !alert.acknowledged
          ? "border-status-busy/30 bg-status-busy/5"
          : "border-border bg-muted/20"
      }`}
      data-testid={`alert-card-${alert.id}`}
    >
      <SeverityIcon severity={alert.severity} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">{alert.title}</span>
          <Badge
            variant={alert.severity === "critical" ? "destructive" : alert.severity === "warning" ? "secondary" : "outline"}
            className="text-[10px] px-1.5 py-0"
          >
            {alert.severity}
          </Badge>
          {alert.acknowledged && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-status-online">
              <CheckCircle2 className="w-3 h-3" /> Acknowledged
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
        <div className="flex items-center gap-4 mt-2 flex-wrap">
          <div className="flex items-center gap-1">
            <Server className="w-3 h-3 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground font-mono">{alert.dcName}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-muted-foreground">{alert.source}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground font-mono">{timeAgo(alert.timestamp)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Alerts() {
  useEffect(() => { document.title = "Alerts | CoreX"; }, []);
  const { data: alerts, isLoading } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
    refetchInterval: 15000,
  });

  const criticalAlerts = alerts?.filter(a => a.severity === "critical") || [];
  const warningAlerts = alerts?.filter(a => a.severity === "warning") || [];
  const infoAlerts = alerts?.filter(a => a.severity === "info") || [];
  const unacknowledged = alerts?.filter(a => !a.acknowledged) || [];

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-xl md:text-2xl font-display font-bold tracking-tight" data-testid="text-page-title">
            Alerts & Notifications
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            System alerts, warnings, and operational notifications
          </p>
        </div>
        <Badge variant="outline" className="font-mono text-xs">
          {unacknowledged.length} unacknowledged
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Alerts", value: alerts?.length || 0, icon: Bell, color: "text-primary" },
          { label: "Critical", value: criticalAlerts.length, icon: AlertCircle, color: "text-status-busy" },
          { label: "Warnings", value: warningAlerts.length, icon: AlertTriangle, color: "text-status-away" },
          { label: "Info", value: infoAlerts.length, icon: Info, color: "text-chart-2" },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="p-3 flex items-center gap-2">
              {isLoading ? (
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-8" />
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

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList data-testid="tabs-alerts">
          <TabsTrigger value="all" data-testid="tab-all">All ({alerts?.length || 0})</TabsTrigger>
          <TabsTrigger value="critical" data-testid="tab-critical">Critical ({criticalAlerts.length})</TabsTrigger>
          <TabsTrigger value="warning" data-testid="tab-warning">Warning ({warningAlerts.length})</TabsTrigger>
          <TabsTrigger value="info" data-testid="tab-info">Info ({infoAlerts.length})</TabsTrigger>
        </TabsList>

        {["all", "critical", "warning", "info"].map((tab) => {
          const filteredAlerts = tab === "all" ? alerts : alerts?.filter(a => a.severity === tab);
          return (
            <TabsContent key={tab} value={tab}>
              <div className="space-y-2">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  filteredAlerts?.map((alert) => (
                    <AlertCard key={alert.id} alert={alert} />
                  ))
                )}
                {!isLoading && (!filteredAlerts || filteredAlerts.length === 0) && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <CheckCircle2 className="w-8 h-8 text-status-online mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No alerts in this category</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
