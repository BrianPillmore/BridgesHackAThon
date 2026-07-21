import { getApp, getApps, initializeApp, type App } from "firebase-admin/app";

/**
 * On Firebase App Hosting, Application Default Credentials and FIREBASE_CONFIG
 * are supplied by the runtime. For local access, use the Firebase emulators or
 * GOOGLE_APPLICATION_CREDENTIALS; never commit a service-account key.
 */
export function getFirebaseAdminApp(): App {
  return getApps().length > 0 ? getApp() : initializeApp();
}
