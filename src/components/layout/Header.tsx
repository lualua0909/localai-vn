"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Menu, X, Sun, Moon, Monitor } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Khám phá", href: "#overview" },
  { label: "Danh mục", href: "#categories" },
  { label: "Cộng đồng", href: "#community" },
  { label: "Bảng giá", href: "/bang-gia" },
  { label: "Blog", href: "/blog" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

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

  return (
    <header className="fixed top-0 z-50 w-full border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-xl">
      <div className="container-main flex h-12 items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="focus-ring rounded-md text-lg font-semibold tracking-tight"
        >
          LocalAI
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="focus-ring rounded-md text-xs text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text)]"
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

          <Link
            href="/signin"
            className="focus-ring rounded-full bg-[var(--color-text)] px-4 py-1.5 text-xs font-medium text-[var(--color-bg)] transition-opacity hover:opacity-80"
          >
            Đăng nhập
          </Link>
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
              <Link
                href="/signin"
                onClick={() => setMobileOpen(false)}
                className="focus-ring mt-2 rounded-full bg-[var(--color-text)] px-4 py-2.5 text-center text-sm font-medium text-[var(--color-bg)]"
              >
                Đăng nhập
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
