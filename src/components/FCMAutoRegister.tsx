"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
import { useFCM } from "@/hooks/useFCM";

// Silently registers FCM token for any logged-in user who has already
// granted notification permission. Renders nothing.
export function FCMAutoRegister() {
  const { user } = useAuth();
  const { requestPermission, permission } = useFCM(user?.uid);

  // If user is signed in and notification permission is "default" (not yet asked),
  // we don't force the dialog — let the user opt-in manually.
  // If they previously granted permission, useFCM auto-registers on mount.
  // This effect handles the edge case where permission was granted but
  // the user hasn't visited the dashboard.
  useEffect(() => {
    if (!user || permission !== "granted") return;
    // useFCM already handles auto-register internally — nothing extra needed here
  }, [user, permission, requestPermission]);

  return null;
}
