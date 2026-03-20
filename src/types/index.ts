export type MetricTone = 'success' | 'warning' | 'danger' | 'neutral';

export interface AuthUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
}

export interface UserProfile {
  age: number;
  heightCm: number;
  startWeightKg: number;
  createdAt: number;
  updatedAt: number;
}

export interface MeasurementInput {
  date: string;
  weightKg: number;
  bmi: number;
  fatMassKg: number;
  steps: number;
  boneMassKg: number;
  bodyFatPercent: number;
  muscleMassKg: number;
  waterPercent: number;
  proteinPercent: number;
  visceralFatLevel: number;
  note?: string;
}

export interface BodyMeasurement extends MeasurementInput {
  id: string;
  createdAt: number;
}

export interface MetricStatus {
  tone: MetricTone;
  label: string;
}

export interface InsightMetric {
  title: string;
  value: number;
  unit: string;
  status: MetricStatus;
  helper: string;
}

export interface DashboardInsights {
  bmi: number;
  idealWeightKg: number;
  healthyRange: {
    min: number;
    max: number;
  };
  bmrKcal: number;
  fatMassKg: number;
  bodyScore: number;
  targetToLoseKg: number;
  motivation: string;
  recommendations: string[];
  metrics: InsightMetric[];
}
