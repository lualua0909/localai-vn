"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { FeedbackForm } from "@/components/feedback/FeedbackForm";
import { useAuth } from "@/lib/useAuth";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "@/lib/i18n";

import { useState } from "react";
import { ProductManager } from "@/components/dashboard/ProductManager";
import { UserManager } from "@/components/dashboard/UserManager";
import { BlogManager } from "@/components/dashboard/BlogManager";
import { FCMManager } from "@/components/dashboard/FCMManager";
import {
  LayoutDashboard,
  Package,
  Users,
  FileText,
  Bell,
  LogOut,
  Tag,
  GraduationCap,
} from "lucide-react";
import { AppName } from "@/components/ui/appName";
import { CategoryManager } from "@/components/dashboard/CategoryManager";
import { CourseManager } from "@/components/dashboard/course/CourseManager";

type TabKey = "overview" | "products" | "courses" | "users" | "blogs" | "categories" | "notifications";

function DashboardContent() {
  const { user, userProfile, signOut } = useAuth();
  const appCopy = useTranslations("app");
  const [activeTab, setActiveTab] = useState<TabKey>("products");

  const isAdmin = userProfile ? userProfile.role <= 1 : false;
  const roleLabel =
    userProfile?.role === 0
      ? "Root"
      : userProfile?.role === 1
        ? "Admin"
        : "User";

  const tabs: {
    key: TabKey;
    label: string;
    icon: React.ReactNode;
    adminOnly?: boolean;
  }[] = [
    { key: "overview", label: "Overview", icon: <LayoutDashboard size={14} /> },
    { key: "products", label: "Products", icon: <Package size={14} /> },
    {
      key: "courses",
      label: "Courses",
      icon: <GraduationCap size={14} />,
      adminOnly: true,
    },
    {
      key: "users",
      label: "Users",
      icon: <Users size={14} />,
      adminOnly: true,
    },
    {
      key: "blogs",
      label: "Blogs",
      icon: <FileText size={14} />,
      adminOnly: true,
    },
    {
      key: "categories",
      label: "Categories",
      icon: <Tag size={14} />,
      adminOnly: true,
    },
    {
      key: "notifications",
      label: "FCM",
      icon: <Bell size={14} />,
      adminOnly: true,
    },
  ];

  const visibleTabs = tabs.filter((t) => !t.adminOnly || isAdmin);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pb-24">
      {/* Top bar */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="container-main flex h-14 items-center justify-between">
          <div className="flex items-center gap-8">
            <AppName />

            <nav className="hidden md:flex items-center gap-1">
              {visibleTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg typo-caption font-semibold transition-all ${
                    activeTab === tab.key
                      ? "bg-[var(--color-bg-alt)] text-[var(--color-text)]"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <span className="typo-caption px-2 py-1 rounded-full bg-accent/10 text-accent font-medium">
              {roleLabel}
            </span>

            <div className="flex items-center gap-3 pl-4 border-l border-[var(--color-border)]">
              <img
                src={
                  userProfile?.avatar ||
                  user?.photoURL ||
                  "https://placehold.co/60x60/eee/white"
                }
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

        {/* Mobile tabs */}
        <div className="md:hidden border-t border-[var(--color-border)] overflow-x-auto">
          <div className="flex px-4 py-2 gap-1">
            {visibleTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg typo-caption font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.key
                    ? "bg-[var(--color-bg-alt)] text-[var(--color-text)]"
                    : "text-[var(--color-text-secondary)]"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="container-main py-10">
        {activeTab === "overview" && (
          <div className="mx-auto max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="glass-card mb-8 rounded-2xl p-8 md:p-10">
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                <img
                  src={
                    userProfile?.avatar ||
                    user?.photoURL ||
                    "https://placehold.co/100x100/eee/white"
                  }
                  alt="User avatar"
                  className="h-20 w-20 md:h-24 md:w-24 rounded-full object-cover"
                />
                <div className="text-center md:text-left">
                  <h1 className="typo-h1">
                    {user?.displayName ||
                      userProfile?.email ||
                      appCopy.profile.fallbackName}
                  </h1>
                  <p className="typo-body text-[var(--color-text-secondary)] mt-1">
                    {user?.email}
                  </p>
                  <p className="typo-caption text-[var(--color-text-secondary)] mt-2 uppercase tracking-wider">
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
                {appCopy.profile.stats.map(
                  (stat: { value: string; label: string }) => (
                    <div key={stat.label} className="text-center">
                      <p className="typo-h1">{stat.value}</p>
                      <p className="typo-caption text-[var(--color-text-secondary)] uppercase tracking-wider mt-2">
                        {stat.label}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-8 md:p-10">
              <h2 className="typo-h2 mb-4">{appCopy.feedback.title}</h2>
              <FeedbackForm uid={user?.uid} />
            </div>
          </div>
        )}

        {activeTab === "products" && userProfile && (
          <div className="mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ProductManager userProfile={userProfile} />
          </div>
        )}

        {activeTab === "courses" && isAdmin && userProfile && (
          <div className="mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CourseManager userProfile={userProfile} />
          </div>
        )}

        {activeTab === "users" && isAdmin && (
          <div className="mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <UserManager />
          </div>
        )}

        {activeTab === "blogs" && isAdmin && (
          <div className="mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <BlogManager />
          </div>
        )}

        {activeTab === "categories" && isAdmin && (
          <div className="mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CategoryManager />
          </div>
        )}

        {activeTab === "notifications" && isAdmin && user && (
          <div className="mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <FCMManager uid={user.uid} />
          </div>
        )}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
