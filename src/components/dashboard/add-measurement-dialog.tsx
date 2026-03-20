import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { MeasurementInput } from '@/types';
import { format, isValid, parse, parseISO } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';

interface AddMeasurementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaults: MeasurementInput;
  onSubmit: (payload: MeasurementInput) => Promise<void>;
  isSaving: boolean;
}

const numberFields = [
  'weightKg',
  'bmi',
  'bodyFatPercent',
  'fatMassKg',
  'waterPercent',
  'proteinPercent',
  'visceralFatLevel',
  'muscleMassKg',
  'boneMassKg',
  'steps',
] as const;

type NumberField = (typeof numberFields)[number];

const parseNumber = (value: string, fallback = 0): number => {
  const parsed = Number(value.replace(',', '.'));
  if (Number.isNaN(parsed)) {
    return fallback;
  }

  return parsed;
};

export function AddMeasurementDialog({
  open,
  onOpenChange,
  defaults,
  onSubmit,
  isSaving,
}: AddMeasurementDialogProps) {
  const [form, setForm] = useState<MeasurementInput>(defaults);
  const [displayDate, setDisplayDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  const formatDate = (isoDate: string): string => {
    try {
      return format(parseISO(isoDate), 'dd.MM.yyyy');
    } catch {
      return isoDate;
    }
  };

  const parseDate = (input: string): string | null => {
    const normalized = input.trim();
    const parsed = parse(normalized, 'dd.MM.yyyy', new Date());
    if (isValid(parsed)) {
      return format(parsed, 'yyyy-MM-dd');
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
      return normalized;
    }

    return null;
  };

  useEffect(() => {
    if (open) {
      setForm(defaults);
      setDisplayDate(formatDate(defaults.date));
      setError(null);
    }
  }, [defaults, open]);

  const labels = useMemo<Record<NumberField, string>>(
    () => ({
      weightKg: 'Вес, кг',
      bmi: 'ИМТ',
      fatMassKg: 'Жир масса, кг',
      steps: 'Шаги',
      boneMassKg: 'Костная масса, кг',
      bodyFatPercent: 'Жир, %',
      muscleMassKg: 'Мышечная масса, кг',
      waterPercent: 'Вода, %',
      proteinPercent: 'Белок, %',
      visceralFatLevel: 'Висцеральный жир',
    }),
    [],
  );

  const handleNumberField = (field: NumberField, value: string) => {
    const parsed = parseNumber(value, form[field]);
    setForm((previous) => ({
      ...previous,
      [field]: field === 'steps' ? Math.max(0, Math.round(parsed)) : parsed,
    }));
  };

  const handleSave = async () => {
    const parsedDate = parseDate(displayDate);

    if (!parsedDate) {
      setError('Укажи дату в формате ДД.ММ.ГГГГ.');
      return;
    }

    if (form.weightKg <= 0) {
      setError('Вес должен быть больше нуля.');
      return;
    }

    if (form.bodyFatPercent <= 0) {
      setError('Процент жира должен быть больше нуля.');
      return;
    }

    if (form.bmi <= 0) {
      setError('ИМТ должен быть больше нуля.');
      return;
    }

    if (form.fatMassKg <= 0) {
      setError('Жир масса должна быть больше нуля.');
      return;
    }

    if (form.steps < 0) {
      setError('Шаги не могут быть отрицательными.');
      return;
    }

    if (form.boneMassKg <= 0) {
      setError('Костная масса должна быть больше нуля.');
      return;
    }

    setError(null);
    await onSubmit({ ...form, date: parsedDate });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Новый замер</DialogTitle>
          <DialogDescription>
            Поля уже предзаполнены прошлым замером. Подкорректируй и сохрани.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="date">Дата</Label>
            <Input
              id="date"
              type="text"
              placeholder="20.03.2026"
              value={displayDate}
              onChange={(event) => setDisplayDate(event.target.value)}
            />
          </div>

          {numberFields.map((field) => (
            <div key={field} className="space-y-1.5">
              <Label htmlFor={field}>{labels[field]}</Label>
              <Input
                id={field}
                inputMode={field === 'steps' ? 'numeric' : 'decimal'}
                type="number"
                step={field === 'steps' ? '1' : '0.1'}
                value={form[field]}
                onChange={(event) => handleNumberField(field, event.target.value)}
              />
            </div>
          ))}

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="note">Заметка</Label>
            <Textarea
              id="note"
              placeholder="Как себя чувствуешь, что поменялось..."
              value={form.note ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
            />
          </div>
        </div>

        {error ? <p className="text-sm text-rose-500">{error}</p> : null}

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Сохраняем...' : 'Сохранить замер'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
