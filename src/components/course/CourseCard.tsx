"use client";

import Link from "next/link";
import type { Course } from "@/lib/course-data";
import { useLanguage, useTranslations } from "@/lib/i18n";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { BookOpen, Clock, Users, GraduationCap } from "lucide-react";
import { resolveLocalMediaUrl } from "@/lib/local-media";

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${mins > 0 ? `${mins}m` : ""}`;
  return `${mins}m`;
}

const LEVEL_LABELS: Record<string, Record<string, string>> = {
  en: { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" },
  vi: { beginner: "Cơ bản", intermediate: "Trung cấp", advanced: "Nâng cao" },
};

export function CourseCard({ course }: { course: Course }) {
  const { language } = useLanguage();
  const t = useTranslations("courses");

  const title = language === "vi" && course.title_vi ? course.title_vi : course.title;
  const description =
    language === "vi" && course.description_vi
      ? course.description_vi
      : course.description;
  const thumbnailSrc = resolveLocalMediaUrl(course.thumbnail);

  return (
    <div className="relative h-full rounded-2xl shadow-xl">
      <GlowingEffect
        spread={40}
        glow
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
        borderWidth={2}
      />
      <Link href={`/courses/${course.slug}`} className="group block h-full">
        <article className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-[var(--color-card-bg)]">
          {/* Thumbnail */}
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-accent/5">
            {thumbnailSrc ? (
              <img
                src={thumbnailSrc}
                alt={title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <GraduationCap size={48} className="text-accent/30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

            {/* Badges */}
            <div className="absolute left-3 top-3 flex gap-2">
              <span className="rounded-full bg-[var(--color-bg)]/80 px-2.5 py-1 text-[10px] font-semibold backdrop-blur-sm">
                {LEVEL_LABELS[language]?.[course.level] || course.level}
              </span>
              {course.price === 0 && (
                <span className="rounded-full bg-green-500/80 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                  {t.catalog.free}
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col p-5">
            <h2 className="mb-2 text-base font-semibold leading-snug transition-colors group-hover:text-accent line-clamp-2">
              {title}
            </h2>
            <p className="mb-4 flex-1 text-sm leading-relaxed text-[var(--color-text-secondary)] line-clamp-2">
              {description}
            </p>

            {/* Meta */}
            <div className="flex items-center gap-4 pt-4 border-t border-[var(--color-border)]">
              <span className="flex items-center gap-1 text-[12px] text-[var(--color-text-secondary)]">
                <BookOpen size={12} />
                {course.totalLessons} {t.catalog.lessons}
              </span>
              <span className="flex items-center gap-1 text-[12px] text-[var(--color-text-secondary)]">
                <Clock size={12} />
                {formatDuration(course.totalDuration)}
              </span>
              <span className="flex items-center gap-1 text-[12px] text-[var(--color-text-secondary)]">
                <Users size={12} />
                {course.enrollmentCount}
              </span>
              {course.price > 0 && (
                <span className="ml-auto text-sm font-semibold text-accent">
                  {course.price.toLocaleString()} {course.currency}
                </span>
              )}
            </div>
          </div>
        </article>
      </Link>
    </div>
  );
}
