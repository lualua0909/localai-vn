"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Send, Bell } from "lucide-react";
import { getFirebaseAuth } from "@/lib/firebase";
import { useFCM } from "@/hooks/useFCM";
import { getAllUsers, UserProfile } from "@/lib/firestore";

interface FCMManagerProps {
  uid: string;
}

export function FCMManager({ uid }: FCMManagerProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState<"all" | "specific">("all");
  const [targetUid, setTargetUid] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);

  const { token, permission, requestPermission } = useFCM(uid);

  useEffect(() => {
    getAllUsers().then(setUsers);
  }, []);

  const handleSend = async () => {
    if (!title || !body) return;
    setSending(true);
    setResult(null);
    try {
      const idToken = await getFirebaseAuth().currentUser?.getIdToken();
      if (!idToken) {
        setResult("Error: Not authenticated");
        return;
      }

      const res = await fetch("/api/fcm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ title, body, target, targetUid }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(`Sent successfully! (${data.successCount || 0}/${data.total || 0} delivered)`);
        setTitle("");
        setBody("");
      } else {
        setResult(`Error: ${data.error || "Unknown error"}`);
      }
    } catch {
      setResult("Failed to send notification.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="typo-h2">Push Notifications</h2>

      {/* FCM Status */}
      <div className="glass-card rounded-2xl p-6 max-w-xl space-y-4">
        <h3 className="typo-body font-semibold flex items-center gap-2">
          <Bell size={16} /> Your Notification Status
        </h3>
        <div className="flex items-center gap-4">
          <span className="typo-caption text-[var(--color-text-secondary)]">
            Permission: <strong className={permission === "granted" ? "text-green-500" : "text-amber-500"}>{permission}</strong>
          </span>
          {token && (
            <span className="typo-caption text-green-500">Token registered</span>
          )}
        </div>
        {permission !== "granted" && (
          <Button variant="outline" size="sm" onClick={requestPermission} className="gap-2">
            <Bell size={14} />
            Enable Notifications
          </Button>
        )}
      </div>

      {/* Send Form */}
      <div className="glass-card rounded-2xl p-6 space-y-5 max-w-xl">
        <h3 className="typo-body font-semibold">Send Notification</h3>

        <div>
          <label className="block typo-caption font-semibold mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3 typo-body outline-none"
            placeholder="Notification title"
          />
        </div>

        <div>
          <label className="block typo-caption font-semibold mb-2">Body</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full h-24 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3 typo-body outline-none resize-none"
            placeholder="Notification body"
          />
        </div>

        <div>
          <label className="block typo-caption font-semibold mb-2">
            Target
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 typo-body cursor-pointer">
              <input
                type="radio"
                value="all"
                checked={target === "all"}
                onChange={() => setTarget("all")}
                className="accent-accent"
              />
              All users
            </label>
            <label className="flex items-center gap-2 typo-body cursor-pointer">
              <input
                type="radio"
                value="specific"
                checked={target === "specific"}
                onChange={() => setTarget("specific")}
                className="accent-accent"
              />
              Specific user
            </label>
          </div>
        </div>

        {target === "specific" && (
          <div>
            <label className="block typo-caption font-semibold mb-2">
              Select User
            </label>
            <select
              value={targetUid}
              onChange={(e) => setTargetUid(e.target.value)}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3 typo-body outline-none"
            >
              <option value="">Choose a user...</option>
              {users
                .filter((u) => u.fcmTokens && u.fcmTokens.length > 0)
                .map((u) => (
                  <option key={u.uid} value={u.uid}>
                    {u.email}
                  </option>
                ))}
            </select>
          </div>
        )}

        <Button
          variant="primary"
          onClick={handleSend}
          disabled={sending || !title || !body || (target === "specific" && !targetUid)}
          className="gap-2"
        >
          <Send size={16} />
          {sending ? "Sending..." : "Send Notification"}
        </Button>

        {result && (
          <p
            className={`typo-caption p-3 rounded-lg ${
              result.startsWith("Error") || result.startsWith("Failed")
                ? "bg-red-500/10 text-red-500"
                : "bg-green-500/10 text-green-600"
            }`}
          >
            {result}
          </p>
        )}
      </div>

      {!process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl typo-caption text-amber-700 max-w-xl">
          FCM requires a VAPID key. Configure{" "}
          <code className="font-mono">NEXT_PUBLIC_FIREBASE_VAPID_KEY</code> in
          your .env file. Generate it from Firebase Console &gt; Cloud Messaging &gt;
          Web Push certificates.
        </div>
      )}
    </div>
  );
}
