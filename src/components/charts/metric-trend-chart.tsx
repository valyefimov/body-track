import type { BodyMeasurement } from '@/types';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type MetricKey = 'weightKg' | 'steps' | 'bodyFatPercent' | 'muscleMassKg' | 'waterPercent';

interface MetricTrendChartProps {
  data: BodyMeasurement[];
  metricKey: MetricKey;
  stroke: string;
  fill: string;
  unit: string;
  compact?: boolean;
}

export function MetricTrendChart({
  data,
  metricKey,
  stroke,
  fill,
  unit,
  compact = false,
}: MetricTrendChartProps) {
  const chartData = data.map((entry) => {
    return {
      dateLabel: format(parseISO(entry.date), 'dd.MM', { locale: ru }),
      value: Number(entry[metricKey]),
    };
  });

  return (
    <div className={compact ? 'h-40 w-full' : 'h-56 w-full'}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={
            compact
              ? { top: 8, right: 0, left: 0, bottom: 0 }
              : { top: 16, right: 8, left: 0, bottom: 0 }
          }
        >
          <defs>
            <linearGradient id={`${metricKey}-gradient`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={fill} stopOpacity={0.4} />
              <stop offset="100%" stopColor={fill} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          {!compact ? (
            <CartesianGrid vertical={false} strokeDasharray="4 4" strokeOpacity={0.16} />
          ) : null}
          <XAxis
            dataKey="dateLabel"
            tick={compact ? false : { fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            hide={compact}
            width={30}
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: '1px solid hsl(var(--border))',
              background: 'hsl(var(--card))',
            }}
            labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
            formatter={(value) => {
              const numeric = Number(value ?? 0);
              return `${numeric.toFixed(1)}${unit}`;
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={stroke}
            strokeWidth={2.5}
            fill={`url(#${metricKey}-gradient)`}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
