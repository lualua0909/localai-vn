"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import enCommon from "@/i18n/en/common.json";
import enHome from "@/i18n/en/home.json";
import enPricing from "@/i18n/en/pricing.json";
import enBlog from "@/i18n/en/blog.json";
import enBlogDetail from "@/i18n/en/blogDetail.json";
import enSignin from "@/i18n/en/signin.json";
import enApp from "@/i18n/en/app.json";
import enExplore from "@/i18n/en/explore.json";
import enFeedback from "@/i18n/en/feedback.json";
import enMeta from "@/i18n/en/meta.json";

import viCommon from "@/i18n/vi/common.json";
import viHome from "@/i18n/vi/home.json";
import viPricing from "@/i18n/vi/pricing.json";
import viBlog from "@/i18n/vi/blog.json";
import viBlogDetail from "@/i18n/vi/blogDetail.json";
import viSignin from "@/i18n/vi/signin.json";
import viApp from "@/i18n/vi/app.json";
import viExplore from "@/i18n/vi/explore.json";
import viFeedback from "@/i18n/vi/feedback.json";
import viMeta from "@/i18n/vi/meta.json";

const storageKey = "localai-lang";

const translations = {
  en: {
    common: enCommon,
    home: enHome,
    pricing: enPricing,
    blog: enBlog,
    blogDetail: enBlogDetail,
    signin: enSignin,
    app: enApp,
    explore: enExplore,
    feedback: enFeedback,
    meta: enMeta,
  },
  vi: {
    common: viCommon,
    home: viHome,
    pricing: viPricing,
    blog: viBlog,
    blogDetail: viBlogDetail,
    signin: viSignin,
    app: viApp,
    explore: viExplore,
    feedback: viFeedback,
    meta: viMeta,
  },
};

export type SupportedLocale = keyof typeof translations;
export type PageKey = keyof (typeof translations)[SupportedLocale];

type LanguageContextValue = {
  language: SupportedLocale;
  setLanguage: (lang: SupportedLocale) => void;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined
);

function normalizeLocale(lang: string | null): SupportedLocale {
  return lang === "en" ? "en" : "vi";
}

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguageState] = useState<SupportedLocale>("vi");

  useEffect(() => {
    const stored = normalizeLocale(localStorage.getItem(storageKey));
    setLanguageState(stored);
    document.documentElement.lang = stored;
  }, []);

  const setLanguage = (lang: SupportedLocale) => {
    const normalized = normalizeLocale(lang);
    setLanguageState(normalized);
    localStorage.setItem(storageKey, normalized);
    document.documentElement.lang = normalized;
  };

  const value = useMemo(
    () => ({ language, setLanguage }),
    [language]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}

export function useTranslations<K extends PageKey>(page: K) {
  const { language } = useLanguage();
  const locale = translations[language] ? language : "vi";
  const pageCopy = translations[locale][page] ?? translations.vi[page];
  return pageCopy as (typeof translations)[SupportedLocale][K];
}

export const supportedLanguages: { value: SupportedLocale; label: string }[] =
  translations.vi.common.footer.languageOptions.map((opt) => ({
    value: opt.value as SupportedLocale,
    label: opt.label,
  }));

export const metaByLocale = {
  vi: translations.vi.meta,
  en: translations.en.meta,
};
