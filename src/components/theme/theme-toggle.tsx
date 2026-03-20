import { Button } from '@/components/ui/button';
import { MoonStar, SunMedium } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      className={className}
      variant="outline"
      size="sm"
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? <SunMedium className="size-4" /> : <MoonStar className="size-4" />}
      {isDark ? 'Светлая тема' : 'Темная тема'}
    </Button>
  );
}
