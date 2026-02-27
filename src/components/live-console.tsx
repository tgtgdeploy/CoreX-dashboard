import { useRef, useEffect, useState } from "react";
import type { LogEntry } from "@shared/schema";
import { Terminal, Filter } from "lucide-react";

const LEVEL_COLORS: Record<string, string> = {
  INFO: "text-blue-400",
  WARN: "text-amber-400",
  ERROR: "text-red-400",
  DEBUG: "text-zinc-500",
};

const LEVEL_BG: Record<string, string> = {
  INFO: "bg-blue-500/10",
  WARN: "bg-amber-500/10",
  ERROR: "bg-red-500/10",
  DEBUG: "bg-zinc-500/5",
};

function formatLogTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

export function LiveConsole({ logs }: { logs: LogEntry[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [levelFilter, setLevelFilter] = useState<string | null>(null);

  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const filtered = levelFilter ? logs.filter(l => l.level === levelFilter) : logs;

  return (
    <div className="flex flex-col h-full" data-testid="live-console">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-zinc-800 bg-zinc-950/50">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-mono font-bold text-emerald-400 tracking-wider">SYSTEM CONSOLE</span>
          <div className="flex items-center gap-1 ml-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-zinc-500 font-mono">LIVE</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Filter className="w-3 h-3 text-zinc-500" />
          {["INFO", "WARN", "ERROR", "DEBUG"].map(level => (
            <button
              key={level}
              onClick={() => setLevelFilter(levelFilter === level ? null : level)}
              className={`text-[9px] font-mono px-1.5 py-0.5 rounded transition-colors ${
                levelFilter === level
                  ? `${LEVEL_BG[level]} ${LEVEL_COLORS[level]} ring-1 ring-current/20`
                  : "text-zinc-600"
              }`}
              data-testid={`button-filter-${level.toLowerCase()}`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto font-mono text-[11px] leading-[18px] bg-zinc-950 p-2 space-y-0"
        onScroll={(e) => {
          const el = e.currentTarget;
          const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
          setAutoScroll(isNearBottom);
        }}
      >
        {filtered.map((log, i) => (
          <div
            key={`${log.timestamp}-${i}`}
            className={`flex gap-2 px-1.5 py-[1px] rounded-sm hover:bg-zinc-900/50 ${log.level === "ERROR" ? "bg-red-500/5" : ""}`}
            data-testid={`log-entry-${i}`}
          >
            <span className="text-zinc-600 flex-shrink-0 select-none">{formatLogTime(log.timestamp)}</span>
            <span className={`flex-shrink-0 w-[38px] text-right ${LEVEL_COLORS[log.level]}`}>{log.level}</span>
            <span className="text-cyan-600 flex-shrink-0 w-[120px] truncate">[{log.source}]</span>
            <span className="text-zinc-300 flex-1 truncate">{log.message}</span>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-zinc-600 text-center py-4">No log entries matching filter</div>
        )}
      </div>
    </div>
  );
}
