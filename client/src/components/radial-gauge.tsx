interface RadialGaugeProps {
  value: number;
  max: number;
  label: string;
  unit: string;
  color: string;
  size?: number;
  warning?: number;
  critical?: number;
}

export function RadialGauge({ value, max, label, unit, color, size = 140, warning, critical }: RadialGaugeProps) {
  const pct = Math.min(value / max, 1);
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius * 0.75;
  const dashOffset = circumference * (1 - pct);
  const cx = size / 2;
  const cy = size / 2;

  let activeColor = color;
  if (critical && value >= critical) activeColor = "hsl(0, 84%, 50%)";
  else if (warning && value >= warning) activeColor = "hsl(45, 90%, 55%)";

  const startAngle = 135;
  const endAngle = 405;
  const sweepAngle = (endAngle - startAngle) * pct;

  const polarToCartesian = (angle: number) => {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  };

  const start = polarToCartesian(startAngle);
  const endBg = polarToCartesian(endAngle);
  const endActive = polarToCartesian(startAngle + sweepAngle);

  const largeArcBg = endAngle - startAngle > 180 ? 1 : 0;
  const largeArcActive = sweepAngle > 180 ? 1 : 0;

  const bgPath = `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcBg} 1 ${endBg.x} ${endBg.y}`;
  const activePath = pct > 0
    ? `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcActive} 1 ${endActive.x} ${endActive.y}`
    : "";

  return (
    <div className="flex flex-col items-center" data-testid={`gauge-${label.toLowerCase().replace(/\s/g, "-")}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <filter id={`glow-${label}`}>
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id={`grad-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={activeColor} stopOpacity={0.8} />
            <stop offset="100%" stopColor={activeColor} />
          </linearGradient>
        </defs>
        <path d={bgPath} fill="none" stroke="hsl(0, 0%, 20%)" strokeWidth={8} strokeLinecap="round" />
        {activePath && (
          <path
            d={activePath}
            fill="none"
            stroke={`url(#grad-${label})`}
            strokeWidth={8}
            strokeLinecap="round"
            filter={`url(#glow-${label})`}
            style={{ transition: "d 0.5s ease" }}
          />
        )}
        <text x={cx} y={cy - 4} textAnchor="middle" fill="hsl(0, 0%, 98%)" fontSize={size > 120 ? 22 : 18} fontWeight="700" fontFamily="JetBrains Mono, monospace">
          {typeof value === "number" ? (value >= 100 ? Math.round(value) : value.toFixed(1)) : value}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="hsl(0, 0%, 55%)" fontSize={10} fontFamily="JetBrains Mono, monospace">
          {unit}
        </text>
      </svg>
      <span className="text-[11px] text-muted-foreground font-medium mt-1 tracking-wide uppercase">{label}</span>
    </div>
  );
}
