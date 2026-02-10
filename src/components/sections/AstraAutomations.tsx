"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ArrowRight, UserPlus, Upload, Rocket } from "lucide-react";

const steps = [
  {
    icon: <UserPlus size={24} />,
    title: "Đăng ký tài khoản",
    desc: "Tạo tài khoản miễn phí trong 30 giây. Hỗ trợ đăng nhập bằng Google, GitHub.",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    icon: <Upload size={24} />,
    title: "Đăng sản phẩm AI",
    desc: "Điền thông tin sản phẩm, thêm ảnh demo, liên kết. Đội ngũ LocalAI sẽ review trong 24h.",
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    icon: <Rocket size={24} />,
    title: "Được cộng đồng khám phá",
    desc: "Sản phẩm xuất hiện trên trang chủ, được vote, review và chia sẻ bởi cộng đồng AI Việt.",
    color: "bg-emerald-500/10 text-emerald-500",
  },
];

export function AstraAutomations() {
  return (
    <section id="how-it-works" className="section-padding">
      <div className="container-main">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-accent">
            Đơn giản
          </p>
          <h2 className="text-section-title font-bold tracking-tight">
            Cách hoạt động
          </h2>
          <p className="mt-4 text-base text-[var(--color-text-secondary)]">
            Chỉ 3 bước để sản phẩm AI của bạn tiếp cận hàng ngàn người dùng Việt Nam.
          </p>
        </ScrollReveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {steps.map((step, idx) => (
            <ScrollReveal key={step.title} delay={idx * 0.1}>
              <div className="glass-card relative flex flex-col items-center rounded-3xl p-8 text-center">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                    {idx + 1}
                  </span>
                </div>

                <div className={`mb-4 mt-2 flex h-14 w-14 items-center justify-center rounded-2xl ${step.color}`}>
                  {step.icon}
                </div>

                <h3 className="mb-2 text-base font-semibold">{step.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {step.desc}
                </p>

                {idx < 2 && (
                  <div className="absolute -right-3 top-1/2 hidden -translate-y-1/2 sm:block">
                    <ArrowRight size={16} className="text-[var(--color-text-secondary)]/40" />
                  </div>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
