"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { useTranslations } from "@/lib/i18n";

export default function SignInPage() {
  const router = useRouter();
  const {
    user,
    loading,
    signInWithGoogle,
    signInWithGithub,
    signInWithEmail,
    signUpWithEmail,
  } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const copy = useTranslations("signin");

  // Redirect if already signed in
  if (!loading && user) {
    router.replace("/dashboard");
    return null;
  }

  const handleEmailAuth = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : copy.errorDefault;
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError("");
    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : copy.errorDefault;
      setError(message);
    }
  };

  const handleGithubAuth = async () => {
    setError("");
    try {
      await signInWithGithub();
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : copy.errorDefault;
      setError(message);
    }
  };

  return (
    <>
      <Header />
      <div className="relative flex items-center justify-center px-5 py-20">
        <BackgroundRippleEffect />
        <div className="relative z-10 w-full max-w-sm">
          {/* Back link */}
          <Link
            href="/"
            className="mb-8 inline-block text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text)]"
          >
            {copy.back}
          </Link>

          {/* Header */}
          <h1 className="text-2xl font-bold tracking-tight">
            {isSignUp ? copy.titles.signup : copy.titles.signin}
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            {isSignUp ? copy.subtitles.signup : copy.subtitles.signin}
          </p>

          {/* Google */}
          <button
            onClick={handleGoogleAuth}
            className="focus-ring mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm font-medium transition-all hover:border-black/20 hover:bg-black/5 hover:shadow-sm active:scale-[0.98] dark:hover:border-white/20 dark:hover:bg-white/5"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {copy.google}
          </button>
          <button
            onClick={handleGithubAuth}
            className="focus-ring mt-3 flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm font-medium transition-all hover:border-black/20 hover:bg-black/5 hover:shadow-sm active:scale-[0.98] dark:hover:border-white/20 dark:hover:bg-white/5"
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.64 0 8.13c0 3.59 2.29 6.64 5.47 7.72.4.08.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.44-2.53-.5-2.69-.96-.09-.23-.48-.96-.82-1.15-.28-.15-.68-.52-.01-.53.63-.01 1.08.59 1.23.84.72 1.21 1.87.87 2.33.66.07-.54.28-.87.51-1.07-1.78-.2-3.64-.9-3.64-3.98 0-.88.31-1.6.82-2.16-.08-.2-.36-1.02.08-2.12 0 0 .67-.22 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.05 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.16 0 3.09-1.87 3.78-3.65 3.98.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.15.46.55.38A8.044 8.044 0 0 0 16 8.13C16 3.64 12.42 0 8 0Z" />
            </svg>
            {copy.github}
          </button>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--color-border)]" />
            <span className="text-[13px] text-[var(--color-text-secondary)]">
              {copy.divider}
            </span>
            <div className="h-px flex-1 bg-[var(--color-border)]" />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-[13px] font-medium text-[var(--color-text-secondary)]"
              >
                {copy.form.emailLabel}
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="focus-ring w-full rounded-xl border border-[var(--color-border)] bg-transparent px-4 py-3 text-sm outline-none transition-all hover:border-black/20 hover:bg-black/[0.03] dark:hover:border-white/20 dark:hover:bg-white/[0.03] placeholder:text-[var(--color-text-secondary)]/50"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-[13px] font-medium text-[var(--color-text-secondary)]"
              >
                {copy.form.passwordLabel}
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={copy.form.passwordPlaceholder}
                className="focus-ring w-full rounded-xl border border-[var(--color-border)] bg-transparent px-4 py-3 text-sm outline-none transition-all hover:border-black/20 hover:bg-black/[0.03] dark:hover:border-white/20 dark:hover:bg-white/[0.03] placeholder:text-[var(--color-text-secondary)]/50"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-[13px] text-red-500">
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full active:scale-[0.98]"
              disabled={submitting}
            >
              {submitting
                ? copy.form.submit.loading
                : isSignUp
                  ? copy.form.submit.signup
                  : copy.form.submit.signin}
            </Button>
          </form>

          {/* Toggle */}
          <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
            {isSignUp
              ? copy.toggle.signinQuestion
              : copy.toggle.signupQuestion}{" "}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
              }}
              className="font-medium text-accent hover:underline"
            >
              {isSignUp ? copy.toggle.signinAction : copy.toggle.signupAction}
            </button>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
