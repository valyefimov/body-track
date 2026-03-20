import { BarChart3, Trash2, UserRound } from 'lucide-react';

const items = [
  { icon: UserRound, label: 'Гость' },
  { icon: BarChart3, label: 'История' },
  { icon: Trash2, label: 'Удалить' },
];

export function MobileBottomNav() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-xl grid-cols-3 gap-2 px-4 py-2">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              type="button"
              className="flex flex-col items-center justify-center gap-1 rounded-2xl py-1.5 text-muted-foreground"
            >
              <span className="rounded-full border p-2">
                <Icon className="size-4" />
              </span>
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
