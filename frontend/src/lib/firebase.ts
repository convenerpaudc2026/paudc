import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Validate that all required fields are present
const requiredFields = ['apiKey', 'authDomain', 'projectId', 'appId'] as const;
const missingFields = requiredFields.filter(
  (field) => !firebaseConfig[field]
);

let app: any = null;
let auth: any = null;

if (missingFields.length > 0) {
  console.warn(
    'Firebase configuration is incomplete. Firebase is disabled. Missing fields:',
    missingFields
  );
} else {
  // Initialize Firebase only if all required fields are present
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
}

export { app, auth };

export default app;

