import { auth, googleProvider } from '@/lib/firebase';
import type { AuthUser } from '@/types';
import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from 'firebase/auth';
import { sendPasswordResetEmail, signInWithPopup, signOut } from 'firebase/auth';

interface AuthState {
  user: AuthUser | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  actionStatus: 'idle' | 'loading';
  error: string | null;
  message: string | null;
}

const initialState: AuthState = {
  user: null,
  status: 'loading',
  actionStatus: 'idle',
  error: null,
  message: null,
};

const mapUser = (user: User): AuthUser => {
  return {
    uid: user.uid,
    displayName: user.displayName ?? 'Гость',
    email: user.email ?? '',
    photoURL: user.photoURL ?? '',
  };
};

const firebaseErrorToText = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = String(error.code);
    if (code.includes('popup-blocked')) {
      return 'Браузер заблокировал popup. Разреши всплывающие окна и попробуй снова.';
    }
    if (code.includes('network-request-failed')) {
      return 'Проблема с сетью. Проверь интернет и повтори попытку.';
    }
  }

  return 'Что-то пошло не так. Попробуй еще раз.';
};

export const signInWithGoogle = createAsyncThunk<AuthUser, void, { rejectValue: string }>(
  'auth/signInWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return mapUser(result.user);
    } catch (error) {
      return rejectWithValue(firebaseErrorToText(error));
    }
  },
);

export const logout = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await signOut(auth);
    } catch (error) {
      return rejectWithValue(firebaseErrorToText(error));
    }
  },
);

export const requestPasswordReset = createAsyncThunk<string, string, { rejectValue: string }>(
  'auth/requestPasswordReset',
  async (email, { rejectWithValue }) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return 'Письмо для сброса пароля отправлено. Проверь почту.';
    } catch (error) {
      return rejectWithValue(firebaseErrorToText(error));
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload;
      state.status = action.payload ? 'authenticated' : 'unauthenticated';
      state.error = null;
      state.message = null;
    },
    setAuthLoading: (state) => {
      state.status = 'loading';
    },
    clearAuthMessages: (state) => {
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signInWithGoogle.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
        state.message = null;
      })
      .addCase(signInWithGoogle.fulfilled, (state, action) => {
        state.actionStatus = 'idle';
        state.user = action.payload;
        state.status = 'authenticated';
      })
      .addCase(signInWithGoogle.rejected, (state, action) => {
        state.actionStatus = 'idle';
        state.error = action.payload ?? 'Не удалось выполнить вход.';
      })
      .addCase(logout.pending, (state) => {
        state.actionStatus = 'loading';
      })
      .addCase(logout.fulfilled, (state) => {
        state.actionStatus = 'idle';
        state.user = null;
        state.status = 'unauthenticated';
      })
      .addCase(logout.rejected, (state, action) => {
        state.actionStatus = 'idle';
        state.error = action.payload ?? 'Не удалось выйти из аккаунта.';
      })
      .addCase(requestPasswordReset.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
        state.message = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state, action) => {
        state.actionStatus = 'idle';
        state.message = action.payload;
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.actionStatus = 'idle';
        state.error = action.payload ?? 'Не удалось отправить письмо для сброса пароля.';
      });
  },
});

export const { clearAuthMessages, setAuthLoading, setAuthUser } = authSlice.actions;
export { mapUser };
export default authSlice.reducer;
