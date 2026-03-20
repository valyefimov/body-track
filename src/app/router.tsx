import { LoadingScreen } from '@/components/layout/loading-screen';
import { mapUser, setAuthLoading, setAuthUser } from '@/features/auth/authSlice';
import { fetchBodyData, resetBodyState } from '@/features/body/bodySlice';
import { auth } from '@/lib/firebase';
import { AuthPage } from '@/pages/auth-page';
import { DashboardPage } from '@/pages/dashboard-page';
import { ForgotPasswordPage } from '@/pages/forgot-password-page';
import { OnboardingPage } from '@/pages/onboarding-page';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

function GuestOnly({ children }: { children: React.ReactNode }) {
  const user = useAppSelector((state) => state.auth.user);
  const authStatus = useAppSelector((state) => state.auth.status);

  if (authStatus === 'loading') {
    return <LoadingScreen />;
  }

  if (user) {
    return <Navigate replace to="/dashboard" />;
  }

  return <>{children}</>;
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = useAppSelector((state) => state.auth.user);
  const authStatus = useAppSelector((state) => state.auth.status);

  if (authStatus === 'loading') {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate replace to="/auth" />;
  }

  return <>{children}</>;
}

function RequireCompletedProfile({ children }: { children: React.ReactNode }) {
  const body = useAppSelector((state) => state.body);

  if (body.status === 'loading' || body.status === 'idle') {
    return <LoadingScreen label="Синхронизируем твои данные..." />;
  }

  if (!body.profile) {
    return <Navigate replace to="/onboarding" />;
  }

  return <>{children}</>;
}

function RequireEmptyProfile({ children }: { children: React.ReactNode }) {
  const body = useAppSelector((state) => state.body);

  if (body.status === 'loading' || body.status === 'idle') {
    return <LoadingScreen label="Проверяем профиль..." />;
  }

  if (body.profile) {
    return <Navigate replace to="/dashboard" />;
  }

  return <>{children}</>;
}

function AuthBootstrap() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setAuthLoading());
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(setAuthUser(mapUser(user)));
        void dispatch(fetchBodyData(user.uid));
      } else {
        dispatch(setAuthUser(null));
        dispatch(resetBodyState());
      }
    });

    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  return (
    <Routes>
      <Route
        path="/auth"
        element={
          <GuestOnly>
            <AuthPage />
          </GuestOnly>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <GuestOnly>
            <ForgotPasswordPage />
          </GuestOnly>
        }
      />
      <Route
        path="/onboarding"
        element={
          <RequireAuth>
            <RequireEmptyProfile>
              <OnboardingPage />
            </RequireEmptyProfile>
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <RequireCompletedProfile>
              <DashboardPage />
            </RequireCompletedProfile>
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate replace to="/auth" />} />
    </Routes>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthBootstrap />
    </BrowserRouter>
  );
}
