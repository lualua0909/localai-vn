"use client";

import Link from "next/link";
import { useLanguage, useTranslations, SupportedLocale } from "@/lib/i18n";

export function Footer() {
  const { footer } = useTranslations("common");
  const { language, setLanguage } = useLanguage();
  const columns = footer.columns;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-alt)]">
      <div className="container-main section-padding">
        {/* Columns */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-[13px] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-[var(--color-border)] pt-8 sm:flex-row">
          <p className="text-[13px] text-[var(--color-text-secondary)]">
            {footer.copyright.replace("{year}", String(year))}
          </p>
          <div className="flex items-center gap-2 text-[13px] text-[var(--color-text-secondary)]">
            <span className="font-medium">{footer.languageLabel}</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as SupportedLocale)}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 text-[var(--color-text)]"
            >
              {footer.languageOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </footer>
  );
}
