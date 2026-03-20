import { MetricTrendChart } from '@/components/charts/metric-trend-chart';
import { AddMeasurementDialog } from '@/components/dashboard/add-measurement-dialog';
import { MetricDetailCard } from '@/components/dashboard/metric-detail-card';
import { MobileBottomNav } from '@/components/dashboard/mobile-bottom-nav';
import { RangeBar } from '@/components/dashboard/range-bar';
import { SemiGauge } from '@/components/dashboard/semi-gauge';
import { TrendChangeCard } from '@/components/dashboard/trend-change-card';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { logout } from '@/features/auth/authSlice';
import { createMeasurement } from '@/features/body/bodySlice';
import { calculateInsights, getInitialMeasurement } from '@/lib/health';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { MeasurementInput } from '@/types';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  ArrowLeft,
  Bone,
  Dna,
  Flame,
  LogOut,
  Menu,
  Plus,
  Share2,
  StretchHorizontal,
  Waves,
} from 'lucide-react';
import { useMemo, useState } from 'react';

const today = () => new Date().toISOString().slice(0, 10);

const bodyScoreLabel = (score: number): string => {
  if (score >= 80) {
    return 'Отлично';
  }
  if (score >= 65) {
    return 'Хорошо';
  }
  if (score >= 50) {
    return 'Средне';
  }

  return 'Плохо';
};

export function DashboardPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { profile, measurements, saveStatus } = useAppSelector((state) => state.body);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const latest = measurements.length > 0 ? measurements[measurements.length - 1] : null;
  const previous = measurements.length > 1 ? measurements[measurements.length - 2] : null;
  const historyRef =
    measurements.length > 80 ? measurements[measurements.length - 80] : (measurements[0] ?? null);

  const insights = useMemo(() => {
    if (!profile || !latest) {
      return null;
    }

    return calculateInsights(profile, latest, previous);
  }, [latest, previous, profile]);

  const defaults = useMemo<MeasurementInput>(() => {
    if (latest) {
      return {
        date: today(),
        weightKg: latest.weightKg,
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

  const detailCards = useMemo(() => {
    if (!latest || !insights) {
      return [];
    }

    return [
      {
        key: 'bmi',
        icon: StretchHorizontal,
        iconColorClass: 'text-orange-500',
        title: 'ИМТ',
        value: insights.bmi.toFixed(1).replace('.', ','),
        status: insights.metrics[0].status.label,
        description:
          'Ваш ИМТ выше нормы. Небольшой дефицит калорий и регулярная активность помогут вернуться в здоровый диапазон.',
        range: {
          min: 14,
          max: 36,
          value: insights.bmi,
          ticks: [18.5, 25, 30],
          segments: [
            { end: 18.5, colorClass: 'bg-blue-500', label: 'Низкий' },
            { end: 25, colorClass: 'bg-lime-500', label: 'Нормальный' },
            { end: 30, colorClass: 'bg-amber-500', label: 'Выше среднего' },
            { end: 36, colorClass: 'bg-rose-500', label: 'Высокий' },
          ],
        },
      },
      {
        key: 'fat',
        icon: Flame,
        iconColorClass: 'text-orange-500',
        title: 'Жир',
        value: `${latest.bodyFatPercent.toFixed(1).replace('.', ',')}%`,
        status: insights.metrics[1].status.label,
        description:
          'Нормальный объём жира: 17-22%. Сохраняй дефицит калорий, сон и силовые тренировки для устойчивого снижения.',
        range: {
          min: 8,
          max: 32,
          value: latest.bodyFatPercent,
          ticks: [11, 17, 22, 27],
          segments: [
            { end: 11, colorClass: 'bg-blue-600', label: 'Очень низкий' },
            { end: 17, colorClass: 'bg-blue-500', label: 'Низкий' },
            { end: 22, colorClass: 'bg-lime-500', label: 'Нормальный' },
            { end: 27, colorClass: 'bg-amber-500', label: 'Выше среднего' },
            { end: 32, colorClass: 'bg-rose-500', label: 'Высокий' },
          ],
        },
      },
      {
        key: 'water',
        icon: Waves,
        iconColorClass: 'text-orange-500',
        title: 'Вода',
        value: `${latest.waterPercent.toFixed(1).replace('.', ',')}%`,
        status: insights.metrics[3].status.label,
        description:
          'Недостаток воды часто маскирует прогресс в жиросжигании. Пей воду равномерно в течение дня.',
        range: {
          min: 40,
          max: 74,
          value: latest.waterPercent,
          ticks: [55, 65.1],
          segments: [
            { end: 55, colorClass: 'bg-rose-500', label: 'Недостаточный' },
            { end: 65.1, colorClass: 'bg-lime-500', label: 'Нормальный' },
            { end: 74, colorClass: 'bg-blue-500', label: 'Отличный' },
          ],
        },
      },
      {
        key: 'protein',
        icon: Dna,
        iconColorClass: 'text-orange-500',
        title: 'Белок',
        value: `${latest.proteinPercent.toFixed(1).replace('.', ',')}%`,
        status: insights.metrics[4].status.label,
        description:
          'Дефицит белка снижает качество восстановления и иммунитет. Добавляй белок в каждый приём пищи.',
        range: {
          min: 12,
          max: 22,
          value: latest.proteinPercent,
          ticks: [16, 18],
          segments: [
            { end: 16, colorClass: 'bg-rose-500', label: 'Недостаточный' },
            { end: 18, colorClass: 'bg-lime-500', label: 'Нормальный' },
            { end: 22, colorClass: 'bg-blue-500', label: 'Отличный' },
          ],
        },
      },
      {
        key: 'bmr',
        icon: Bone,
        iconColorClass: 'text-orange-500',
        title: 'Основной обмен',
        value: `${insights.bmrKcal.toFixed(0)} ккал`,
        status: 'Цели не достигнуты',
        description:
          'Более высокий метаболизм помогает держать вес под контролем. Силовые тренировки и сон работают лучше всего.',
        range: {
          min: Math.max(1200, insights.bmrKcal - 700),
          max: insights.bmrKcal + 700,
          value: insights.bmrKcal,
          ticks: [insights.bmrKcal + 400],
          segments: [
            { end: insights.bmrKcal, colorClass: 'bg-rose-500', label: 'Цели не достигнуты' },
            { end: insights.bmrKcal + 700, colorClass: 'bg-lime-500', label: 'Достичь цели' },
          ],
        },
      },
      {
        key: 'visceral',
        icon: Bone,
        iconColorClass: 'text-orange-500',
        title: 'Висцеральный жир',
        value: latest.visceralFatLevel.toFixed(0),
        status: insights.metrics[5].status.label,
        description:
          'Висцеральный жир должен быть ниже 9. Кардио, питание и сон помогут стабильно снижать показатель.',
        range: {
          min: 1,
          max: 20,
          value: latest.visceralFatLevel,
          ticks: [10, 15],
          segments: [
            { end: 10, colorClass: 'bg-lime-500', label: 'Нормальный' },
            { end: 15, colorClass: 'bg-amber-500', label: 'Выше среднего' },
            { end: 20, colorClass: 'bg-rose-500', label: 'Высокий' },
          ],
        },
      },
    ];
  }, [insights, latest]);

  const achieved = detailCards.filter((card) => {
    return ['Норма', 'Нормальный ИМТ', 'Хорошо'].includes(card.status);
  });
  const notAchieved = detailCards.filter((card) => !achieved.includes(card));

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
      <div className="pb-24 md:pb-6">
        <div className="mx-auto w-full max-w-4xl">
          <header className="sticky top-0 z-20 border-b bg-background/95 px-4 py-3 backdrop-blur">
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
              <Button variant="ghost" size="icon" aria-label="Назад">
                <ArrowLeft className="size-5" />
              </Button>
              <div className="text-center">
                <p className="text-3xl leading-tight font-semibold">{user.displayName}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(), 'd MMMM в HH:mm', { locale: ru })}
                </p>
              </div>
              <div className="flex items-center gap-1 justify-self-end">
                <Button variant="ghost" size="icon" aria-label="Поделиться">
                  <Share2 className="size-5" />
                </Button>
                <Sheet>
                  <SheetTrigger
                    render={
                      <Button variant="ghost" size="icon" aria-label="Меню">
                        <Menu className="size-5" />
                      </Button>
                    }
                  />
                  <SheetContent side="right" className="w-[85vw] max-w-xs p-0">
                    <SheetHeader className="border-b p-4">
                      <SheetTitle>Настройки</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-3 p-4">
                      <ThemeToggle className="w-full justify-start" />
                      <Button
                        className="w-full justify-start"
                        variant="outline"
                        onClick={() => {
                          void dispatch(logout());
                        }}
                      >
                        <LogOut className="size-4" />
                        Выйти
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </header>

          <main className="space-y-4 bg-muted/25 pb-6">
            <section className="px-4 pt-4">
              <Card className="overflow-hidden border-0 bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-none">
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-base font-medium">Сегодняшний контроль</p>
                    <Button
                      className="rounded-full bg-white/20 text-white hover:bg-white/25"
                      onClick={() => setIsDialogOpen(true)}
                    >
                      <Plus className="size-4" />
                      Записать сейчас
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>

            {insights && latest ? (
              <>
                <section className="px-4">
                  <Card className="rounded-2xl border bg-card shadow-none">
                    <CardContent className="grid gap-4 p-4 md:grid-cols-2">
                      <div className="rounded-2xl bg-muted/40 p-3 text-center">
                        <p className="text-sm text-muted-foreground">Вес</p>
                        <SemiGauge
                          value={latest.weightKg}
                          min={40}
                          max={170}
                          colorClass="stroke-rose-500"
                        />
                        <p className="text-6xl font-semibold">
                          {latest.weightKg.toFixed(1).replace('.', ',')}
                        </p>
                        <p className="text-2xl text-rose-500">
                          {insights.bmi >= 30 ? 'Ожирение 1 ст.' : insights.metrics[0].status.label}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-muted/40 p-3 text-center">
                        <p className="text-sm text-muted-foreground">Оценка тела</p>
                        <SemiGauge
                          value={insights.bodyScore}
                          min={0}
                          max={100}
                          colorClass="stroke-rose-500"
                        />
                        <p className="text-6xl font-semibold">{insights.bodyScore}</p>
                        <p className="text-2xl text-rose-500">
                          {bodyScoreLabel(insights.bodyScore)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                <section className="border-y bg-card/95 px-4 py-4">
                  <p className="text-[2rem] leading-tight font-semibold">Идеальный вес</p>
                  <div className="mt-2 flex items-end justify-between">
                    <p className="text-lg text-muted-foreground">Рассчитанный ориентир</p>
                    <p className="text-5xl font-semibold">
                      {insights.idealWeightKg.toFixed(1).replace('.', ',')} кг
                    </p>
                  </div>
                  <RangeBar
                    className="mt-4"
                    min={Math.max(40, insights.healthyRange.min - 18)}
                    max={insights.healthyRange.max + 30}
                    value={latest.weightKg}
                    ticks={[
                      insights.healthyRange.min,
                      insights.healthyRange.max,
                      insights.healthyRange.max + 15,
                    ]}
                    segments={[
                      {
                        end: insights.healthyRange.min,
                        colorClass: 'bg-blue-500',
                        label: 'Недостаток веса',
                      },
                      {
                        end: insights.healthyRange.max,
                        colorClass: 'bg-lime-500',
                        label: 'Нормальный',
                      },
                      {
                        end: insights.healthyRange.max + 15,
                        colorClass: 'bg-amber-500',
                        label: 'Выше среднего',
                      },
                      {
                        end: insights.healthyRange.max + 30,
                        colorClass: 'bg-rose-500',
                        label: 'Высокий',
                      },
                    ]}
                  />
                </section>

                <TrendChangeCard
                  title="Последние изменения веса"
                  data={measurements}
                  metricKey="weightKg"
                  unit="кг"
                  stroke="#84cc16"
                  fill="#84cc16"
                  recentDelta={(latest.weightKg - (previous?.weightKg ?? latest.weightKg)) * -1}
                  historyDelta={(latest.weightKg - (historyRef?.weightKg ?? latest.weightKg)) * -1}
                  recentDateLabel={previous ? format(parseISO(previous.date), 'dd.MM') : 'сегодня'}
                  historyDateLabel={
                    historyRef ? format(parseISO(historyRef.date), 'dd.MM.yyyy') : 'старта'
                  }
                />

                <TrendChangeCard
                  title="Последние изменения показателя жира в организме"
                  data={measurements}
                  metricKey="bodyFatPercent"
                  unit="%"
                  stroke="#ef4444"
                  fill="#ef4444"
                  recentDelta={
                    (latest.bodyFatPercent - (previous?.bodyFatPercent ?? latest.bodyFatPercent)) *
                    -1
                  }
                  historyDelta={
                    (latest.bodyFatPercent -
                      (historyRef?.bodyFatPercent ?? latest.bodyFatPercent)) *
                    -1
                  }
                  recentDateLabel={previous ? format(parseISO(previous.date), 'dd.MM') : 'сегодня'}
                  historyDateLabel={
                    historyRef ? format(parseISO(historyRef.date), 'dd.MM.yyyy') : 'старта'
                  }
                />

                <TrendChangeCard
                  title="Изменение мышечной массы"
                  data={measurements}
                  metricKey="muscleMassKg"
                  unit="кг"
                  stroke="#f97316"
                  fill="#f97316"
                  recentDelta={
                    latest.muscleMassKg - (previous?.muscleMassKg ?? latest.muscleMassKg)
                  }
                  historyDelta={
                    latest.muscleMassKg - (historyRef?.muscleMassKg ?? latest.muscleMassKg)
                  }
                  recentDateLabel={previous ? format(parseISO(previous.date), 'dd.MM') : 'сегодня'}
                  historyDateLabel={
                    historyRef ? format(parseISO(historyRef.date), 'dd.MM.yyyy') : 'старта'
                  }
                />

                <section className="border-y bg-card/95 px-4 py-4">
                  <h2 className="text-5xl font-semibold">Оценка тела</h2>
                  <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
                    Оценка тела - это оценка, полученная путем анализа данных о росте, количестве
                    жира в организме, количестве воды, мышечной массы и других показателей.
                  </p>
                </section>

                <section className="space-y-0">
                  <div className="border-b bg-card/95 px-4 py-3">
                    <h3 className="text-[2rem] font-semibold">
                      {notAchieved.length} элементов не достигли цели
                    </h3>
                  </div>
                  {notAchieved.map((card, index) => (
                    <MetricDetailCard
                      key={card.key}
                      icon={card.icon}
                      iconColorClass={card.iconColorClass}
                      title={card.title}
                      value={card.value}
                      status={card.status}
                      description={card.description}
                      range={card.range}
                      defaultOpen={index < 2}
                    />
                  ))}
                </section>

                <section className="space-y-0">
                  <div className="border-y bg-card/95 px-4 py-3">
                    <h3 className="text-[2rem] font-semibold">Достигнуто {achieved.length} цели</h3>
                  </div>
                  {achieved.map((card) => (
                    <Card
                      key={`achieved-${card.key}`}
                      className="rounded-none border-x-0 border-y bg-card/95 shadow-none"
                    >
                      <CardContent className="flex items-center justify-between px-4 py-4">
                        <div>
                          <p className="text-3xl font-semibold">
                            {card.title} {card.value}
                          </p>
                          <p className="text-xl text-lime-600">Отличный</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </section>

                <section className="px-4 pb-2">
                  <Card className="border bg-card">
                    <CardHeader>
                      <CardTitle className="text-3xl">История всех данных</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <MetricTrendChart
                        data={measurements}
                        metricKey="weightKg"
                        stroke="#84cc16"
                        fill="#84cc16"
                        unit=" кг"
                      />
                    </CardContent>
                  </Card>
                </section>
              </>
            ) : (
              <section className="px-4 pb-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Добавь первый замер</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      После первого замера появится аналитика и персональные рекомендации.
                    </p>
                  </CardContent>
                </Card>
              </section>
            )}
          </main>
        </div>
      </div>

      <MobileBottomNav />

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
