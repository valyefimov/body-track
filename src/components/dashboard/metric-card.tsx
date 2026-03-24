import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { InsightMetric } from '@/types';
import { motion } from 'framer-motion';

const toneClassMap = {
  success: 'text-emerald-500',
  warning: 'text-amber-500',
  danger: 'text-rose-500',
  neutral: 'text-slate-500',
};

const badgeVariantMap = {
  success: 'secondary',
  warning: 'outline',
  danger: 'destructive',
  neutral: 'outline',
} as const;

interface MetricCardProps {
  metric: InsightMetric;
  index: number;
  onClick?: () => void;
  tooltip?: string;
}

export function MetricCard({ metric, index, onClick, tooltip }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <Card
        className={`h-full border bg-card/90 ${
          onClick
            ? 'cursor-pointer transition hover:border-primary/60 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary/40'
            : ''
        }`}
        title={tooltip}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onClick={onClick}
        onKeyDown={
          onClick
            ? (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
      >
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <CardDescription className="text-xs uppercase tracking-wide">
              {metric.title}
            </CardDescription>
            <Badge
              variant={badgeVariantMap[metric.status.tone]}
              className="rounded-full px-2 py-0.5 text-[11px]"
            >
              {metric.status.label}
            </Badge>
          </div>
          <CardTitle className={`text-3xl font-semibold ${toneClassMap[metric.status.tone]}`}>
            {metric.value}
            <span className="ml-1 text-lg font-medium opacity-80">{metric.unit}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{metric.helper}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
