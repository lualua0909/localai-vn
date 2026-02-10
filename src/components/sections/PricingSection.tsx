"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/Button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Khám phá",
    price: "Miễn phí",
    period: "",
    description: "Cho người dùng muốn tìm kiếm sản phẩm AI.",
    features: [
      "Duyệt tất cả sản phẩm",
      "Vote & review sản phẩm",
      "Tạo bộ sưu tập cá nhân",
      "Nhận newsletter hàng tuần",
      "Tham gia cộng đồng",
    ],
    cta: "Bắt đầu ngay",
    popular: false,
  },
  {
    name: "Nhà phát triển",
    price: "199K",
    period: "/tháng",
    description: "Cho founder muốn quảng bá sản phẩm AI.",
    features: [
      "Đăng không giới hạn sản phẩm",
      "Badge \"Verified Developer\"",
      "Featured listing 2 lần/tháng",
      "Analytics chi tiết",
      "Priority review 12h",
      "Hỗ trợ ưu tiên",
    ],
    cta: "Dùng thử 14 ngày",
    popular: true,
    footnote: 1,
  },
  {
    name: "Doanh nghiệp",
    price: "Tuỳ chỉnh",
    period: "",
    description: "Cho tổ chức muốn hợp tác chiến lược.",
    features: [
      "Tất cả tính năng Pro",
      "Sponsored placement",
      "Co-marketing campaigns",
      "API truy cập dữ liệu",
      "Account manager riêng",
      "Báo cáo thị trường AI",
    ],
    cta: "Liên hệ",
    popular: false,
    footnote: 2,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="section-padding">
      <div className="container-main">
        {/* Header */}
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-accent">
            Bảng giá
          </p>
          <h2 className="text-section-title font-bold tracking-tight">
            Chọn gói phù hợp với bạn
          </h2>
          <p className="mt-4 text-base text-[var(--color-text-secondary)]">
            Miễn phí cho người khám phá. Gói Pro cho nhà phát triển muốn nổi bật.
          </p>
        </ScrollReveal>

        {/* Cards */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, idx) => (
            <ScrollReveal key={plan.name} delay={idx * 0.1}>
              <div
                className={`glass-card relative flex h-full flex-col rounded-3xl p-8 ${
                  plan.popular
                    ? "ring-2 ring-accent shadow-lg shadow-accent/10"
                    : ""
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-[11px] font-semibold text-white">
                    Phổ biến nhất
                  </span>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-sm text-[var(--color-text-secondary)]">
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                    {plan.description}
                    {plan.footnote && (
                      <sup className="ml-0.5 text-accent">
                        ({plan.footnote})
                      </sup>
                    )}
                  </p>
                </div>

                <ul className="mb-8 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check
                        size={14}
                        className="mt-0.5 shrink-0 text-accent"
                      />
                      <span className="text-sm">{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  href="/signin"
                  variant={plan.popular ? "primary" : "secondary"}
                  size="md"
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
