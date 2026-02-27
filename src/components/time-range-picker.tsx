import { cn } from "@/lib/utils";
import { useState } from "react";

const RANGES = [
  { label: "1h", value: "1h" },
  { label: "24h", value: "24h" },
  { label: "7d", value: "7d" },
  { label: "30d", value: "30d" },
];

interface TimeRangePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function TimeRangePicker({ value, onChange, className }: TimeRangePickerProps) {
  const [selected, setSelected] = useState(value || "24h");

  return (
    <div className={cn("flex items-center gap-0.5 p-0.5 rounded-md bg-muted/50 border border-border/50", className)}>
      {RANGES.map(r => (
        <button
          key={r.value}
          onClick={() => { setSelected(r.value); onChange?.(r.value); }}
          className={cn(
            "px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] font-mono font-medium rounded transition-all",
            selected === r.value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
