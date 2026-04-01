"use client";

import { ThemeProvider } from "./ThemeProvider";
import { LanguageProvider } from "@/lib/i18n";
import { FCMAutoRegister } from "./FCMAutoRegister";
import { AuthProvider } from "@/lib/useAuth";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ThemeProvider>
          <FCMAutoRegister />
          {children}
        </ThemeProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
