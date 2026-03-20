import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardInsights } from '@/types';
import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, HeartPulse, Scale, Sparkles } from 'lucide-react';

interface ScoreHeroProps {
  insights: DashboardInsights;
  weightDelta: number | null;
  fatDelta: number | null;
}

const scoreBadge = (score: number): string => {
  if (score >= 85) {
    return 'Отлично';
  }
  if (score >= 70) {
    return 'Хорошо';
  }
  if (score >= 55) {
    return 'Средне';
  }

  return 'Нужно подтянуть';
};

export function ScoreHero({ insights, weightDelta, fatDelta }: ScoreHeroProps) {
  const isWeightDown = typeof weightDelta === 'number' ? weightDelta < 0 : null;
  const isFatDown = typeof fatDelta === 'number' ? fatDelta < 0 : null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32 }}
      className="grid gap-4 lg:grid-cols-[1.4fr_1fr]"
    >
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-orange-500 via-amber-500 to-teal-500 text-white shadow-xl">
        <CardHeader className="pb-0">
          <CardTitle className="flex items-center gap-2 text-base font-medium text-white/90">
            <HeartPulse className="size-4" />
            Оценка тела сегодня
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="flex items-end gap-3">
            <p className="text-6xl font-semibold leading-none">{insights.bodyScore}</p>
            <Badge className="rounded-full bg-white/20 px-3 text-white hover:bg-white/20">
              {scoreBadge(insights.bodyScore)}
            </Badge>
          </div>
          <p className="max-w-lg text-sm text-white/85">{insights.motivation}</p>
        </CardContent>
      </Card>

      <Card className="border bg-card/90">
        <CardHeader className="space-y-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Scale className="size-4 text-primary" />
            Цели по весу
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Идеальный вес</p>
            <p className="text-3xl font-semibold">
              {insights.idealWeightKg}
              <span className="ml-1 text-base font-medium text-muted-foreground">кг</span>
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2">
              <span className="text-muted-foreground">Вес к прошлому замеру</span>
              {typeof weightDelta === 'number' ? (
                <span className={isWeightDown ? 'text-emerald-500' : 'text-rose-500'}>
                  {isWeightDown ? <ArrowDownRight className="mr-1 inline size-4" /> : null}
                  {!isWeightDown ? <ArrowUpRight className="mr-1 inline size-4" /> : null}
                  {Math.abs(weightDelta).toFixed(2)} кг
                </span>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </div>
            <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2">
              <span className="text-muted-foreground">Жир к прошлому замеру</span>
              {typeof fatDelta === 'number' ? (
                <span className={isFatDown ? 'text-emerald-500' : 'text-rose-500'}>
                  {isFatDown ? <ArrowDownRight className="mr-1 inline size-4" /> : null}
                  {!isFatDown ? <ArrowUpRight className="mr-1 inline size-4" /> : null}
                  {Math.abs(fatDelta).toFixed(2)}%
                </span>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 px-3 py-2 text-sm">
            <Sparkles className="mr-1 inline size-4 text-primary" />
            До цели по жиру: {insights.targetToLoseKg.toFixed(1)} кг
          </div>
        </CardContent>
      </Card>
    </motion.section>
  );
}
