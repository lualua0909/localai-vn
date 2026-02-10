"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { FeedbackForm } from "@/components/feedback/FeedbackForm";
import { useAuth } from "@/lib/useAuth";
import { Button } from "@/components/ui/Button";
import { LogOut, User } from "lucide-react";
import { useTranslations } from "@/lib/i18n";

function AppContent() {
  const { user, signOut } = useAuth();
  const appCopy = useTranslations("app");

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Top bar */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-xl">
        <div className="container-main flex h-14 items-center justify-between">
          <span className="text-lg font-semibold tracking-tight">
            {appCopy.topbar.appName}
          </span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[var(--color-text-secondary)]">
              {user?.displayName || user?.email}
            </span>
            <button
              onClick={signOut}
              className="focus-ring flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-text)]/5 hover:text-[var(--color-text)]"
            >
              <LogOut size={14} />
              {appCopy.topbar.signOut}
            </button>
          </div>
        </div>
      </header>

      <main className="container-main py-12">
        <div className="mx-auto max-w-2xl">
          {/* Profile card */}
          <div className="glass-card mb-8 rounded-3xl p-8">
            <div className="flex items-center gap-4">
              <img
                src={
                  user?.photoURL ||
                  "https://placehold.co/60x60#eee/white"
                }
                alt="User avatar"
                className="h-14 w-14 rounded-full object-cover"
              />
              <div>
                <h1 className="text-xl font-bold">
                  {user?.displayName || appCopy.profile.fallbackName}
                </h1>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              {appCopy.profile.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-[var(--color-border)] p-4"
                >
                  <p className="text-[13px] text-[var(--color-text-secondary)]">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-lg font-semibold">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <Button href="#" variant="primary" size="sm">
                {appCopy.profile.upgrade}
              </Button>
            </div>
          </div>

          {/* Feedback */}
          <div className="glass-card rounded-3xl p-8">
            <h2 className="mb-1 text-lg font-semibold">
              {appCopy.feedback.title}
            </h2>
            <p className="mb-6 text-sm text-[var(--color-text-secondary)]">
              {appCopy.feedback.description}
            </p>
            <FeedbackForm uid={user?.uid} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AppPage() {
  return (
    <AuthGuard>
      <AppContent />
    </AuthGuard>
  );
}
