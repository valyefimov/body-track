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
  'bodyFatPercent',
  'muscleMassKg',
  'waterPercent',
  'proteinPercent',
  'visceralFatLevel',
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(defaults);
      setError(null);
    }
  }, [defaults, open]);

  const labels = useMemo<Record<NumberField, string>>(
    () => ({
      weightKg: 'Вес, кг',
      bodyFatPercent: 'Жир, %',
      muscleMassKg: 'Мышечная масса, кг',
      waterPercent: 'Вода, %',
      proteinPercent: 'Белок, %',
      visceralFatLevel: 'Висцеральный жир',
    }),
    [],
  );

  const handleNumberField = (field: NumberField, value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: parseNumber(value, previous[field]),
    }));
  };

  const handleSave = async () => {
    if (!form.date) {
      setError('Укажи дату замера.');
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

    setError(null);
    await onSubmit(form);
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
              type="date"
              value={form.date}
              onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
            />
          </div>

          {numberFields.map((field) => (
            <div key={field} className="space-y-1.5">
              <Label htmlFor={field}>{labels[field]}</Label>
              <Input
                id={field}
                inputMode="decimal"
                type="number"
                step="0.1"
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
