"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  Bell,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Package,
  Tag,
  Users,
} from "lucide-react";

import { AppName } from "@/components/ui/appName";
import { useAuth } from "@/lib/useAuth";

type DashboardTab = {
  href: string;
  label: string;
  icon: ReactNode;
  adminOnly?: boolean;
};

const DASHBOARD_TABS: DashboardTab[] = [
  {
    href: "/dashboard/user",
    label: "Overview",
    icon: <LayoutDashboard size={14} />,
  },
  {
    href: "/dashboard/products",
    label: "Products",
    icon: <Package size={14} />,
  },
  {
    href: "/dashboard/courses",
    label: "Courses",
    icon: <GraduationCap size={14} />,
    adminOnly: true,
  },
  {
    href: "/dashboard/users",
    label: "Users",
    icon: <Users size={14} />,
    adminOnly: true,
  },
  {
    href: "/dashboard/blogs",
    label: "Blogs",
    icon: <FileText size={14} />,
    adminOnly: true,
  },
  {
    href: "/dashboard/categories",
    label: "Categories",
    icon: <Tag size={14} />,
    adminOnly: true,
  },
  {
    href: "/dashboard/notifications",
    label: "FCM",
    icon: <Bell size={14} />,
    adminOnly: true,
  },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, userProfile, signOut } = useAuth();
  const isAdmin = userProfile ? userProfile.role <= 1 : false;
  const roleLabel =
    userProfile?.role === 0
      ? "Root"
      : userProfile?.role === 1
        ? "Admin"
        : "User";
  const visibleTabs = DASHBOARD_TABS.filter((tab) => !tab.adminOnly || isAdmin);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pb-24">
      <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-xl">
        <div className="container-main flex h-14 items-center justify-between">
          <div className="flex items-center gap-8">
            <AppName />

            <nav className="hidden items-center gap-1 md:flex">
              {visibleTabs.map((tab) => {
                const active = pathname === tab.href;

                return (
                  <a
                    key={tab.href}
                    href={tab.href}
                    className={`flex items-center gap-2 rounded-lg px-3 py-1.5 typo-caption font-semibold transition-all ${
                      active
                        ? "bg-[var(--color-bg-alt)] text-[var(--color-text)]"
                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </a>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <span className="rounded-full bg-accent/10 px-2 py-1 typo-caption font-medium text-accent">
              {roleLabel}
            </span>

            <div className="flex items-center gap-3 border-l border-[var(--color-border)] pl-4">
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
                className="text-[var(--color-text-secondary)] transition-colors hover:text-red-500"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto border-t border-[var(--color-border)] md:hidden">
          <div className="flex gap-1 px-4 py-2">
            {visibleTabs.map((tab) => {
              const active = pathname === tab.href;

              return (
                <a
                  key={tab.href}
                  href={tab.href}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 typo-caption font-medium transition-all ${
                    active
                      ? "bg-[var(--color-bg-alt)] text-[var(--color-text)]"
                      : "text-[var(--color-text-secondary)]"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </a>
              );
            })}
          </div>
        </div>
      </header>

      <main className="container-main py-10">{children}</main>
    </div>
  );
}
