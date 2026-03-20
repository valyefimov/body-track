import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'AIzaSyCrsCfOjXpnKnZssiKvS4jgGy74hch0GGs',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'body-track-a303b.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'body-track-a303b',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'body-track-a303b.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '737015437369',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '1:737015437369:web:97420fd87f5d2b801815e8',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? 'G-7NCTT9BXL7',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({ prompt: 'select_account' });

export let analytics: Analytics | null = null;

void isSupported()
  .then((supported) => {
    if (supported && typeof window !== 'undefined') {
      analytics = getAnalytics(app);
    }
  })
  .catch(() => {
    analytics = null;
  });
