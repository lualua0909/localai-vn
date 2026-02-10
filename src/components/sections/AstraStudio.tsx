"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Spotlight } from "@/components/ui/Spotlight";
import { ArrowUpRight, Star, TrendingUp } from "lucide-react";

const newProducts = [
  {
    name: "VietGPT",
    desc: "Chatbot AI tiếng Việt thông minh, hỗ trợ đa ngữ cảnh",
    category: "Chatbot",
    stars: 342,
    trending: true,
    color: "bg-blue-500",
  },
  {
    name: "PixelAI Studio",
    desc: "Tạo ảnh sản phẩm chuyên nghiệp bằng AI trong 30 giây",
    category: "Tạo ảnh",
    stars: 218,
    trending: true,
    color: "bg-purple-500",
  },
  {
    name: "CodeBuddy VN",
    desc: "Trợ lý lập trình AI hiểu tiếng Việt, hỗ trợ 20+ ngôn ngữ",
    category: "Code Assistant",
    stars: 185,
    trending: false,
    color: "bg-emerald-500",
  },
  {
    name: "EduMentor",
    desc: "Gia sư AI cá nhân hoá, luyện thi đại học và IELTS",
    category: "Giáo dục",
    stars: 156,
    trending: true,
    color: "bg-amber-500",
  },
  {
    name: "VoiceAI Việt",
    desc: "Chuyển giọng nói thành văn bản chính xác đến 98%",
    category: "Giọng nói",
    stars: 127,
    trending: false,
    color: "bg-cyan-500",
  },
  {
    name: "DocuScan AI",
    desc: "OCR thông minh cho tiếng Việt, nhận diện chữ viết tay",
    category: "Tiện ích",
    stars: 98,
    trending: true,
    color: "bg-orange-500",
  },
  {
    name: "FinBot",
    desc: "Trợ lý tài chính thông minh, phân tích đầu tư cá nhân",
    category: "Tài chính",
    stars: 89,
    trending: false,
    color: "bg-indigo-500",
  },
  {
    name: "HealthCheck AI",
    desc: "Tư vấn sức khoẻ bằng AI, theo dõi chỉ số hàng ngày",
    category: "Y tế",
    stars: 76,
    trending: false,
    color: "bg-rose-500",
  },
];

export function AstraStudio() {
  return (
    <section id="featured" className="section-padding">
      <div className="container-main">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-accent">
            Mới ra mắt
          </p>
          <h2 className="text-section-title font-bold tracking-tight">
            Sản phẩm mới
          </h2>
          <p className="mt-4 text-base text-[var(--color-text-secondary)]">
            Những sản phẩm AI Việt Nam mới nhất vừa được cộng đồng đăng tải.
          </p>
        </ScrollReveal>

        <div className="mt-14 grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
          {newProducts.map((product, idx) => (
            <ScrollReveal key={product.name} delay={idx * 0.06}>
              <Spotlight className="h-full rounded-3xl">
                <div className="glass-card flex h-full flex-col rounded-3xl p-6">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl ${product.color} flex items-center justify-center`}>
                        <span className="text-sm font-bold text-white">
                          {product.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">{product.name}</h3>
                        <span className="text-[10px] text-[var(--color-text-secondary)]">
                          {product.category}
                        </span>
                      </div>
                    </div>
                    <ArrowUpRight size={16} className="text-[var(--color-text-secondary)]" />
                  </div>

                  <p className="flex-1 text-sm text-[var(--color-text-secondary)]">
                    {product.desc}
                  </p>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-amber-500" />
                      <span className="text-xs font-medium">{product.stars}</span>
                    </div>
                    {product.trending && (
                      <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5">
                        <TrendingUp size={10} className="text-emerald-500" />
                        <span className="text-[10px] font-medium text-emerald-500">
                          Trending
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Spotlight>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
