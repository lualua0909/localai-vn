"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";

const stats = [
  { value: "500+", label: "Sản phẩm AI", desc: "được đăng tải trên nền tảng" },
  { value: "10K+", label: "Người dùng", desc: "khám phá sản phẩm mỗi tháng" },
  { value: "200+", label: "Nhà phát triển", desc: "đang xây dựng sản phẩm AI" },
  { value: "50+", label: "Đối tác", desc: "công ty công nghệ hợp tác" },
];

export function AstraAnalytics() {
  return (
    <section id="stats" className="section-padding">
      <div className="container-main">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-accent">
            Con số
          </p>
          <h2 className="text-section-title font-bold tracking-tight">
            LocalAI trong con số
          </h2>
          <p className="mt-4 text-base text-[var(--color-text-secondary)]">
            Cộng đồng AI Việt Nam đang phát triển mỗi ngày.
          </p>
        </ScrollReveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, idx) => (
            <ScrollReveal key={stat.label} delay={idx * 0.08}>
              <div className="glass-card flex flex-col items-center rounded-3xl p-8 text-center">
                <span className="text-gradient text-4xl font-bold">
                  {stat.value}
                </span>
                <h3 className="mt-2 text-base font-semibold">{stat.label}</h3>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  {stat.desc}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
