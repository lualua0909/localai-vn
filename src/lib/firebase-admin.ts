import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getMessaging, Messaging } from "firebase-admin/messaging";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth as _getAuth, Auth } from "firebase-admin/auth";

let _adminApp: App | undefined;

function getAdminApp(): App {
  if (!_adminApp) {
    if (getApps().length === 0) {
      const serviceAccount = JSON.parse(
        process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT || "{}",
      );
      _adminApp = initializeApp({
        credential: cert(serviceAccount),
      });
    } else {
      _adminApp = getApps()[0];
    }
  }
  return _adminApp;
}

export function getAdminMessaging(): Messaging {
  return getMessaging(getAdminApp());
}

export function getAdminFirestore(): Firestore {
  return getFirestore(getAdminApp());
}

export function getAdminAuth(): Auth {
  return _getAuth(getAdminApp());
}
