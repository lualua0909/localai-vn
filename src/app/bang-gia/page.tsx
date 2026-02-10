"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PricingSection } from "@/components/sections/PricingSection";
import { Footnotes } from "@/components/sections/Footnotes";

export default function BangGiaPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        <PricingSection />
        <Footnotes />
      </main>
      <Footer />
    </>
  );
}
