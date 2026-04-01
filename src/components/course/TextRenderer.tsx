"use client";

import { useLanguage } from "@/lib/i18n";
import { renderMarkdown } from "@/lib/markdown";

interface TextRendererProps {
  content: string;
}

export function TextRenderer({ content }: TextRendererProps) {
  const { language } = useLanguage();
  const html = renderMarkdown(content);

  return (
    <div className="overflow-hidden rounded-[28px] border border-[var(--color-border)] bg-[var(--color-card-bg)]">
      <div className="border-b border-[var(--color-border)] px-6 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
          {language === "vi" ? "Bài đọc" : "Reading lesson"}
        </p>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {language === "vi"
            ? "Nội dung được trình bày theo dạng bài đọc để học tập trung ngay trong LMS."
            : "Content is presented in a focused reading format directly inside the LMS."}
        </p>
      </div>
      <div
        className="prose prose-lg dark:prose-invert max-w-none p-6 sm:p-8"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
