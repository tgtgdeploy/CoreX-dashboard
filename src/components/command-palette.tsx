import { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Building2, Cpu, Globe, Zap, Bell, AlertOctagon, Search } from "lucide-react";
import type { SearchResult } from "@shared/schema";
import { supabaseHeaders, apiBase } from "@/lib/queryClient";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2, Cpu, Globe, Zap, Bell, AlertOctagon,
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [, navigate] = useLocation();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const search = useCallback(async (q: string) => {
    setQuery(q);
    if (q.length < 2) { setResults([]); return; }
    try {
      const res = await fetch(`${apiBase}/api/search?q=${encodeURIComponent(q)}`, { headers: supabaseHeaders });
      const data = await res.json();
      setResults(data);
    } catch { setResults([]); }
  }, []);

  const onSelect = (result: SearchResult) => {
    setOpen(false);
    setQuery("");
    navigate(result.url);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 border border-border/50 text-muted-foreground hover:bg-muted/80 transition-colors"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="text-xs hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono rounded bg-background/50 border border-border/50">
          <span className="text-[10px]">\u2318</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search tenants, jobs, endpoints, GPUs..."
          value={query}
          onValueChange={search}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {results.length > 0 && (
            <CommandGroup heading="Results">
              {results.map(r => {
                const Icon = ICON_MAP[r.icon] || Cpu;
                return (
                  <CommandItem
                    key={`${r.type}-${r.id}`}
                    onSelect={() => onSelect(r)}
                    className="flex items-center gap-3 py-2"
                  >
                    <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{r.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{r.subtitle}</p>
                    </div>
                    <span className="ml-auto text-[10px] font-mono text-muted-foreground uppercase shrink-0">{r.type}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}
          {query.length < 2 && (
            <CommandGroup heading="Quick Nav">
              {[
                { label: "Overview", url: "/" },
                { label: "GPUs", url: "/gpus" },
                { label: "Jobs", url: "/jobs" },
                { label: "Endpoints", url: "/endpoints" },
                { label: "Billing", url: "/billing" },
                { label: "Replay", url: "/replay" },
              ].map(n => (
                <CommandItem key={n.url} onSelect={() => { setOpen(false); navigate(n.url); }}>
                  {n.label}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
