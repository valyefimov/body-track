import { db } from '@/lib/firebase';
import type { BodyMeasurement, MeasurementInput, UserProfile } from '@/types';
import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore';

interface ProfileInput {
  age: number;
  heightCm: number;
  startWeightKg: number;
}

interface BodyState {
  profile: UserProfile | null;
  measurements: BodyMeasurement[];
  status: 'idle' | 'loading' | 'ready' | 'error';
  saveStatus: 'idle' | 'loading';
  error: string | null;
}

const initialState: BodyState = {
  profile: null,
  measurements: [],
  status: 'idle',
  saveStatus: 'idle',
  error: null,
};

const getUserProfileRef = (uid: string) => {
  return doc(db, 'users', uid, 'meta', 'profile');
};

const getMeasurementsCollection = (uid: string) => {
  return collection(db, 'users', uid, 'measurements');
};

const toMeasurement = (id: string, data: Record<string, unknown>): BodyMeasurement => {
  const weightKg = Number(data.weightKg ?? 0);
  const bodyFatPercent = Number(data.bodyFatPercent ?? 0);

  return {
    id,
    date: String(data.date ?? new Date().toISOString().slice(0, 10)),
    weightKg,
    bmi: Number(data.bmi ?? 0),
    fatMassKg: Number(data.fatMassKg ?? weightKg * (bodyFatPercent / 100)),
    steps: Number(data.steps ?? 0),
    boneMassKg: Number(data.boneMassKg ?? 0),
    bodyFatPercent,
    muscleMassKg: Number(data.muscleMassKg ?? 0),
    waterPercent: Number(data.waterPercent ?? 0),
    proteinPercent: Number(data.proteinPercent ?? 0),
    visceralFatLevel: Number(data.visceralFatLevel ?? 0),
    note: data.note ? String(data.note) : '',
    createdAt: Number(data.createdAt ?? Date.now()),
  };
};

const toProfile = (data: Record<string, unknown>): UserProfile => {
  return {
    age: Number(data.age ?? 0),
    heightCm: Number(data.heightCm ?? 0),
    startWeightKg: Number(data.startWeightKg ?? 0),
    createdAt: Number(data.createdAt ?? Date.now()),
    updatedAt: Number(data.updatedAt ?? Date.now()),
  };
};

export const fetchBodyData = createAsyncThunk<
  {
    profile: UserProfile | null;
    measurements: BodyMeasurement[];
  },
  string,
  { rejectValue: string }
>('body/fetchBodyData', async (uid, { rejectWithValue }) => {
  try {
    const profileSnapshot = await getDoc(getUserProfileRef(uid));
    const profileData = profileSnapshot.exists()
      ? toProfile(profileSnapshot.data() as Record<string, unknown>)
      : null;

    const measurementQuery = query(getMeasurementsCollection(uid), orderBy('date', 'asc'));
    const measurementSnapshot = await getDocs(measurementQuery);
    const measurements = measurementSnapshot.docs.map((entry) => {
      return toMeasurement(entry.id, entry.data() as Record<string, unknown>);
    });

    return { profile: profileData, measurements };
  } catch {
    return rejectWithValue('Не удалось загрузить данные из Firebase.');
  }
});

export const saveProfile = createAsyncThunk<
  UserProfile,
  { uid: string; profile: ProfileInput },
  { rejectValue: string }
>('body/saveProfile', async ({ uid, profile }, { rejectWithValue }) => {
  try {
    const profileRef = getUserProfileRef(uid);
    const existing = await getDoc(profileRef);
    const now = Date.now();

    const payload: UserProfile = {
      ...profile,
      createdAt: existing.exists()
        ? Number((existing.data() as Record<string, unknown>).createdAt ?? now)
        : now,
      updatedAt: now,
    };

    await setDoc(profileRef, payload, { merge: true });
    return payload;
  } catch {
    return rejectWithValue('Не удалось сохранить анкету.');
  }
});

export const createMeasurement = createAsyncThunk<
  BodyMeasurement,
  { uid: string; measurement: MeasurementInput },
  { rejectValue: string }
>('body/createMeasurement', async ({ uid, measurement }, { rejectWithValue }) => {
  try {
    const payload = {
      ...measurement,
      note: measurement.note ?? '',
      createdAt: Date.now(),
    };

    const ref = await addDoc(getMeasurementsCollection(uid), payload);
    return {
      ...payload,
      id: ref.id,
    };
  } catch {
    return rejectWithValue('Не удалось сохранить запись замера.');
  }
});

const bodySlice = createSlice({
  name: 'body',
  initialState,
  reducers: {
    clearBodyError: (state) => {
      state.error = null;
    },
    resetBodyState: () => initialState,
    setLocalMeasurements: (state, action: PayloadAction<BodyMeasurement[]>) => {
      state.measurements = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBodyData.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchBodyData.fulfilled, (state, action) => {
        state.status = 'ready';
        state.profile = action.payload.profile;
        state.measurements = action.payload.measurements;
      })
      .addCase(fetchBodyData.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload ?? 'Ошибка загрузки данных.';
      })
      .addCase(saveProfile.pending, (state) => {
        state.saveStatus = 'loading';
        state.error = null;
      })
      .addCase(saveProfile.fulfilled, (state, action) => {
        state.saveStatus = 'idle';
        state.profile = action.payload;
      })
      .addCase(saveProfile.rejected, (state, action) => {
        state.saveStatus = 'idle';
        state.error = action.payload ?? 'Ошибка сохранения анкеты.';
      })
      .addCase(createMeasurement.pending, (state) => {
        state.saveStatus = 'loading';
        state.error = null;
      })
      .addCase(createMeasurement.fulfilled, (state, action) => {
        state.saveStatus = 'idle';
        state.measurements = [...state.measurements, action.payload].sort((a, b) => {
          return a.date.localeCompare(b.date);
        });
      })
      .addCase(createMeasurement.rejected, (state, action) => {
        state.saveStatus = 'idle';
        state.error = action.payload ?? 'Ошибка сохранения замера.';
      });
  },
});

export const { clearBodyError, resetBodyState, setLocalMeasurements } = bodySlice.actions;
export default bodySlice.reducer;
