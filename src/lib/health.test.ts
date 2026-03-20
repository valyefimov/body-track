import { calculateInsights, getInitialMeasurement } from '@/lib/health';
import type { BodyMeasurement, UserProfile } from '@/types';
import { describe, expect, it } from 'vitest';

describe('health helpers', () => {
  it('calculates dashboard insights from profile and latest measurement', () => {
    const profile: UserProfile = {
      age: 32,
      heightCm: 182,
      startWeightKg: 96,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const latest: BodyMeasurement = {
      id: '1',
      date: '2026-03-20',
      weightKg: 94.4,
      steps: 6400,
      bodyFatPercent: 28.4,
      muscleMassKg: 38.2,
      waterPercent: 49.1,
      proteinPercent: 15.7,
      visceralFatLevel: 13,
      note: '',
      createdAt: Date.now(),
    };

    const previous: BodyMeasurement = {
      ...latest,
      id: '2',
      date: '2026-03-19',
      weightKg: 95.2,
      bodyFatPercent: 29.1,
    };

    const insights = calculateInsights(profile, latest, previous);

    expect(insights.bodyScore).toBeGreaterThan(0);
    expect(insights.metrics.length).toBeGreaterThan(5);
    expect(insights.recommendations.length).toBeGreaterThan(0);
    expect(insights.idealWeightKg).toBeGreaterThan(70);
  });

  it('creates starter measurement from onboarding profile', () => {
    const initial = getInitialMeasurement({
      age: 29,
      heightCm: 175,
      startWeightKg: 84,
    });

    expect(initial.weightKg).toBe(84);
    expect(initial.bodyFatPercent).toBeGreaterThan(0);
    expect(initial.visceralFatLevel).toBeGreaterThan(0);
  });
});
