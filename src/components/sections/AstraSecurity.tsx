"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Zap, Users, Globe, Eye } from "lucide-react";

const benefits = [
  {
    icon: <Zap size={24} />,
    title: "Hoàn toàn miễn phí",
    desc: "Khám phá và đăng sản phẩm không mất phí. Chúng tôi tin vào sự phát triển của cộng đồng AI Việt.",
    color: "bg-amber-500/10 text-amber-500",
  },
  {
    icon: <Users size={24} />,
    title: "Cộng đồng mạnh mẽ",
    desc: "Kết nối với hàng ngàn nhà phát triển, founder, và người dùng AI tại Việt Nam.",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    icon: <Eye size={24} />,
    title: "Tăng visibility",
    desc: "Sản phẩm của bạn được giới thiệu đến đúng đối tượng — người dùng đang tìm kiếm giải pháp AI.",
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    icon: <Globe size={24} />,
    title: "Made in Vietnam",
    desc: "Tự hào giới thiệu sản phẩm AI Việt Nam ra thế giới. Hỗ trợ song ngữ Việt-Anh.",
    color: "bg-emerald-500/10 text-emerald-500",
  },
];

export function AstraSecurity() {
  return (
    <section id="community" className="section-padding">
      <div className="container-main">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-accent">
            Lợi ích
          </p>
          <h2 className="text-section-title font-bold tracking-tight">
            Vì sao chọn LocalAI?
          </h2>
          <p className="mt-4 text-base text-[var(--color-text-secondary)]">
            Nền tảng được xây dựng bởi cộng đồng, cho cộng đồng AI Việt Nam.
          </p>
        </ScrollReveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {benefits.map((item, idx) => (
            <ScrollReveal key={item.title} delay={idx * 0.08}>
              <div className="glass-card flex items-start gap-5 rounded-3xl p-8">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${item.color}`}>
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-base font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                    {item.desc}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
