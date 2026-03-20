import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, Menu, Plus, Target } from 'lucide-react';
import { useState } from 'react';

interface AppShellProps {
  userName: string;
  userEmail: string;
  userPhoto?: string;
  onAddMeasurement: () => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const getInitials = (name: string): string => {
  const parts = name
    .split(' ')
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  return (
    parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'BT'
  );
};

export function AppShell({
  userName,
  userEmail,
  userPhoto,
  onAddMeasurement,
  onLogout,
  children,
}: AppShellProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-3 py-3 md:px-6 md:py-6">
        <header className="mb-4 rounded-3xl border bg-card/90 p-3 shadow-sm backdrop-blur md:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar size="lg">
                {userPhoto ? <AvatarImage src={userPhoto} alt={userName} /> : null}
                <AvatarFallback>{getInitials(userName)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-medium">{userName}</p>
                <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
              </div>
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <ThemeToggle />
              <Button onClick={onAddMeasurement}>
                <Plus className="size-4" />
                Добавить замер
              </Button>
              <Button variant="outline" onClick={onLogout}>
                <LogOut className="size-4" />
                Выйти
              </Button>
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <Button size="icon" onClick={onAddMeasurement} aria-label="Добавить замер">
                <Plus className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsMenuOpen(true)}
                aria-label="Открыть меню"
              >
                <Menu className="size-4" />
              </Button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 md:mt-5">
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
              <Target className="size-3.5" />
              Фокус на прогресс
            </Badge>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.main
            key="dashboard-content"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-4 md:space-y-6"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>

      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent side="right" className="w-[84vw] max-w-xs border-l bg-card p-0">
          <SheetHeader className="border-b px-5 py-5">
            <SheetTitle>Меню</SheetTitle>
            <SheetDescription>Управляй темой и аккаунтом.</SheetDescription>
          </SheetHeader>
          <div className="space-y-3 p-4">
            <ThemeToggle className="w-full justify-start" />
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                setIsMenuOpen(false);
                onLogout();
              }}
            >
              <LogOut className="size-4" />
              Выйти
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
