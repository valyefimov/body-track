import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { BodyMeasurement } from '@/types';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

interface HistoryListProps {
  measurements: BodyMeasurement[];
}

export function HistoryList({ measurements }: HistoryListProps) {
  const lastItems = [...measurements].reverse().slice(0, 8);

  return (
    <Card className="border bg-card/90">
      <CardHeader>
        <CardTitle className="text-lg">История замеров</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {lastItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">Пока нет записей.</p>
        ) : (
          lastItems.map((entry, index) => {
            const fatMassKg = entry.weightKg * (entry.bodyFatPercent / 100);

            return (
              <div key={entry.id}>
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-muted/40 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">
                      {format(parseISO(entry.date), 'd MMMM yyyy', { locale: ru })}
                    </p>
                    <p className="text-xs text-muted-foreground">{entry.note || 'Без заметки'}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span>{entry.weightKg.toFixed(1)} кг</span>
                    <span className="text-muted-foreground">Шаги {entry.steps.toFixed(0)}</span>
                    <span className="text-muted-foreground">Жир {entry.bodyFatPercent.toFixed(1)}%</span>
                    <span className="text-muted-foreground">Жир масса {fatMassKg.toFixed(1)} кг</span>
                    <span className="text-muted-foreground">Кость {entry.boneMassKg.toFixed(1)} кг</span>
                    <span className="text-muted-foreground">Мышцы {entry.muscleMassKg.toFixed(1)} кг</span>
                  </div>
                </div>
              {index < lastItems.length - 1 ? <Separator className="my-2" /> : null}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
