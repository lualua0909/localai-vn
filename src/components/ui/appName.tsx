import { useTranslations } from "@/lib/i18n";

export function AppName() {
  const appCopy = useTranslations("app");
  return (
    <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
      <a href="/">{appCopy.topbar.appName}</a>
    </span>
  );
}
