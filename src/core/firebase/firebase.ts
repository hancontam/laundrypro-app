// src/services/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
// @ts-ignore — getReactNativePersistence exists at runtime in firebase v12
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDE_MFaM6oJS_fFfdQAsgjR2FIEoQwrJOg',
  authDomain: 'laundrypro-1c96e.firebaseapp.com',
  projectId: 'laundrypro-1c96e',
  storageBucket: 'laundrypro-1c96e.firebasestorage.app',
  messagingSenderId: '352973411655',
  appId: '1:352973411655:web:9df8eda7c26fdd64dd2862',
};

// Prevent re-initialization on hot reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth: ReturnType<typeof getAuth>;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  // Already initialized (hot reload) — just get existing instance
  auth = getAuth(app);
}

export { auth };
export default firebaseConfig;
