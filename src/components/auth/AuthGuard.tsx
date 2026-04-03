"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { ProgressCircle } from "@/components/loading";
import Link from "next/link";

interface AuthGuardProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function AuthGuard({ children, requireAdmin }: AuthGuardProps) {
  const { user, userProfile, loading, resendVerification } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <ProgressCircle size={24} strokeWidth={2} />
      </div>
    );
  }

  if (!user) {
    router.replace("/signin");
    return null;
  }

  // Email/password users must verify email
  if (
    user.providerData[0]?.providerId === "password" &&
    !user.emailVerified
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-sm text-center space-y-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
            <svg className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold">Xác nhận email</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Vui lòng kiểm tra email <strong>{user.email}</strong> và nhấn vào link xác nhận để kích hoạt tài khoản.
          </p>
          <button
            onClick={resendVerification}
            className="text-sm text-accent hover:underline"
          >
            Gửi lại email xác nhận
          </button>
          <div>
            <Link href="/signin" className="text-sm text-[var(--color-text-secondary)] hover:underline">
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Wait for profile to load
  if (!userProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <ProgressCircle size={24} strokeWidth={2} />
      </div>
    );
  }

  // Check active status
  if (!userProfile.isActive) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-sm text-center space-y-4">
          <h2 className="text-lg font-semibold">Tài khoản chưa kích hoạt</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Tài khoản của bạn chưa được kích hoạt. Vui lòng liên hệ quản trị viên.
          </p>
          <Link href="/" className="text-sm text-accent hover:underline">
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  // Admin check
  if (requireAdmin && userProfile.role > 1) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-sm text-center space-y-4">
          <h2 className="text-lg font-semibold">Không có quyền truy cập</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Bạn không có quyền truy cập trang này.
          </p>
          <Link href="/dashboard/user" className="text-sm text-accent hover:underline">
            Về dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
