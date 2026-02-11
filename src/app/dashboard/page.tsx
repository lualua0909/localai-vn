"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { FeedbackForm } from "@/components/feedback/FeedbackForm";
import { useAuth } from "@/lib/useAuth";
import { Button } from "@/components/ui/Button";
import { LogOut, User } from "lucide-react";
import { useTranslations } from "@/lib/i18n";

import { useState } from "react";
import { ProductManager } from "@/components/dashboard/ProductManager";
import { userRoles } from "@/hooks/useProducts";
import { LayoutDashboard, Package, Settings } from "lucide-react";
import { Header } from "@/components/layout/Header";
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
    <div className="min-h-screen bg-[var(--color-bg)] pb-20">
      {/* Top bar */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="container-main flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <AppName />

            {/* Navigation Tabs */}
            <div className="hidden md:flex items-center gap-1 bg-[var(--color-bg-alt)]/50 p-1 rounded-lg border border-[var(--color-border)]">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === "overview"
                    ? "bg-white dark:bg-[var(--color-bg)] shadow-sm text-[var(--color-text)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                }`}
              >
                <LayoutDashboard size={16} />
                Overview
              </button>
              <button
                onClick={() => setActiveTab("products")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === "products"
                    ? "bg-white dark:bg-[var(--color-bg)] shadow-sm text-[var(--color-text)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                }`}
              >
                <Package size={16} />
                Products
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Demo Role Switcher */}
            <select
              value={demoRole}
              onChange={(e) => setDemoRole(Number(e.target.value))}
              className="text-xs bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-md px-2 py-1"
            >
              <option value={1}>View as User</option>
              <option value={0}>View as Admin</option>
            </select>

            <div className="flex items-center gap-3 pl-4 border-l border-[var(--color-border)]">
              <img
                src={user?.photoURL || "https://placehold.co/60x60/eee/white"}
                alt="User"
                className="h-8 w-8 rounded-full object-cover border border-[var(--color-border)]"
              />
              <button
                onClick={signOut}
                className="text-[var(--color-text-secondary)] hover:text-red-500 transition-colors"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container-main py-8">
        {activeTab === "overview" && (
          <div className="mx-auto max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Profile card */}
            <div className="glass-card mb-6 rounded-2xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                <img
                  src={
                    user?.photoURL || "https://placehold.co/100x100/eee/white"
                  }
                  alt="User avatar"
                  className="h-20 w-20 md:h-24 md:w-24 rounded-full object-cover border-4 border-white dark:border-[var(--color-bg)] shadow-md"
                />
                <div className="text-center md:text-left">
                  <h1 className="text-2xl font-bold">
                    {user?.displayName || appCopy.profile.fallbackName}
                  </h1>
                  <p className="text-[var(--color-text-secondary)] font-medium">
                    {user?.email}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1 uppercase tracking-wider">
                    Role: {demoRole === 0 ? "Admin" : "User"}
                  </p>
                </div>
                <div className="md:ml-auto">
                  <Button href="#" variant="outline" size="sm">
                    Edit Profile
                  </Button>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-4 border-t border-[var(--color-border)] pt-8">
                {appCopy.profile.stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide mt-1">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Feedback */}
            <div className="glass-card rounded-2xl p-8">
              <h2 className="mb-2 text-lg font-semibold">
                {appCopy.feedback.title}
              </h2>
              <FeedbackForm uid={user?.uid} />
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div className="mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Inject role into ProductManager context via a wrapper or prop if possible, 
                for now we'll rely on the mocked logic which uses a hardcoded email map, 
                BUT I will update useProducts to accept an override role for this demo. 
            */}
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

// Wrapper to inject the demo role into the hook's context effectively
// We need to modify useProducts to accept role override or handle it here.
// Since useProducts is a hook, we can't easily override its internal logic from outside without prop.
// Let's modify ProductManager to accept `role` prop.
function ProductManagerWrapper({
  demoRole,
  userEmail
}: {
  demoRole: number;
  userEmail?: string | null;
}) {
  // We need to pass this down. I'll modify ProductManager.tsx next to accept 'roleOverride'
  // For now, I'll assume ProductManager can handle it.
  return <ProductManager userEmail={userEmail} roleOverride={demoRole} />;
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
