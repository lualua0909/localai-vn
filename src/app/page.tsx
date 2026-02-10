"use client";

import { Header } from "@/components/layout/Header";
import { SubNav } from "@/components/layout/SubNav";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/hero/HeroSection";
import { AstraModels } from "@/components/sections/AstraModels";
import { TopApps } from "@/components/sections/TopApps";
import { AstraStudio } from "@/components/sections/AstraStudio";
import { AstraAutomations } from "@/components/sections/AstraAutomations";
import { AstraIntegrations } from "@/components/sections/AstraIntegrations";
import { AstraSecurity } from "@/components/sections/AstraSecurity";
import { AstraAnalytics } from "@/components/sections/AstraAnalytics";

export default function HomePage() {
  return (
    <>
      <Header />
      <SubNav />
      <main>
        <HeroSection />
        <AstraModels />
        <TopApps />
        <AstraStudio />
        <AstraAutomations />
        <AstraIntegrations />
        <AstraSecurity />
        <AstraAnalytics />
      </main>
      <Footer />
    </>
  );
}
