"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { FeedbackForm } from "@/components/feedback/FeedbackForm";
import { useAuth } from "@/lib/useAuth";
import { Button } from "@/components/ui/Button";
import { LogOut, User } from "lucide-react";

function AppContent() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Top bar */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-xl">
        <div className="container-main flex h-14 items-center justify-between">
          <span className="text-lg font-semibold tracking-tight">
            Astra AI
          </span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[var(--color-text-secondary)]">
              {user?.displayName || user?.email}
            </span>
            <button
              onClick={signOut}
              className="focus-ring flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-text)]/5 hover:text-[var(--color-text)]"
            >
              <LogOut size={14} />
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="container-main py-12">
        <div className="mx-auto max-w-2xl">
          {/* Profile card */}
          <div className="glass-card mb-8 rounded-3xl p-8">
            <div className="flex items-center gap-4">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt=""
                  className="h-14 w-14 rounded-full"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                  <User size={24} className="text-accent" />
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold">
                  {user?.displayName || "Người dùng"}
                </h1>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              {[
                { label: "Gói hiện tại", value: "Starter" },
                { label: "Requests hôm nay", value: "0" },
                { label: "Models truy cập", value: "1" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-[var(--color-border)] p-4"
                >
                  <p className="text-[11px] text-[var(--color-text-secondary)]">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-lg font-semibold">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <Button href="#" variant="primary" size="sm">
                Nâng cấp gói
              </Button>
            </div>
          </div>

          {/* Feedback */}
          <div className="glass-card rounded-3xl p-8">
            <h2 className="mb-1 text-lg font-semibold">Gửi phản hồi</h2>
            <p className="mb-6 text-sm text-[var(--color-text-secondary)]">
              Giúp chúng tôi cải thiện Astra AI.
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
