"use client";

import { useState, useEffect, useCallback } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { getFirebaseMessaging } from "@/lib/firebase";
import { saveFcmToken } from "@/lib/firestore";

async function getAndSaveToken(uid: string): Promise<string | null> {
  if (!uid) return null;

  const messaging = await getFirebaseMessaging();
  if (!messaging) return null;

  const sw = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

  try {
    const fcmToken = await getToken(messaging, { vapidKey, serviceWorkerRegistration: sw });
    if (fcmToken) {
      await saveFcmToken(uid, fcmToken);
      return fcmToken;
    }
  } catch {
    // User may have revoked permission or browser doesn't support FCM
  }
  return null;
}

export function useFCM(uid: string | undefined) {
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );

  // Auto-register on mount if permission already granted
  useEffect(() => {
    if (!uid || permission !== "granted") return;

    getAndSaveToken(uid).then((t) => {
      if (t) setToken(t);
    });
  }, [uid]); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for foreground messages
  useEffect(() => {
    let unsub: (() => void) | undefined;

    getFirebaseMessaging().then((messaging) => {
      if (!messaging) return;
      unsub = onMessage(messaging, (payload) => {
        if (payload.notification) {
          new Notification(payload.notification.title || "Notification", {
            body: payload.notification.body || "",
          });
        }
      });
    });

    return () => unsub?.();
  }, []);

  const requestPermission = useCallback(async () => {
    if (!uid) return null;

    const perm = await Notification.requestPermission();
    setPermission(perm);
    if (perm !== "granted") return null;

    const t = await getAndSaveToken(uid);
    if (t) setToken(t);
    return t;
  }, [uid]);

  return { token, permission, requestPermission };
}
