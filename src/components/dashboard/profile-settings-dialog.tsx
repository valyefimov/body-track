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
import type { UserProfile } from '@/types';
import { useEffect, useState } from 'react';

interface ProfileSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: UserProfile;
  isSaving: boolean;
  onSubmit: (payload: { age: number; heightCm: number; startWeightKg: number }) => Promise<void>;
}

export function ProfileSettingsDialog({
  open,
  onOpenChange,
  profile,
  isSaving,
  onSubmit,
}: ProfileSettingsDialogProps) {
  const [age, setAge] = useState(profile.age);
  const [heightCm, setHeightCm] = useState(profile.heightCm);
  const [startWeightKg, setStartWeightKg] = useState(profile.startWeightKg);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setAge(profile.age);
      setHeightCm(profile.heightCm);
      setStartWeightKg(profile.startWeightKg);
      setError(null);
    }
  }, [open, profile.age, profile.heightCm, profile.startWeightKg]);

  const handleSave = async () => {
    if (age < 10 || age > 100) {
      setError('Возраст должен быть в диапазоне 10-100.');
      return;
    }
    if (heightCm < 120 || heightCm > 230) {
      setError('Рост должен быть в диапазоне 120-230 см.');
      return;
    }
    if (startWeightKg < 30 || startWeightKg > 300) {
      setError('Вес должен быть в диапазоне 30-300 кг.');
      return;
    }

    setError(null);
    await onSubmit({ age, heightCm, startWeightKg });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Настройки профиля</DialogTitle>
          <DialogDescription>Можно изменить параметры, указанные при регистрации.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="settings-age">Возраст</Label>
            <Input
              id="settings-age"
              type="number"
              min={10}
              max={100}
              value={age}
              onChange={(event) => setAge(Number(event.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="settings-height">Рост, см</Label>
            <Input
              id="settings-height"
              type="number"
              min={120}
              max={230}
              value={heightCm}
              onChange={(event) => setHeightCm(Number(event.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="settings-weight">Стартовый вес, кг</Label>
            <Input
              id="settings-weight"
              type="number"
              min={30}
              max={300}
              step="0.1"
              value={startWeightKg}
              onChange={(event) => setStartWeightKg(Number(event.target.value))}
            />
          </div>
        </div>

        {error ? <p className="text-sm text-rose-500">{error}</p> : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Сохраняем...' : 'Сохранить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
