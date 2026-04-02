"use client";

import Link from "next/link";
import type { Course } from "@/lib/course-data";
import { useLanguage, useTranslations } from "@/lib/i18n";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { GLOW_DEFAULTS } from "@/components/ui/glow-defaults";
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
    <div className="relative h-full rounded-2xl shadow-card">
      <GlowingEffect {...GLOW_DEFAULTS} />
      <Link href={`/courses/${course.slug}`} className="group block h-full">
        <article className="content-card">
          {/* Thumbnail */}
          <div className="content-card-thumbnail bg-accent/5">
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
            <div className="content-card-thumbnail-overlay" />

            {/* Badges */}
            <div className="absolute left-3 top-3 flex gap-2">
              <span className="chip-filled">
                {LEVEL_LABELS[language]?.[course.level] || course.level}
              </span>
              {course.price === 0 && (
                <span className="chip bg-green-500/80 text-white">
                  {t.catalog.free}
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="content-card-body">
            <h2 className="content-card-title">
              {title}
            </h2>
            <p className="content-card-desc line-clamp-2">
              {description}
            </p>

            {/* Meta */}
            <div className="flex items-center gap-4 pt-4 border-t border-[var(--color-border)]">
              <span className="meta-text flex items-center gap-1">
                <BookOpen size={12} />
                {course.totalLessons} {t.catalog.lessons}
              </span>
              <span className="meta-text flex items-center gap-1">
                <Clock size={12} />
                {formatDuration(course.totalDuration)}
              </span>
              <span className="meta-text flex items-center gap-1">
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
