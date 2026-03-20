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
  const total = max - min;
  const normalizedValue = Math.max(min, Math.min(max, value));
  const markerLeft = ((normalizedValue - min) / total) * 100;

  return (
    <div className={cn('space-y-2', className)}>
      {ticks.length > 0 ? (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {ticks.map((tick) => (
            <span key={tick}>{tick.toFixed(1).replace('.', ',')}</span>
          ))}
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
