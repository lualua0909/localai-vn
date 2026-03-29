"use client";

import type { Course } from "@/lib/course-data";
import { useLanguage, useTranslations } from "@/lib/i18n";
import { BookOpen, Clock, Users, GraduationCap, BarChart3 } from "lucide-react";

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

export function CourseHero({ course }: { course: Course }) {
  const { language } = useLanguage();
  const t = useTranslations("courses");

  const title = language === "vi" && course.title_vi ? course.title_vi : course.title;
  const description =
    language === "vi" && course.description_vi
      ? course.description_vi
      : course.description;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent/10 via-[var(--color-bg-alt)] to-[var(--color-bg)]">
      <div className="flex flex-col md:flex-row gap-8 p-8 md:p-12">
        {/* Info */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-2">
            <span className="typo-caption font-semibold text-accent uppercase tracking-wider">
              {course.category}
            </span>
            <span className="typo-caption px-2 py-0.5 rounded-full bg-accent/10 text-accent">
              {LEVEL_LABELS[language]?.[course.level] || course.level}
            </span>
          </div>

          <h1 className="typo-h1">{title}</h1>
          <p className="typo-body text-[var(--color-text-secondary)] max-w-2xl">
            {description}
          </p>

          <div className="flex items-center gap-2 typo-caption text-[var(--color-text-secondary)]">
            <span>{t.detail.instructor}:</span>
            <span className="font-semibold text-[var(--color-text)]">
              {course.instructorName}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="flex items-center gap-1.5 typo-caption text-[var(--color-text-secondary)]">
              <BookOpen size={14} />
              <span>
                {course.totalLessons} {t.catalog.lessons}
              </span>
            </div>
            <div className="flex items-center gap-1.5 typo-caption text-[var(--color-text-secondary)]">
              <Clock size={14} />
              <span>{formatDuration(course.totalDuration)}</span>
            </div>
            <div className="flex items-center gap-1.5 typo-caption text-[var(--color-text-secondary)]">
              <Users size={14} />
              <span>
                {course.enrollmentCount} {t.catalog.students}
              </span>
            </div>
            <div className="flex items-center gap-1.5 typo-caption text-[var(--color-text-secondary)]">
              <BarChart3 size={14} />
              <span>{LEVEL_LABELS[language]?.[course.level]}</span>
            </div>
          </div>

          {course.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {course.tags.map((tag) => (
                <span
                  key={tag}
                  className="typo-caption px-2.5 py-1 rounded-full bg-[var(--color-bg-alt)] border border-[var(--color-border)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Thumbnail */}
        <div className="w-full md:w-80 shrink-0">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={title}
              className="w-full aspect-video rounded-xl object-cover shadow-lg"
            />
          ) : (
            <div className="w-full aspect-video rounded-xl bg-accent/10 flex items-center justify-center">
              <GraduationCap size={64} className="text-accent/30" />
            </div>
          )}

          <div className="mt-4 p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
            {course.price === 0 ? (
              <p className="text-2xl font-bold text-green-600">{t.catalog.free}</p>
            ) : (
              <p className="text-2xl font-bold text-accent">
                {course.price.toLocaleString()} {course.currency}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
