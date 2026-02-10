"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ArrowUpRight } from "lucide-react";

interface AppItem {
  name: string;
  desc: string;
  color: string;
  initial: string;
}

const topThisWeek: AppItem[] = [
  { name: "VietGPT", desc: "Chatbot AI tiếng Việt thông minh", color: "bg-blue-500", initial: "V" },
  { name: "PixelAI Studio", desc: "Tạo ảnh sản phẩm bằng AI", color: "bg-purple-500", initial: "P" },
  { name: "CodeBuddy VN", desc: "Trợ lý lập trình AI", color: "bg-emerald-500", initial: "C" },
  { name: "EduMentor", desc: "Gia sư AI cá nhân hoá", color: "bg-amber-500", initial: "E" },
  { name: "DataSense", desc: "Phân tích dữ liệu tự động", color: "bg-rose-500", initial: "D" },
];

const vnFavourites: AppItem[] = [
  { name: "VoiceAI Việt", desc: "Chuyển giọng nói thành văn bản", color: "bg-cyan-500", initial: "V" },
  { name: "DocuScan AI", desc: "OCR thông minh cho tiếng Việt", color: "bg-orange-500", initial: "D" },
  { name: "MarketBot", desc: "Tự động hoá marketing bằng AI", color: "bg-pink-500", initial: "M" },
  { name: "HealthCheck AI", desc: "Tư vấn sức khoẻ bằng AI", color: "bg-teal-500", initial: "H" },
  { name: "FinBot", desc: "Trợ lý tài chính thông minh", color: "bg-indigo-500", initial: "F" },
];

function AppList({ items }: { items: AppItem[] }) {
  return (
    <div className="divide-y divide-[var(--color-border)]">
      {items.map((app) => (
        <div
          key={app.name}
          className="flex items-center gap-4 py-3.5 transition-colors hover:bg-[var(--color-text)]/[0.02]"
        >
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${app.color}`}
          >
            <span className="text-sm font-bold text-white">{app.initial}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-tight">{app.name}</p>
            <p className="mt-0.5 text-[11px] text-[var(--color-text-secondary)]">
              {app.desc}
            </p>
          </div>
          <button className="shrink-0 rounded-full bg-accent/10 px-3.5 py-1.5 text-[11px] font-semibold text-accent transition-colors hover:bg-accent/20">
            Xem
          </button>
        </div>
      ))}
    </div>
  );
}

export function TopApps() {
  return (
    <section id="top-apps" className="section-padding">
      <div className="container-main">
        <ScrollReveal>
          <h2 className="mb-8 text-section-title font-bold tracking-tight">
            Ứng dụng AI hàng đầu
          </h2>
        </ScrollReveal>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left card — Top apps this week */}
          <ScrollReveal delay={0}>
            <div className="glass-card h-full rounded-3xl p-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-accent">
                Yêu thích
              </p>
              <h3 className="mt-1 text-xl font-bold">Top tuần này</h3>
              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                Những ứng dụng AI được cộng đồng yêu thích nhất tuần.
              </p>
              <div className="mt-4">
                <AppList items={topThisWeek} />
              </div>
            </div>
          </ScrollReveal>

          {/* Right card — Vietnam's favourites */}
          <ScrollReveal delay={0.1}>
            <div className="glass-card h-full rounded-3xl p-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-accent">
                Thiết yếu
              </p>
              <h3 className="mt-1 text-xl font-bold">Yêu thích tại Việt Nam</h3>
              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                Các sản phẩm AI phổ biến nhất được người Việt tin dùng.
              </p>
              <div className="mt-4">
                <AppList items={vnFavourites} />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
