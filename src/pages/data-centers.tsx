import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import type { DataCenter } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Server, Cpu, Thermometer, Zap, HardDrive,
  Network, MapPin, Layers
} from "lucide-react";
import dcAerialSrc from "@assets/dc-aerial.png";

function StatusBadge({ status }: { status: string }) {
  const variant = status === "online" ? "default" : status === "maintenance" ? "secondary" : "destructive";
  return (
    <Badge variant={variant} className="text-[10px] px-1.5 py-0 capitalize">
      {status}
    </Badge>
  );
}

function MetricRow({ icon: Icon, label, value, subValue, color }: {
  icon: any; label: string; value: string; subValue?: string; color?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <Icon className={`w-3.5 h-3.5 ${color || "text-muted-foreground"}`} />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="text-right">
        <span className="text-sm font-mono font-medium">{value}</span>
        {subValue && <span className="text-xs text-muted-foreground ml-1">{subValue}</span>}
      </div>
    </div>
  );
}

export default function DataCenters() {
  useEffect(() => { document.title = t('dataCenters.pageTitle'); }, []);
  const { t } = useTranslation();
  const { data: dataCenters, isLoading } = useQuery<DataCenter[]>({
    queryKey: ["/api/data-centers"],
    refetchInterval: 10000,
  });

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-[1600px] mx-auto">
      <div className="relative rounded-xl overflow-hidden mb-2 scan-line gradient-border">
        <img src={dcAerialSrc} alt="Data Center Facility" className="w-full h-[140px] md:h-[180px] object-cover brightness-[0.3]" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/60 to-transparent" />
        <div className="absolute inset-0 tech-grid z-[1]" />
        <div className="absolute inset-0 flex items-center px-6 md:px-8 z-[2]">
          <div>
            <h1 className="text-xl md:text-2xl font-display font-bold tracking-tight text-white" data-testid="text-page-title">
              {t('dataCenters.title')}
            </h1>
            <p className="text-sm text-zinc-400 mt-0.5">
              {t('dataCenters.subtitle')}
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent z-[3]" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="space-y-3">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-full" />
                  <div className="space-y-2 mt-4">
                    {[...Array(6)].map((_, j) => <Skeleton key={j} className="h-8 w-full" />)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10">
                  <Server className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('dataCenters.dataCenters')}</p>
                  <p className="text-lg font-mono font-bold">{dataCenters?.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-md bg-chart-2/10">
                  <Cpu className="w-4 h-4 text-chart-2" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('dataCenters.totalGpus')}</p>
                  <p className="text-lg font-mono font-bold">
                    {dataCenters?.reduce((s, d) => s + d.totalGpus, 0)}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-md bg-chart-5/10">
                  <Layers className="w-4 h-4 text-chart-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('dataCenters.totalClusters')}</p>
                  <p className="text-lg font-mono font-bold">
                    {dataCenters?.reduce((s, d) => s + d.clusterCount, 0)}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-md bg-chart-4/10">
                  <Network className="w-4 h-4 text-chart-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('dataCenters.totalNodes')}</p>
                  <p className="text-lg font-mono font-bold">
                    {dataCenters?.reduce((s, d) => s + d.nodeCount, 0)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dataCenters?.map((dc) => (
              <Card key={dc.id} data-testid={`dc-card-${dc.id}`}>
                <CardHeader className="px-5 pt-5 pb-3 space-y-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                        <Server className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-display">{dc.name}</CardTitle>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{dc.location}</span>
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={dc.status} />
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-muted-foreground">{t('dataCenters.gpuUtilization')}</span>
                      <span className="text-xs font-mono font-medium">{dc.utilization}%</span>
                    </div>
                    <Progress value={dc.utilization} className="h-1.5" />
                  </div>

                  <div className="space-y-0 divide-y">
                    <MetricRow icon={Cpu} label={t('dataCenters.gpus')} value={`${dc.availableGpus} / ${dc.totalGpus}`} subValue={t('common.avail')} color="text-chart-2" />
                    <MetricRow icon={Layers} label={t('dataCenters.clusters')} value={`${dc.clusterCount}`} color="text-chart-5" />
                    <MetricRow icon={Server} label={t('dataCenters.nodes')} value={`${dc.nodeCount}`} color="text-chart-4" />
                    <MetricRow icon={Thermometer} label={t('dataCenters.avgTemp')} value={`${dc.avgTemperature}°C`} color="text-status-away" />
                    <MetricRow icon={Zap} label={t('dataCenters.power')} value={`${dc.powerUsageKw} kW`} color="text-chart-1" />
                    <MetricRow icon={Network} label={t('dataCenters.bandwidth')} value={`${dc.networkBandwidthGbps} Gbps`} color="text-primary" />
                    <MetricRow icon={HardDrive} label={t('dataCenters.storage')} value={`${dc.storageUsedTb} / ${dc.storageTotalTb} TB`} color="text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
