import { MetricTrendChart } from '@/components/charts/metric-trend-chart';
import { AddMeasurementDialog } from '@/components/dashboard/add-measurement-dialog';
import { HistoryList } from '@/components/dashboard/history-list';
import { MetricCard } from '@/components/dashboard/metric-card';
import { RecommendationsCard } from '@/components/dashboard/recommendations-card';
import { ScoreHero } from '@/components/dashboard/score-hero';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { logout } from '@/features/auth/authSlice';
import { createMeasurement } from '@/features/body/bodySlice';
import { calculateInsights, getInitialMeasurement } from '@/lib/health';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { MeasurementInput } from '@/types';
import { motion } from 'framer-motion';
import { BarChart3, TrendingDown, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';

const today = () => new Date().toISOString().slice(0, 10);

export function DashboardPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { profile, measurements, saveStatus, error } = useAppSelector((state) => state.body);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const latest = measurements.length > 0 ? measurements[measurements.length - 1] : null;
  const previous = measurements.length > 1 ? measurements[measurements.length - 2] : null;

  const insights = useMemo(() => {
    if (!profile || !latest) {
      return null;
    }

    return calculateInsights(profile, latest, previous);
  }, [latest, previous, profile]);

  const weightDelta = latest && previous ? latest.weightKg - previous.weightKg : null;
  const fatDelta = latest && previous ? latest.bodyFatPercent - previous.bodyFatPercent : null;

  const chartSummary = useMemo(() => {
    if (!latest || measurements.length === 0) {
      return { weightDiff: 0, fatDiff: 0 };
    }

    const first = measurements[0];
    return {
      weightDiff: latest.weightKg - first.weightKg,
      fatDiff: latest.bodyFatPercent - first.bodyFatPercent,
    };
  }, [latest, measurements]);

  const defaults = useMemo<MeasurementInput>(() => {
    if (latest) {
      return {
        date: today(),
        weightKg: latest.weightKg,
        steps: latest.steps,
        bodyFatPercent: latest.bodyFatPercent,
        muscleMassKg: latest.muscleMassKg,
        waterPercent: latest.waterPercent,
        proteinPercent: latest.proteinPercent,
        visceralFatLevel: latest.visceralFatLevel,
        note: '',
      };
    }

    const initial = getInitialMeasurement({
      age: profile?.age ?? 30,
      heightCm: profile?.heightCm ?? 175,
      startWeightKg: profile?.startWeightKg ?? 80,
    });

    return {
      ...initial,
      date: today(),
      note: '',
    };
  }, [latest, profile]);

  if (!user || !profile) {
    return null;
  }

  const handleSaveMeasurement = async (payload: MeasurementInput) => {
    await dispatch(
      createMeasurement({
        uid: user.uid,
        measurement: payload,
      }),
    ).unwrap();

    setIsDialogOpen(false);
  };

  return (
    <>
      <AppShell
        userName={user.displayName}
        userEmail={user.email}
        userPhoto={user.photoURL}
        onAddMeasurement={() => setIsDialogOpen(true)}
        onLogout={() => {
          void dispatch(logout());
        }}
      >
        {insights ? (
          <>
            <ScoreHero insights={insights} weightDelta={weightDelta} fatDelta={fatDelta} />

            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {insights.metrics.map((metric, index) => (
                <MetricCard key={metric.title} metric={metric} index={index} />
              ))}
            </section>

            <motion.section
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.08 }}
            >
              <Card className="border bg-card/90">
                <CardHeader className="space-y-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="size-4 text-primary" />
                    Динамика показателей
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span
                      className={
                        chartSummary.weightDiff <= 0 ? 'text-emerald-500' : 'text-rose-500'
                      }
                    >
                      {chartSummary.weightDiff <= 0 ? (
                        <TrendingDown className="mr-1 inline size-4" />
                      ) : (
                        <TrendingUp className="mr-1 inline size-4" />
                      )}
                      Вес: {Math.abs(chartSummary.weightDiff).toFixed(2)} кг
                    </span>
                    <span
                      className={chartSummary.fatDiff <= 0 ? 'text-emerald-500' : 'text-rose-500'}
                    >
                      {chartSummary.fatDiff <= 0 ? (
                        <TrendingDown className="mr-1 inline size-4" />
                      ) : (
                        <TrendingUp className="mr-1 inline size-4" />
                      )}
                      Жир: {Math.abs(chartSummary.fatDiff).toFixed(2)}%
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="weight" className="gap-4">
                    <TabsList>
                      <TabsTrigger value="weight">Вес</TabsTrigger>
                      <TabsTrigger value="steps">Шаги</TabsTrigger>
                      <TabsTrigger value="fat">Жир</TabsTrigger>
                      <TabsTrigger value="muscle">Мышцы</TabsTrigger>
                      <TabsTrigger value="water">Вода</TabsTrigger>
                    </TabsList>
                    <TabsContent value="weight">
                      <MetricTrendChart
                        data={measurements}
                        metricKey="weightKg"
                        stroke="#84cc16"
                        fill="#84cc16"
                        unit=" кг"
                      />
                    </TabsContent>
                    <TabsContent value="steps">
                      <MetricTrendChart
                        data={measurements}
                        metricKey="steps"
                        stroke="#0ea5e9"
                        fill="#0ea5e9"
                        unit=" шагов"
                      />
                    </TabsContent>
                    <TabsContent value="fat">
                      <MetricTrendChart
                        data={measurements}
                        metricKey="bodyFatPercent"
                        stroke="#ef4444"
                        fill="#ef4444"
                        unit="%"
                      />
                    </TabsContent>
                    <TabsContent value="muscle">
                      <MetricTrendChart
                        data={measurements}
                        metricKey="muscleMassKg"
                        stroke="#f97316"
                        fill="#f97316"
                        unit=" кг"
                      />
                    </TabsContent>
                    <TabsContent value="water">
                      <MetricTrendChart
                        data={measurements}
                        metricKey="waterPercent"
                        stroke="#0ea5e9"
                        fill="#0ea5e9"
                        unit="%"
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.section>

            <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
              <RecommendationsCard items={insights.recommendations} />
              <HistoryList measurements={measurements} />
            </section>
          </>
        ) : (
          <Card className="border bg-card/95">
            <CardHeader>
              <CardTitle>Добавь первый замер</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                После первого замера появятся графики, оценка тела и персональные рекомендации.
              </p>
            </CardContent>
          </Card>
        )}

        {error ? <p className="text-sm text-rose-500">{error}</p> : null}
      </AppShell>

      <AddMeasurementDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        defaults={defaults}
        onSubmit={handleSaveMeasurement}
        isSaving={saveStatus === 'loading'}
      />
    </>
  );
}
