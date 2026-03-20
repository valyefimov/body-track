import { cn } from '@/lib/utils';

interface SemiGaugeProps {
  value: number;
  min: number;
  max: number;
  className?: string;
  colorClass?: string;
}

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, value));
};

export function SemiGauge({
  value,
  min,
  max,
  className,
  colorClass = 'stroke-rose-500',
}: SemiGaugeProps) {
  const normalized = clamp((value - min) / (max - min), 0, 1);
  const radius = 45;
  const circumference = Math.PI * radius;
  const progress = circumference * normalized;

  return (
    <div className={cn('relative mx-auto h-24 w-44', className)}>
      <svg viewBox="0 0 120 70" className="h-full w-full">
        <path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none"
          className={cn(colorClass)}
          strokeWidth="9"
          strokeLinecap="round"
          pathLength={circumference}
          strokeDasharray={`${progress} ${circumference}`}
        />
      </svg>
    </div>
  );
}
