import type {
  BodyMeasurement,
  DashboardInsights,
  InsightMetric,
  MeasurementInput,
  MetricStatus,
  UserProfile,
} from '@/types';

const round = (value: number, precision = 1): number => {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
};

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, value));
};

const statusByRange = (value: number, min: number, max: number): MetricStatus => {
  if (value < min) {
    return { tone: 'warning', label: 'Ниже нормы' };
  }

  if (value > max) {
    return { tone: 'danger', label: 'Выше нормы' };
  }

  return { tone: 'success', label: 'Норма' };
};

const statusByMax = (value: number, max: number): MetricStatus => {
  if (value <= max) {
    return { tone: 'success', label: 'Норма' };
  }

  if (value <= max + 4) {
    return { tone: 'warning', label: 'Повышено' };
  }

  return { tone: 'danger', label: 'Высокий риск' };
};

const bmiStatus = (bmi: number): MetricStatus => {
  if (bmi < 18.5) {
    return { tone: 'warning', label: 'Недостаток веса' };
  }
  if (bmi < 25) {
    return { tone: 'success', label: 'Нормальный ИМТ' };
  }
  if (bmi < 30) {
    return { tone: 'warning', label: 'Избыточный вес' };
  }

  return { tone: 'danger', label: 'Ожирение' };
};

const scoreFromRange = (value: number, min: number, max: number): number => {
  if (value >= min && value <= max) {
    const middle = (min + max) / 2;
    const span = Math.max((max - min) / 2, 0.01);
    return clamp(100 - (Math.abs(value - middle) / span) * 20, 80, 100);
  }

  const distance = value < min ? min - value : value - max;
  return clamp(80 - distance * 6, 0, 79);
};

const scoreFromMax = (value: number, max: number): number => {
  if (value <= max) {
    return clamp(100 - (max - value) * 2, 80, 100);
  }

  return clamp(80 - (value - max) * 10, 0, 79);
};

const deriveInitialMeasurement = (
  profile: Pick<UserProfile, 'age' | 'heightCm' | 'startWeightKg'>,
) => {
  const heightMeters = profile.heightCm / 100;
  const bmi = profile.startWeightKg / (heightMeters * heightMeters);
  const bodyFatPercent = clamp(round(19 + (bmi - 22) * 1.2), 10, 45);
  const steps = clamp(Math.round(5500 - (bmi - 25) * 220), 2500, 12000);
  const muscleMassKg = clamp(
    round(profile.startWeightKg * (0.52 - (bmi - 22) * 0.005), 2),
    20,
    100,
  );
  const waterPercent = clamp(round(60 - (bmi - 22) * 0.8), 35, 70);
  const proteinPercent = clamp(round(18 - (bmi - 22) * 0.2), 10, 24);
  const visceralFatLevel = clamp(Math.round(8 + (bmi - 25) * 0.8), 3, 22);

  return {
    date: new Date().toISOString().slice(0, 10),
    weightKg: profile.startWeightKg,
    steps,
    bodyFatPercent,
    muscleMassKg,
    waterPercent,
    proteinPercent,
    visceralFatLevel,
    note: 'Стартовая запись',
  } satisfies MeasurementInput;
};

const getMotivation = (
  latest: BodyMeasurement,
  previous: BodyMeasurement | null,
  targetToLoseKg: number,
  bodyScore: number,
): string => {
  if (!previous) {
    return 'Ты отлично стартовал. Добавляй записи регулярно, и мы покажем тренды и персональные советы.';
  }

  const weightDelta = round(latest.weightKg - previous.weightKg, 2);
  const fatDelta = round(latest.bodyFatPercent - previous.bodyFatPercent, 2);

  if (targetToLoseKg > 0 && weightDelta < -0.2 && fatDelta <= 0) {
    return `Супер динамика: вес ${Math.abs(weightDelta)} кг вниз и жир тоже снижается. Держи темп.`;
  }

  if (targetToLoseKg > 0 && weightDelta > 0.3 && fatDelta > 0.2) {
    return 'Вес и процент жира немного выросли. Не ругай себя: верни режим сна, шаги и воду на 5-7 дней.';
  }

  if (Math.abs(weightDelta) <= 0.2) {
    return 'Стабильность это тоже прогресс. Продолжай в том же ритме и добавь немного активности.';
  }

  if (bodyScore >= 80) {
    return 'Форма близка к отличной. Фокус на удержание: белок, сон и 2-3 силовые тренировки в неделю.';
  }

  return 'Ты на верном пути. Даже небольшие шаги каждый день дают заметный результат к концу месяца.';
};

const getRecommendations = (
  latest: BodyMeasurement,
  profile: UserProfile,
  bmi: number,
  targetToLoseKg: number,
): string[] => {
  const recommendations: string[] = [];

  if (bmi > 25) {
    recommendations.push(
      'Сделай умеренный дефицит калорий 10-15% и отслеживай вес 3-4 раза в неделю.',
    );
  }

  if (latest.bodyFatPercent > 25) {
    recommendations.push(
      'Добавь 2-3 силовые тренировки и 7-10 тыс. шагов: это лучше всего снижает жир.',
    );
  }

  if (latest.steps < 7000) {
    recommendations.push('Постепенно увеличивай дневную активность до 7-10 тыс. шагов.');
  }

  if (latest.waterPercent < 50) {
    recommendations.push(
      'Увеличь воду до 30-35 мл на кг веса и следи за электролитами после тренировок.',
    );
  }

  if (latest.proteinPercent < 16 || latest.muscleMassKg / latest.weightKg < 0.38) {
    recommendations.push(
      'Цель по белку: 1.6-2.0 г на кг целевого веса. Распредели по 3-4 приёмам пищи.',
    );
  }

  if (latest.visceralFatLevel > 10) {
    recommendations.push(
      'Для снижения висцерального жира важны регулярный сон (7-8 ч) и отказ от поздних перекусов.',
    );
  }

  if (profile.age > 45) {
    recommendations.push(
      'Добавь лёгкую силовую нагрузку и растяжку для поддержки мышц и суставов.',
    );
  }

  if (targetToLoseKg > 0) {
    recommendations.push(
      `Текущая цель: снизить около ${round(targetToLoseKg, 1)} кг жировой массы безопасно.`,
    );
  }

  return recommendations.slice(0, 5);
};

export const getMetricColor = (status: MetricStatus): string => {
  if (status.tone === 'success') {
    return 'text-emerald-500';
  }
  if (status.tone === 'warning') {
    return 'text-amber-500';
  }
  if (status.tone === 'danger') {
    return 'text-rose-500';
  }

  return 'text-muted-foreground';
};

export const formatMetric = (value: number, unit: string): string => {
  return `${round(value, 1)}${unit}`;
};

export const calculateInsights = (
  profile: UserProfile,
  latest: BodyMeasurement,
  previous: BodyMeasurement | null,
): DashboardInsights => {
  const heightMeters = profile.heightCm / 100;
  const bmi = latest.weightKg / (heightMeters * heightMeters);
  const idealWeightKg = 22 * (heightMeters * heightMeters);
  const healthyRange = {
    min: round(18.5 * (heightMeters * heightMeters), 1),
    max: round(24.9 * (heightMeters * heightMeters), 1),
  };
  const bmrKcal = 10 * latest.weightKg + 6.25 * profile.heightCm - 5 * profile.age + 5;
  const fatMassKg = latest.weightKg * (latest.bodyFatPercent / 100);
  const targetBodyFat = 20;
  const targetToLoseKg = Math.max(0, fatMassKg - latest.weightKg * (targetBodyFat / 100));

  const bodyScore = Math.round(
    scoreFromRange(bmi, 18.5, 24.9) * 0.25 +
      scoreFromRange(latest.bodyFatPercent, 14, 24) * 0.25 +
      scoreFromRange(latest.waterPercent, 50, 65) * 0.15 +
      scoreFromRange(latest.proteinPercent, 16, 20) * 0.1 +
      scoreFromMax(latest.visceralFatLevel, 10) * 0.25,
  );

  const metrics: InsightMetric[] = [
    {
      title: 'ИМТ',
      value: round(bmi, 1),
      unit: '',
      status: bmiStatus(bmi),
      helper: `Здоровый диапазон ${healthyRange.min}-${healthyRange.max} кг.`,
    },
    {
      title: 'Шаги',
      value: latest.steps,
      unit: '',
      status:
        latest.steps >= 10000
          ? { tone: 'success', label: 'Отлично' }
          : latest.steps >= 7000
            ? { tone: 'warning', label: 'Близко к цели' }
            : { tone: 'danger', label: 'Мало активности' },
      helper: 'Цель для снижения веса: 7 000-10 000 шагов в день.',
    },
    {
      title: 'Жир',
      value: latest.bodyFatPercent,
      unit: '%',
      status: statusByRange(latest.bodyFatPercent, 14, 24),
      helper: `Жировая масса ${round(fatMassKg, 1)} кг.`,
    },
    {
      title: 'Мышцы',
      value: latest.muscleMassKg,
      unit: ' кг',
      status:
        latest.muscleMassKg / latest.weightKg >= 0.38
          ? { tone: 'success', label: 'Хорошо' }
          : { tone: 'warning', label: 'Нужно усилить' },
      helper: 'Поддерживай мышцы силовыми и белком.',
    },
    {
      title: 'Вода',
      value: latest.waterPercent,
      unit: '%',
      status: statusByRange(latest.waterPercent, 50, 65),
      helper: 'Стабильная гидратация помогает быстрее восстанавливаться.',
    },
    {
      title: 'Белок',
      value: latest.proteinPercent,
      unit: '%',
      status: statusByRange(latest.proteinPercent, 16, 20),
      helper: 'Белок нужен для сохранения мышц при похудении.',
    },
    {
      title: 'Висцеральный жир',
      value: latest.visceralFatLevel,
      unit: '',
      status: statusByMax(latest.visceralFatLevel, 10),
      helper: 'Ориентир: держать показатель ниже 10.',
    },
    {
      title: 'Основной обмен',
      value: round(bmrKcal, 0),
      unit: ' ккал',
      status: { tone: 'neutral', label: 'Инфо' },
      helper: 'Базовая энергия в покое, без активности.',
    },
  ];

  return {
    bmi: round(bmi, 1),
    idealWeightKg: round(idealWeightKg, 1),
    healthyRange,
    bmrKcal: round(bmrKcal, 0),
    fatMassKg: round(fatMassKg, 1),
    bodyScore,
    targetToLoseKg: round(targetToLoseKg, 1),
    motivation: getMotivation(latest, previous, targetToLoseKg, bodyScore),
    recommendations: getRecommendations(latest, profile, bmi, targetToLoseKg),
    metrics,
  };
};

export const getInitialMeasurement = (
  profile: Pick<UserProfile, 'age' | 'heightCm' | 'startWeightKg'>,
): MeasurementInput => {
  return deriveInitialMeasurement(profile);
};
