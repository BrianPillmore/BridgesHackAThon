import {
  getApp,
  getApps,
  initializeApp,
  type FirebaseApp,
  type FirebaseOptions,
} from "firebase/app";

import { publicEnvironment } from "@/lib/env/public";

function explicitFirebaseConfig(): FirebaseOptions | undefined {
  const config = {
    apiKey: publicEnvironment.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: publicEnvironment.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: publicEnvironment.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: publicEnvironment.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: publicEnvironment.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: publicEnvironment.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  return Object.values(config).every(Boolean) ? (config as FirebaseOptions) : undefined;
}

/**
 * Lazily initializes Firebase. Firebase App Hosting can inject web config at
 * build time, while local development can use NEXT_PUBLIC_FIREBASE_* values.
 */
export function getFirebaseClientApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }

  const config = explicitFirebaseConfig();
  return config ? initializeApp(config) : initializeApp();
}
