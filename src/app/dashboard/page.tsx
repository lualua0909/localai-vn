"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { FeedbackForm } from "@/components/feedback/FeedbackForm";
import { useAuth } from "@/lib/useAuth";
import { Button } from "@/components/ui/Button";
import { LogOut } from "lucide-react";
import { useTranslations } from "@/lib/i18n";

import { useState } from "react";
import { ProductManager } from "@/components/dashboard/ProductManager";
import { LayoutDashboard, Package } from "lucide-react";
import { AppName } from "@/components/ui/appName";

function DashboardContent() {
  const { user, signOut } = useAuth();
  const appCopy = useTranslations("app");
  const [activeTab, setActiveTab] = useState<"overview" | "products">(
    "products"
  );

  // Demo Role Switcher
  const [demoRole, setDemoRole] = useState<number>(1);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pb-24">
      {/* Top bar */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="container-main flex h-14 items-center justify-between">
          <div className="flex items-center gap-8">
            <AppName />

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg typo-caption font-semibold transition-all ${
                  activeTab === "overview"
                    ? "bg-[var(--color-bg-alt)] text-[var(--color-text)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                }`}
              >
                <LayoutDashboard size={14} />
                Overview
              </button>
              <button
                onClick={() => setActiveTab("products")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg typo-caption font-semibold transition-all ${
                  activeTab === "products"
                    ? "bg-[var(--color-bg-alt)] text-[var(--color-text)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                }`}
              >
                <Package size={14} />
                Products
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Demo Role Switcher */}
            <select
              value={demoRole}
              onChange={(e) => setDemoRole(Number(e.target.value))}
              className="typo-caption bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-lg px-2.5 py-1.5"
            >
              <option value={1}>View as User</option>
              <option value={0}>View as Admin</option>
            </select>

            <div className="flex items-center gap-3 pl-4 border-l border-[var(--color-border)]">
              <img
                src={user?.photoURL || "https://placehold.co/60x60/eee/white"}
                alt="User"
                className="h-8 w-8 rounded-full object-cover"
              />
              <button
                onClick={signOut}
                className="text-[var(--color-text-secondary)] hover:text-red-500 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container-main py-10">
        {activeTab === "overview" && (
          <div className="mx-auto max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Profile card */}
            <div className="glass-card mb-8 rounded-2xl p-8 md:p-10">
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                <img
                  src={
                    user?.photoURL || "https://placehold.co/100x100/eee/white"
                  }
                  alt="User avatar"
                  className="h-20 w-20 md:h-24 md:w-24 rounded-full object-cover"
                />
                <div className="text-center md:text-left">
                  <h1 className="typo-h1">
                    {user?.displayName || appCopy.profile.fallbackName}
                  </h1>
                  <p className="typo-body text-[var(--color-text-secondary)] mt-1">
                    {user?.email}
                  </p>
                  <p className="typo-caption text-[var(--color-text-secondary)] mt-2 uppercase tracking-wider">
                    Role: {demoRole === 0 ? "Admin" : "User"}
                  </p>
                </div>
                <div className="md:ml-auto">
                  <Button href="#" variant="outline" size="sm">
                    Edit Profile
                  </Button>
                </div>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-6 border-t border-[var(--color-border)] pt-10">
                {appCopy.profile.stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="typo-h1">{stat.value}</p>
                    <p className="typo-caption text-[var(--color-text-secondary)] uppercase tracking-wider mt-2">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Feedback */}
            <div className="glass-card rounded-2xl p-8 md:p-10">
              <h2 className="typo-h2 mb-4">
                {appCopy.feedback.title}
              </h2>
              <FeedbackForm uid={user?.uid} />
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div className="mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ProductManagerWrapper
              demoRole={demoRole}
              userEmail={user?.email}
            />
          </div>
        )}
      </main>
    </div>
  );
}

function ProductManagerWrapper({
  demoRole,
  userEmail
}: {
  demoRole: number;
  userEmail?: string | null;
}) {
  return <ProductManager userEmail={userEmail} roleOverride={demoRole} />;
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
