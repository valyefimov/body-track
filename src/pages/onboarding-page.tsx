import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createMeasurement, saveProfile } from '@/features/body/bodySlice';
import { getInitialMeasurement } from '@/lib/health';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function OnboardingPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const { measurements, saveStatus, error } = useAppSelector((state) => state.body);

  const [age, setAge] = useState(30);
  const [heightCm, setHeightCm] = useState(178);
  const [startWeightKg, setStartWeightKg] = useState(84);
  const [formError, setFormError] = useState<string | null>(null);

  const disabled = saveStatus === 'loading';

  const helper = useMemo(() => {
    const bmi = startWeightKg / (heightCm / 100) ** 2;
    return `Предварительный ИМТ: ${bmi.toFixed(1)}`;
  }, [heightCm, startWeightKg]);

  const handleSubmit = async () => {
    if (!user) {
      return;
    }

    if (age < 10 || age > 100) {
      setFormError('Возраст должен быть в диапазоне 10-100.');
      return;
    }

    if (heightCm < 120 || heightCm > 230) {
      setFormError('Рост должен быть в диапазоне 120-230 см.');
      return;
    }

    if (startWeightKg < 30 || startWeightKg > 300) {
      setFormError('Вес должен быть в диапазоне 30-300 кг.');
      return;
    }

    setFormError(null);

    try {
      const profile = {
        age,
        heightCm,
        startWeightKg,
      };

      await dispatch(saveProfile({ uid: user.uid, profile })).unwrap();

      if (measurements.length === 0) {
        const initialMeasurement = getInitialMeasurement(profile);
        await dispatch(
          createMeasurement({
            uid: user.uid,
            measurement: initialMeasurement,
          }),
        ).unwrap();
      }

      navigate('/dashboard', { replace: true });
    } catch {
      setFormError('Не удалось завершить регистрацию. Попробуй еще раз.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-lg"
      >
        <Card className="border bg-card/95 shadow-xl">
          <CardHeader>
            <CardTitle>Заполним профиль</CardTitle>
            <CardDescription>
              Нужны возраст, рост и вес. Дальше приложение само рассчитает ключевые показатели.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="age">Возраст</Label>
              <Input
                id="age"
                type="number"
                min={10}
                max={100}
                value={age}
                onChange={(event) => setAge(Number(event.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="height">Рост, см</Label>
              <Input
                id="height"
                type="number"
                min={120}
                max={230}
                value={heightCm}
                onChange={(event) => setHeightCm(Number(event.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="weight">Вес, кг</Label>
              <Input
                id="weight"
                type="number"
                min={30}
                max={300}
                step="0.1"
                value={startWeightKg}
                onChange={(event) => setStartWeightKg(Number(event.target.value))}
              />
            </div>

            <p className="rounded-xl bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              {helper}
            </p>

            {formError ? <p className="text-sm text-rose-500">{formError}</p> : null}
            {error ? <p className="text-sm text-rose-500">{error}</p> : null}

            <Button className="w-full" onClick={handleSubmit} disabled={disabled}>
              {disabled ? 'Сохраняем профиль...' : 'Продолжить'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
