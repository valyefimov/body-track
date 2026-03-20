import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { requestPasswordReset } from '@/features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ArrowLeft, KeyRound } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export function ForgotPasswordPage() {
  const dispatch = useAppDispatch();
  const { actionStatus, error, message } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState('');

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-lg border bg-card/95 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="size-5 text-primary" />
            Восстановление доступа
          </CardTitle>
          <CardDescription>
            Для Google аккаунта используй официальное восстановление или отправь email reset.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full"
            render={
              <a
                href="https://accounts.google.com/signin/recovery"
                target="_blank"
                rel="noreferrer"
              />
            }
          >
            Восстановить пароль Google
          </Button>

          <div className="space-y-2">
            <Label htmlFor="email">Email (опционально)</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <Button
            className="w-full"
            disabled={actionStatus === 'loading' || email.trim().length === 0}
            onClick={() => {
              void dispatch(requestPasswordReset(email.trim()));
            }}
          >
            {actionStatus === 'loading' ? 'Отправляем...' : 'Отправить письмо для сброса'}
          </Button>

          {message ? <p className="text-sm text-emerald-500">{message}</p> : null}
          {error ? <p className="text-sm text-rose-500">{error}</p> : null}

          <Button variant="ghost" render={<Link to="/auth" />}>
            <ArrowLeft className="size-4" />
            Назад к входу
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
