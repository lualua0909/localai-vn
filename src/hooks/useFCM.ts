"use client";

import { useState, useEffect, useCallback } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { getFirebaseMessaging } from "@/lib/firebase";
import { saveFcmToken } from "@/lib/firestore";

export function useFCM(uid: string | undefined) {
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );

  const requestPermission = useCallback(async () => {
    if (!uid) return null;

    const messaging = await getFirebaseMessaging();
    if (!messaging) return null;

    const perm = await Notification.requestPermission();
    setPermission(perm);
    if (perm !== "granted") return null;

    const sw = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    const fcmToken = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: sw,
    });

    if (fcmToken) {
      setToken(fcmToken);
      await saveFcmToken(uid, fcmToken);
    }

    return fcmToken;
  }, [uid]);

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

  return { token, permission, requestPermission };
}
