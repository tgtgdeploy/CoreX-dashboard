import { cn } from "@/lib/utils";

interface RegionPoint {
  region: string;
  lat: number;
  lng: number;
  totalGpus: number;
  utilization: number;
  revenue: number;
}

interface RegionMapProps {
  regions: RegionPoint[];
  className?: string;
}

function latLngToXY(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng + 180) / 360) * 100;
  const latRad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const y = 50 - (mercN / Math.PI) * 50;
  return { x, y };
}

export function RegionMap({ regions, className }: RegionMapProps) {
  return (
    <div className={cn("relative w-full aspect-[2/1] bg-[#0a0e1a] rounded-lg overflow-hidden border border-border/30", className)}>
      {/* Grid lines */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.06]" viewBox="0 0 100 50">
        {Array.from({ length: 10 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 5} x2="100" y2={i * 5} stroke="currentColor" strokeWidth="0.2" />
        ))}
        {Array.from({ length: 20 }, (_, i) => (
          <line key={`v${i}`} x1={i * 5} y1="0" x2={i * 5} y2="50" stroke="currentColor" strokeWidth="0.2" />
        ))}
      </svg>

      {/* Simplified world outline */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.08]" viewBox="0 0 100 50" fill="none">
        <path d="M15,15 Q20,12 25,14 Q30,16 35,13 Q40,11 42,15 Q44,18 48,16 Q52,13 55,15 Q58,17 60,14 Q62,12 65,14 Q70,17 72,15 Q75,12 78,15 Q80,18 82,16 Q85,13 88,16" stroke="currentColor" strokeWidth="0.3" />
        <path d="M42,20 Q45,22 48,20 Q51,18 55,21 Q58,24 60,22 Q63,19 66,22 Q70,25 72,23 Q75,20 78,22 Q80,25 82,23 Q85,20 87,22" stroke="currentColor" strokeWidth="0.3" />
        <path d="M15,25 Q18,22 22,25 Q25,28 28,25 Q30,22 33,25 Q35,28 37,26" stroke="currentColor" strokeWidth="0.3" />
      </svg>

      {/* Region dots with glow */}
      {regions.map(r => {
        const { x, y } = latLngToXY(r.lat, r.lng);
        const utilColor = r.utilization > 80 ? "#22c55e" : r.utilization > 60 ? "#3b82f6" : "#f59e0b";
        const size = Math.max(2, Math.min(5, r.totalGpus / 60));

        return (
          <div key={r.region} className="absolute group" style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}>
            {/* Pulse ring */}
            <div
              className="absolute inset-0 rounded-full animate-ping opacity-30"
              style={{ width: size * 8, height: size * 8, background: utilColor, margin: `${-size * 3}px` }}
            />
            {/* Main dot */}
            <div
              className="relative rounded-full border-2 border-background shadow-lg"
              style={{ width: size * 4, height: size * 4, background: utilColor }}
            />
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              <div className="bg-popover/95 backdrop-blur-sm border border-border rounded-md px-2.5 py-1.5 shadow-lg whitespace-nowrap">
                <p className="text-xs font-medium">{r.region}</p>
                <div className="flex gap-3 mt-0.5">
                  <span className="text-[10px] text-muted-foreground">{r.totalGpus} GPUs</span>
                  <span className="text-[10px] text-muted-foreground">{r.utilization.toFixed(0)}% util</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div className="absolute bottom-2 right-2 flex items-center gap-3 text-[9px] sm:text-[10px] text-muted-foreground font-mono">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> &gt;80%</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> 60-80%</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> &lt;60%</span>
      </div>
    </div>
  );
}
