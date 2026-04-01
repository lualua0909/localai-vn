"use client";

import { FeedbackForm } from "@/components/feedback/FeedbackForm";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "@/lib/i18n";
import { useAuth } from "@/lib/useAuth";

export function DashboardOverview() {
  const { user, userProfile } = useAuth();
  const appCopy = useTranslations("app");
  const roleLabel =
    userProfile?.role === 0
      ? "Root"
      : userProfile?.role === 1
        ? "Admin"
        : "User";

  return (
    <div className="mx-auto max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="glass-card mb-8 rounded-2xl p-8 md:p-10">
        <div className="flex flex-col items-center gap-6 md:flex-row md:gap-8">
          <img
            src={
              userProfile?.avatar ||
              user?.photoURL ||
              "https://placehold.co/100x100/eee/white"
            }
            alt="User avatar"
            className="h-20 w-20 rounded-full object-cover md:h-24 md:w-24"
          />
          <div className="text-center md:text-left">
            <h1 className="typo-h1">
              {user?.displayName ||
                userProfile?.email ||
                appCopy.profile.fallbackName}
            </h1>
            <p className="mt-1 typo-body text-[var(--color-text-secondary)]">
              {user?.email}
            </p>
            <p className="mt-2 typo-caption uppercase tracking-wider text-[var(--color-text-secondary)]">
              Role: {roleLabel}
            </p>
          </div>
          <div className="md:ml-auto">
            <Button href="#" variant="outline" size="sm">
              Edit Profile
            </Button>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-3 gap-6 border-t border-[var(--color-border)] pt-10">
          {appCopy.profile.stats.map((stat: { value: string; label: string }) => (
            <div key={stat.label} className="text-center">
              <p className="typo-h1">{stat.value}</p>
              <p className="mt-2 typo-caption uppercase tracking-wider text-[var(--color-text-secondary)]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-8 md:p-10">
        <h2 className="mb-4 typo-h2">{appCopy.feedback.title}</h2>
        <FeedbackForm uid={user?.uid} />
      </div>
    </div>
  );
}
