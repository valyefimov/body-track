import { MetricTrendChart } from '@/components/charts/metric-trend-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { BodyMeasurement } from '@/types';

interface TrendChangeCardProps {
  title: string;
  data: BodyMeasurement[];
  metricKey: 'weightKg' | 'bodyFatPercent' | 'muscleMassKg' | 'waterPercent';
  unit: string;
  stroke: string;
  fill: string;
  recentDelta: number;
  historyDelta: number;
  recentDateLabel: string;
  historyDateLabel: string;
}

const deltaColor = (delta: number, positiveGood: boolean): string => {
  if (Math.abs(delta) < 0.01) {
    return 'text-muted-foreground';
  }

  const isGood = positiveGood ? delta > 0 : delta < 0;
  return isGood ? 'text-lime-500' : 'text-rose-500';
};

export function TrendChangeCard({
  title,
  data,
  metricKey,
  unit,
  stroke,
  fill,
  recentDelta,
  historyDelta,
  recentDateLabel,
  historyDateLabel,
}: TrendChangeCardProps) {
  const positiveGood = metricKey === 'muscleMassKg' || metricKey === 'waterPercent';

  return (
    <Card className="rounded-none border-x-0 border-y bg-card/95 shadow-none">
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="text-[2rem] leading-tight font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="mb-4 grid grid-cols-2 gap-3 text-center">
          <div className="rounded-xl bg-muted/40 px-2 py-2">
            <p className={`text-2xl font-semibold ${deltaColor(recentDelta, positiveGood)}`}>
              {Math.abs(recentDelta).toFixed(2)}
              {unit}
            </p>
            <p className="text-sm text-muted-foreground">Прогресс ({recentDateLabel})</p>
          </div>
          <div className="rounded-xl bg-muted/40 px-2 py-2">
            <p className={`text-2xl font-semibold ${deltaColor(historyDelta, positiveGood)}`}>
              {Math.abs(historyDelta).toFixed(2)}
              {unit}
            </p>
            <p className="text-sm text-muted-foreground">По сравнению с {historyDateLabel}</p>
          </div>
        </div>
        <MetricTrendChart
          data={data}
          metricKey={metricKey}
          stroke={stroke}
          fill={fill}
          unit={unit}
          compact
        />
      </CardContent>
    </Card>
  );
}
