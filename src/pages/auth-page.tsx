import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { clearAuthMessages, signInWithGoogle } from '@/features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { motion } from 'framer-motion';
import { Dumbbell, Flame, ShieldCheck } from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const perks = [
  {
    icon: Flame,
    title: 'Авторасчеты',
    text: 'Считаем ИМТ, идеальный вес, BMR и динамику жира автоматически.',
  },
  {
    icon: Dumbbell,
    title: 'История прогресса',
    text: 'Графики и сравнения между замерами показывают реальную динамику.',
  },
  {
    icon: ShieldCheck,
    title: 'Надежно',
    text: 'Вход через Google и хранение данных в Firebase.',
  },
];

export function AuthPage() {
  const dispatch = useAppDispatch();
  const { actionStatus, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    return () => {
      dispatch(clearAuthMessages());
    };
  }, [dispatch]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
      <motion.div
        className="absolute -left-16 -top-10 size-72 rounded-full bg-orange-500/30 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -right-20 bottom-0 size-80 rounded-full bg-teal-400/25 blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, 18, 0] }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
          delay: 0.8,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative z-10 grid w-full max-w-5xl gap-5 lg:grid-cols-[1.1fr_1fr]"
      >
        <Card className="border-0 bg-gradient-to-br from-orange-600 via-amber-500 to-teal-500 text-white shadow-2xl">
          <CardHeader className="space-y-3">
            <CardTitle className="text-3xl font-semibold leading-tight">Body Track</CardTitle>
            <CardDescription className="max-w-md text-white/85">
              Веб-приложение для замеров тела, прогресса и персональных рекомендаций по похудению.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {perks.map((perk) => {
              const Icon = perk.icon;

              return (
                <div key={perk.title} className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <Icon className="size-4" />
                    {perk.title}
                  </p>
                  <p className="mt-1 text-sm text-white/85">{perk.text}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border bg-card/95 shadow-xl backdrop-blur">
          <CardHeader>
            <CardTitle>Вход и регистрация</CardTitle>
            <CardDescription>Сейчас доступна авторизация через Google Account.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="gap-4">
              <TabsList className="w-full">
                <TabsTrigger value="login">Вход</TabsTrigger>
                <TabsTrigger value="register">Регистрация</TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Авторизуйся, чтобы продолжить трекать прогресс.
                </p>
                <Button
                  className="w-full"
                  onClick={() => {
                    void dispatch(signInWithGoogle());
                  }}
                  disabled={actionStatus === 'loading'}
                >
                  {actionStatus === 'loading' ? 'Выполняем вход...' : 'Войти через Google'}
                </Button>
              </TabsContent>
              <TabsContent value="register" className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  После первого входа мы сразу попросим возраст, рост и вес для первичных расчетов.
                </p>
                <Button
                  className="w-full"
                  onClick={() => {
                    void dispatch(signInWithGoogle());
                  }}
                  disabled={actionStatus === 'loading'}
                >
                  {actionStatus === 'loading' ? 'Подключаем...' : 'Создать аккаунт через Google'}
                </Button>
              </TabsContent>
            </Tabs>

            <div className="mt-4 flex items-center justify-between">
              <Link
                to="/forgot-password"
                className="text-sm text-primary underline-offset-4 hover:underline"
              >
                Forgot password?
              </Link>
              <span className="text-xs text-muted-foreground">PWA + Firebase + Redux Toolkit</span>
            </div>

            {error ? <p className="mt-3 text-sm text-rose-500">{error}</p> : null}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
