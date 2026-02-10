"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { BentoGrid, BentoItem } from "@/components/ui/BentoGrid";
import { Bot, Image, Code2, GraduationCap, Banknote, HeartPulse, Wrench, Sparkles } from "lucide-react";

const categories = [
  { icon: <Bot size={18} />, title: "Chatbot & Trợ lý", desc: "Hội thoại AI, hỗ trợ khách hàng, trợ lý ảo" },
  { icon: <Image size={18} />, title: "Tạo ảnh & Video", desc: "Sinh ảnh, chỉnh sửa, tạo video bằng AI" },
  { icon: <Code2 size={18} />, title: "Code Assistant", desc: "Hỗ trợ lập trình, review code, debug" },
  { icon: <GraduationCap size={18} />, title: "Giáo dục", desc: "Học tập, gia sư AI, luyện thi" },
  { icon: <Banknote size={18} />, title: "Tài chính", desc: "Phân tích tài chính, kế toán, đầu tư" },
  { icon: <HeartPulse size={18} />, title: "Y tế & Sức khoẻ", desc: "Chẩn đoán, tư vấn sức khoẻ, nghiên cứu" },
  { icon: <Wrench size={18} />, title: "Tiện ích", desc: "Công cụ năng suất, tự động hoá, OCR" },
  { icon: <Sparkles size={18} />, title: "Sáng tạo nội dung", desc: "Viết blog, marketing, social media" },
];

export function AstraModels() {
  return (
    <section id="categories" className="section-padding">
      <div className="container-main">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-accent">
            Danh mục
          </p>
          <h2 className="text-section-title font-bold tracking-tight">
            Khám phá theo lĩnh vực
          </h2>
          <p className="mt-4 text-base text-[var(--color-text-secondary)]">
            Tìm sản phẩm AI phù hợp với nhu cầu của bạn từ 8 danh mục được phân loại rõ ràng.
          </p>
        </ScrollReveal>

        <div className="mt-14">
          <BentoGrid className="lg:grid-cols-4">
            {categories.map((cat, idx) => (
              <ScrollReveal key={cat.title} delay={idx * 0.05}>
                <BentoItem
                  icon={cat.icon}
                  title={cat.title}
                  description={cat.desc}
                  className="cursor-pointer"
                />
              </ScrollReveal>
            ))}
          </BentoGrid>
        </div>
      </div>
    </section>
  );
}
