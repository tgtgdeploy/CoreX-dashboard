import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import type { MonitoringData } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LiveConsole } from "@/components/live-console";
import { Terminal } from "lucide-react";
import dcHeroSrc from "@assets/dc-hero.png";

export default function Console() {
  const { t } = useTranslation();
  useEffect(() => { document.title = `${t('console.title')} | CoreX`; }, [t]);

  const { data, isLoading } = useQuery<MonitoringData>({
    queryKey: ["/api/monitoring"],
    refetchInterval: 4000,
  });

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-[1600px] mx-auto page-enter">
      <div className="relative rounded-xl overflow-hidden mb-2 hero-shimmer">
        <img src={dcHeroSrc} alt="Console" className="w-full h-[100px] md:h-[130px] object-cover brightness-[0.25]" />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/80 via-zinc-950/60 to-transparent" />
        <div className="absolute inset-0 flex items-center px-6 md:px-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">{t('console.liveFeed')}</span>
            </div>
            <h1 className="text-xl md:text-2xl font-display font-bold tracking-tight text-white" data-testid="text-page-title">
              {t('console.title')}
            </h1>
            <p className="text-sm text-zinc-400 mt-0.5">
              {t('console.subtitle')}
            </p>
          </div>
        </div>
      </div>

      <Card className="bg-zinc-950 border-zinc-800/50 overflow-hidden">
        <div className="h-[calc(100vh-280px)] min-h-[400px]">
          {isLoading ? (
            <div className="p-4 space-y-2">
              {[...Array(20)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
            </div>
          ) : (
            <LiveConsole logs={data?.logs || []} />
          )}
        </div>
      </Card>
    </div>
  );
}
