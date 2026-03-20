import { MetricTrendChart } from '@/components/charts/metric-trend-chart';
import { AddMeasurementDialog } from '@/components/dashboard/add-measurement-dialog';
import { HistoryList } from '@/components/dashboard/history-list';
import { MetricCard } from '@/components/dashboard/metric-card';
import { RangeBar } from '@/components/dashboard/range-bar';
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

interface DetailedMetric {
  key: string;
  title: string;
  valueLabel: string;
  statusLabel: string;
  helper: string;
  range: {
    min: number;
    max: number;
    value: number;
    ticks: number[];
    segments: Array<{
      end: number;
      colorClass: string;
      label: string;
    }>;
  };
}

const getLevelLabel = (value: number, low: number, medium: number, high: number): string => {
  if (value <= low) {
    return 'Низкий';
  }
  if (value <= medium) {
    return 'Нормальный';
  }
  if (value <= high) {
    return 'Выше среднего';
  }

  return 'Высокий';
};

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

  const detailedMetrics = useMemo<DetailedMetric[]>(() => {
    if (!latest || !insights || !profile) {
      return [];
    }

    const fatMassKg =
      latest.fatMassKg > 0 ? latest.fatMassKg : latest.weightKg * (latest.bodyFatPercent / 100);
    const bmiValue = latest.bmi > 0 ? latest.bmi : insights.bmi;
    const fatMassLow = latest.weightKg * 0.17;
    const fatMassMid = latest.weightKg * 0.22;
    const fatMassHigh = latest.weightKg * 0.27;
    const boneLow = latest.weightKg * 0.03;
    const boneMid = latest.weightKg * 0.04;
    const boneHigh = latest.weightKg * 0.05;
    const muscleLow = latest.weightKg * 0.32;
    const muscleMid = latest.weightKg * 0.38;
    const muscleHigh = latest.weightKg * 0.45;

    return [
      {
        key: 'bmi',
        title: 'ИМТ',
        valueLabel: insights.bmi.toFixed(1).replace('.', ','),
        statusLabel: getLevelLabel(bmiValue, 18.5, 25, 30),
        helper: 'Ориентир по ИМТ для взрослого: 18.5-24.9.',
        range: {
          min: 14,
          max: 40,
          value: bmiValue,
          ticks: [18.5, 25, 30],
          segments: [
            { end: 18.5, colorClass: 'bg-blue-500', label: 'Низкий' },
            { end: 25, colorClass: 'bg-lime-500', label: 'Нормальный' },
            { end: 30, colorClass: 'bg-amber-500', label: 'Выше среднего' },
            { end: 40, colorClass: 'bg-rose-500', label: 'Высокий' },
          ],
        },
      },
      {
        key: 'fat-percent',
        title: 'Жир, %',
        valueLabel: `${latest.bodyFatPercent.toFixed(1).replace('.', ',')}%`,
        statusLabel: getLevelLabel(latest.bodyFatPercent, 17, 22, 27),
        helper: 'Нормальный диапазон жира: 17-22%.',
        range: {
          min: 8,
          max: 40,
          value: latest.bodyFatPercent,
          ticks: [17, 22, 27],
          segments: [
            { end: 17, colorClass: 'bg-blue-500', label: 'Низкий' },
            { end: 22, colorClass: 'bg-lime-500', label: 'Нормальный' },
            { end: 27, colorClass: 'bg-amber-500', label: 'Выше среднего' },
            { end: 40, colorClass: 'bg-rose-500', label: 'Высокий' },
          ],
        },
      },
      {
        key: 'fat-mass',
        title: 'Жир масса',
        valueLabel: `${fatMassKg.toFixed(1).replace('.', ',')} кг`,
        statusLabel: getLevelLabel(fatMassKg, fatMassLow, fatMassMid, fatMassHigh),
        helper: 'Показатель жировой массы из твоего замера.',
        range: {
          min: latest.weightKg * 0.1,
          max: latest.weightKg * 0.36,
          value: fatMassKg,
          ticks: [fatMassLow, fatMassMid, fatMassHigh],
          segments: [
            { end: fatMassLow, colorClass: 'bg-blue-500', label: 'Низкий' },
            { end: fatMassMid, colorClass: 'bg-lime-500', label: 'Нормальный' },
            { end: fatMassHigh, colorClass: 'bg-amber-500', label: 'Выше среднего' },
            { end: latest.weightKg * 0.36, colorClass: 'bg-rose-500', label: 'Высокий' },
          ],
        },
      },
      {
        key: 'bone',
        title: 'Костная масса',
        valueLabel: `${latest.boneMassKg.toFixed(1).replace('.', ',')} кг`,
        statusLabel: getLevelLabel(latest.boneMassKg, boneLow, boneMid, boneHigh),
        helper: 'Поддержка костной массы: силовые + кальций + витамин D.',
        range: {
          min: latest.weightKg * 0.02,
          max: latest.weightKg * 0.065,
          value: latest.boneMassKg,
          ticks: [boneLow, boneMid, boneHigh],
          segments: [
            { end: boneLow, colorClass: 'bg-blue-500', label: 'Низкий' },
            { end: boneMid, colorClass: 'bg-lime-500', label: 'Нормальный' },
            { end: boneHigh, colorClass: 'bg-amber-500', label: 'Выше среднего' },
            { end: latest.weightKg * 0.065, colorClass: 'bg-rose-500', label: 'Высокий' },
          ],
        },
      },
      {
        key: 'muscle',
        title: 'Мышечная масса',
        valueLabel: `${latest.muscleMassKg.toFixed(1).replace('.', ',')} кг`,
        statusLabel: getLevelLabel(latest.muscleMassKg, muscleLow, muscleMid, muscleHigh),
        helper: 'Рост мышц помогает ускорять метаболизм и сохранять форму.',
        range: {
          min: latest.weightKg * 0.2,
          max: latest.weightKg * 0.55,
          value: latest.muscleMassKg,
          ticks: [muscleLow, muscleMid, muscleHigh],
          segments: [
            { end: muscleLow, colorClass: 'bg-blue-500', label: 'Низкий' },
            { end: muscleMid, colorClass: 'bg-lime-500', label: 'Нормальный' },
            { end: muscleHigh, colorClass: 'bg-amber-500', label: 'Выше среднего' },
            { end: latest.weightKg * 0.55, colorClass: 'bg-rose-500', label: 'Высокий' },
          ],
        },
      },
      {
        key: 'water',
        title: 'Вода',
        valueLabel: `${latest.waterPercent.toFixed(1).replace('.', ',')}%`,
        statusLabel: getLevelLabel(latest.waterPercent, 50, 58, 65),
        helper: 'Стабильная гидратация улучшает самочувствие и восстановление.',
        range: {
          min: 40,
          max: 75,
          value: latest.waterPercent,
          ticks: [50, 58, 65],
          segments: [
            { end: 50, colorClass: 'bg-blue-500', label: 'Низкий' },
            { end: 58, colorClass: 'bg-lime-500', label: 'Нормальный' },
            { end: 65, colorClass: 'bg-amber-500', label: 'Выше среднего' },
            { end: 75, colorClass: 'bg-rose-500', label: 'Высокий' },
          ],
        },
      },
      {
        key: 'protein',
        title: 'Белок',
        valueLabel: `${latest.proteinPercent.toFixed(1).replace('.', ',')}%`,
        statusLabel: getLevelLabel(latest.proteinPercent, 16, 18, 21),
        helper: 'Белок важен для сохранения мышц во время снижения веса.',
        range: {
          min: 10,
          max: 25,
          value: latest.proteinPercent,
          ticks: [16, 18, 21],
          segments: [
            { end: 16, colorClass: 'bg-blue-500', label: 'Низкий' },
            { end: 18, colorClass: 'bg-lime-500', label: 'Нормальный' },
            { end: 21, colorClass: 'bg-amber-500', label: 'Выше среднего' },
            { end: 25, colorClass: 'bg-rose-500', label: 'Высокий' },
          ],
        },
      },
      {
        key: 'visceral-fat',
        title: 'Висцеральный жир',
        valueLabel: latest.visceralFatLevel.toFixed(0),
        statusLabel: getLevelLabel(latest.visceralFatLevel, 7, 10, 15),
        helper: 'Лучше держать этот показатель ближе к нижним значениям.',
        range: {
          min: 1,
          max: 25,
          value: latest.visceralFatLevel,
          ticks: [7, 10, 15],
          segments: [
            { end: 7, colorClass: 'bg-blue-500', label: 'Низкий' },
            { end: 10, colorClass: 'bg-lime-500', label: 'Нормальный' },
            { end: 15, colorClass: 'bg-amber-500', label: 'Выше среднего' },
            { end: 25, colorClass: 'bg-rose-500', label: 'Высокий' },
          ],
        },
      },
    ];
  }, [insights, latest, profile]);

  const defaults = useMemo<MeasurementInput>(() => {
    if (latest) {
      return {
        date: today(),
        weightKg: latest.weightKg,
        bmi: latest.bmi > 0 ? latest.bmi : insights?.bmi ?? 0,
        fatMassKg: latest.fatMassKg > 0 ? latest.fatMassKg : insights?.fatMassKg ?? 0,
        steps: latest.steps,
        boneMassKg: latest.boneMassKg,
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
  }, [insights, latest, profile]);

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
                    <TabsList className="w-full justify-start gap-1 overflow-x-auto whitespace-nowrap">
                      <TabsTrigger value="weight">Вес</TabsTrigger>
                      <TabsTrigger value="bmi">ИМТ</TabsTrigger>
                      <TabsTrigger value="steps">Шаги</TabsTrigger>
                      <TabsTrigger value="fat">Жир</TabsTrigger>
                      <TabsTrigger value="fat-mass">Жир масса</TabsTrigger>
                      <TabsTrigger value="bone-mass">Кость</TabsTrigger>
                      <TabsTrigger value="muscle">Мышцы</TabsTrigger>
                      <TabsTrigger value="water">Вода</TabsTrigger>
                      <TabsTrigger value="protein">Белок</TabsTrigger>
                      <TabsTrigger value="visceral">Висцеральный жир</TabsTrigger>
                      <TabsTrigger value="bmr">Осн. обмен</TabsTrigger>
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
                    <TabsContent value="bmi">
                      <MetricTrendChart
                        data={measurements}
                        metricKey="bmi"
                        stroke="#f97316"
                        fill="#f97316"
                        unit=""
                        heightCm={profile.heightCm}
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
                    <TabsContent value="fat-mass">
                      <MetricTrendChart
                        data={measurements}
                        metricKey="fatMassKg"
                        stroke="#f97316"
                        fill="#f97316"
                        unit=" кг"
                      />
                    </TabsContent>
                    <TabsContent value="bone-mass">
                      <MetricTrendChart
                        data={measurements}
                        metricKey="boneMassKg"
                        stroke="#22c55e"
                        fill="#22c55e"
                        unit=" кг"
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
                    <TabsContent value="protein">
                      <MetricTrendChart
                        data={measurements}
                        metricKey="proteinPercent"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        unit="%"
                      />
                    </TabsContent>
                    <TabsContent value="visceral">
                      <MetricTrendChart
                        data={measurements}
                        metricKey="visceralFatLevel"
                        stroke="#ef4444"
                        fill="#ef4444"
                        unit=""
                      />
                    </TabsContent>
                    <TabsContent value="bmr">
                      <MetricTrendChart
                        data={measurements}
                        metricKey="bmrKcal"
                        stroke="#0ea5e9"
                        fill="#0ea5e9"
                        unit=" ккал"
                        heightCm={profile.heightCm}
                        age={profile.age}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.12 }}
            >
              <Card className="border bg-card/90">
                <CardHeader>
                  <CardTitle>Подробные диапазоны показателей</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {detailedMetrics.map((item) => (
                    <div key={item.key} className="rounded-xl border bg-muted/20 p-3 sm:p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold sm:text-lg">{item.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{item.helper}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-semibold sm:text-2xl">{item.valueLabel}</p>
                          <p className="text-sm text-muted-foreground">{item.statusLabel}</p>
                        </div>
                      </div>
                      <RangeBar
                        className="mt-4"
                        min={item.range.min}
                        max={item.range.max}
                        value={item.range.value}
                        ticks={item.range.ticks}
                        segments={item.range.segments}
                      />
                    </div>
                  ))}
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
