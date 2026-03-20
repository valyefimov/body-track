import { cn } from '@/lib/utils';

interface RangeSegment {
  end: number;
  colorClass: string;
  label: string;
}

interface RangeBarProps {
  min: number;
  max: number;
  value: number;
  segments: RangeSegment[];
  ticks?: number[];
  className?: string;
}

export function RangeBar({ min, max, value, segments, ticks = [], className }: RangeBarProps) {
  const total = Math.max(max - min, 0.0001);
  const normalizedValue = Math.max(min, Math.min(max, value));
  const markerLeft = ((normalizedValue - min) / total) * 100;
  const normalizedTicks = ticks
    .map((tick) => Math.max(min, Math.min(max, tick)))
    .sort((a, b) => a - b);

  const formatTick = (tick: number): string => {
    const rounded = Math.round(tick * 10) / 10;
    const hasFraction = Math.abs(rounded - Math.trunc(rounded)) > 0.001;
    return hasFraction
      ? rounded.toFixed(1).replace('.', ',')
      : rounded.toFixed(0).replace('.', ',');
  };

  return (
    <div className={cn('space-y-2', className)}>
      {normalizedTicks.length > 0 ? (
        <div className="relative h-5 text-xs text-muted-foreground">
          {normalizedTicks.map((tick) => {
            const left = ((tick - min) / total) * 100;
            const alignClass =
              left < 8 ? 'left-0 translate-x-0' : left > 92 ? 'right-0 translate-x-0' : '';

            return (
              <span
                key={tick}
                className={cn('absolute -translate-x-1/2', alignClass)}
                style={!alignClass ? { left: `${left}%` } : undefined}
              >
                {formatTick(tick)}
              </span>
            );
          })}
        </div>
      ) : null}

      <div className="relative">
        <div className="flex h-2 overflow-hidden rounded-full">
          {segments.map((segment, index) => {
            const previousEnd = index === 0 ? min : segments[index - 1].end;
            const width = ((segment.end - previousEnd) / total) * 100;

            return (
              <div
                key={`${segment.label}-${segment.end}`}
                className={cn(segment.colorClass)}
                style={{ width: `${width}%` }}
              />
            );
          })}
        </div>
        <div
          className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-card shadow"
          style={{ left: `${markerLeft}%` }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {segments.map((segment) => (
          <div key={`${segment.label}-legend`} className="flex items-center gap-1.5">
            <span className={cn('size-2 rounded-full', segment.colorClass)} />
            {segment.label}
          </div>
        ))}
      </div>
    </div>
  );
}
