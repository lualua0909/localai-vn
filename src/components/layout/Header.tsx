"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Menu, X, Sun, Moon, Monitor, LayoutDashboard, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage, useTranslations } from "@/lib/i18n";
import { useAuth } from "@/lib/useAuth";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { language } = useLanguage();
  const common = useTranslations("common");
  const navLinks = common.header.navLinks;
  const { user, userProfile, loading, signOut } = useAuth();

  useEffect(() => setMounted(true), []);

  const cycleTheme = () => {
    if (theme === "dark") setTheme("light");
    else if (theme === "light") setTheme("system");
    else setTheme("dark");
  };

  const themeIcon = !mounted ? (
    <span className="inline-block h-4 w-4" />
  ) : theme === "dark" ? (
    <Moon size={16} />
  ) : theme === "light" ? (
    <Sun size={16} />
  ) : (
    <Monitor size={16} />
  );

  const avatar =
    userProfile?.avatar ||
    user?.photoURL ||
    "https://placehold.co/80x80/eee/white";

  return (
    <header className="fixed top-0 z-50 w-full border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-xl">
      <div className="container-main flex h-12 items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="focus-ring rounded-md text-lg font-semibold tracking-tight"
        >
          {common.header.logo}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="focus-ring rounded-md nav-link"
            >
              {l.label}
            </Link>
          ))}

          <button
            onClick={cycleTheme}
            className="focus-ring rounded-full p-1.5 text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text)]"
            aria-label="Toggle theme"
          >
            {themeIcon}
          </button>

          {loading ? (
            <div className="h-8 w-24 animate-pulse rounded-full bg-[var(--color-bg-alt)]" />
          ) : user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/user"
                className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-3 py-1.5 text-[13px] font-medium text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-text)] hover:bg-[var(--color-bg-alt)] hover:text-[var(--color-text)]"
              >
                <LayoutDashboard size={14} />
                {common.header.dashboard}
              </Link>
              <button
                onClick={() => void signOut()}
                className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-secondary)] transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-500"
                aria-label={common.header.logout}
                title={common.header.logout}
              >
                <LogOut size={14} />
              </button>
              <Link href="/dashboard/user" className="focus-ring rounded-full">
                <img
                  src={avatar}
                  alt={language === "vi" ? "Tài khoản" : "Account"}
                  className="h-8 w-8 rounded-full object-cover"
                />
              </Link>
            </div>
          ) : (
            <Link
              href="/signin"
              className="focus-ring rounded-full bg-[var(--color-text)] px-4 py-1.5 text-[13px] font-medium text-[var(--color-bg)] transition-opacity hover:opacity-80"
            >
              {common.header.signin}
            </Link>
          )}
        </nav>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={cycleTheme}
            className="focus-ring rounded-full p-1.5 text-[var(--color-text-secondary)]"
            aria-label="Toggle theme"
          >
            {themeIcon}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="focus-ring rounded-md p-1.5"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="border-t border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur-xl md:hidden"
          >
            <nav className="container-main flex flex-col gap-1 py-4">
              {navLinks.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="focus-ring rounded-lg px-3 py-2.5 text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-alt)] hover:text-[var(--color-text)]"
                >
                  {l.label}
                </Link>
              ))}
              {loading ? (
                <div className="mt-2 h-11 animate-pulse rounded-full bg-[var(--color-bg-alt)]" />
              ) : user ? (
                <div className="mt-2 flex flex-col gap-2">
                  <Link
                    href="/dashboard/user"
                    onClick={() => setMobileOpen(false)}
                    className="focus-ring flex items-center justify-center gap-2 rounded-full bg-[var(--color-text)] px-4 py-2.5 text-center text-sm font-medium text-[var(--color-bg)]"
                  >
                    <LayoutDashboard size={16} />
                    {common.header.dashboard}
                  </Link>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      void signOut();
                    }}
                    className="focus-ring flex items-center justify-center gap-2 rounded-full border border-red-500/20 px-4 py-2.5 text-sm font-medium text-red-500"
                  >
                    <LogOut size={16} />
                    {common.header.logout}
                  </button>
                </div>
              ) : (
                <Link
                  href="/signin"
                  onClick={() => setMobileOpen(false)}
                  className="focus-ring mt-2 rounded-full bg-[var(--color-text)] px-4 py-2.5 text-center text-sm font-medium text-[var(--color-bg)]"
                >
                  {common.header.signin}
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
