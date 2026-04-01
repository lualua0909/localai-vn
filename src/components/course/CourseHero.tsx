"use client";

import type { Course } from "@/lib/course-data";
import { useLanguage, useTranslations } from "@/lib/i18n";
import {
  BookOpen,
  Clock,
  Users,
  GraduationCap,
  BarChart3,
  ArrowUpRight,
} from "lucide-react";
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

export function CourseHero({ course }: { course: Course }) {
  const { language } = useLanguage();
  const t = useTranslations("courses");

  const title = language === "vi" && course.title_vi ? course.title_vi : course.title;
  const description =
    language === "vi" && course.description_vi
      ? course.description_vi
      : course.description;
  const thumbnailSrc = resolveLocalMediaUrl(course.thumbnail);
  const stats = [
    {
      icon: <BookOpen size={15} />,
      label: t.catalog.lessons,
      value: course.totalLessons,
    },
    {
      icon: <Clock size={15} />,
      label: t.detail.totalDuration,
      value: formatDuration(course.totalDuration),
    },
    {
      icon: <Users size={15} />,
      label: t.catalog.students,
      value: course.enrollmentCount,
    },
    {
      icon: <BarChart3 size={15} />,
      label: language === "vi" ? "Cấp độ" : "Level",
      value: LEVEL_LABELS[language]?.[course.level] || course.level,
    },
  ];

  return (
    <section className="overflow-hidden rounded-[34px] border border-[rgba(17,17,17,0.12)] bg-[#f8f5ed] shadow-[0_18px_60px_rgba(58,45,23,0.08)]">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1.15fr)_360px]">
        <div className="border-b border-[rgba(17,17,17,0.1)] p-7 sm:p-9 lg:border-b-0 lg:border-r">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[rgba(17,17,17,0.12)] bg-white/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6e665c]">
              {course.category}
            </span>
            <span className="rounded-full border border-[rgba(17,17,17,0.12)] bg-[#efe8db] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#171512]">
              {LEVEL_LABELS[language]?.[course.level] || course.level}
            </span>
          </div>

          <h1 className="mt-5 max-w-4xl font-sans text-[2.6rem] font-semibold leading-[0.95] tracking-[-0.06em] text-[#171512] sm:text-[3.4rem]">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-7 text-[#5f584e] sm:text-base">
            {description}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-[#5d5850]">
            <span>{t.detail.instructor}</span>
            <span className="text-[#b7b0a5]">/</span>
            <span className="font-medium text-[#171512]">
              {course.instructorName}
            </span>
            <span className="text-[#b7b0a5]">/</span>
            <span>
              {course.price === 0
                ? t.catalog.free
                : `${course.price.toLocaleString()} ${course.currency}`}
            </span>
          </div>

          {course.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {course.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[rgba(17,17,17,0.12)] bg-white/65 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6e665c]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[22px] border border-[rgba(17,17,17,0.1)] bg-white/65 p-4"
              >
                <div className="flex items-center gap-2 text-[#6e665c]">
                  {stat.icon}
                  <p className="text-[11px] uppercase tracking-[0.16em]">
                    {stat.label}
                  </p>
                </div>
                <p className="mt-3 font-sans text-[1.35rem] leading-none tracking-[-0.03em] text-[#171512]">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between bg-[#f2ede2] p-6 sm:p-7">
          {thumbnailSrc ? (
            <img
              src={thumbnailSrc}
              alt={title}
              className="w-full aspect-video rounded-[26px] border border-[rgba(17,17,17,0.1)] object-cover shadow-[0_12px_30px_rgba(58,45,23,0.12)]"
            />
          ) : (
            <div className="flex aspect-video w-full items-center justify-center rounded-[26px] border border-[rgba(17,17,17,0.1)] bg-white/50">
              <GraduationCap size={64} className="text-[#b1a795]" />
            </div>
          )}

          <div className="mt-5 rounded-[26px] border border-[rgba(17,17,17,0.1)] bg-white/65 p-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#7a7267]">
              {language === "vi" ? "Sẵn sàng để học" : "Ready to learn"}
            </p>
            <p className="mt-3 font-sans text-[2rem] leading-none tracking-[-0.05em] text-[#171512]">
              {course.price === 0 ? t.catalog.free : `${course.price.toLocaleString()} ${course.currency}`}
            </p>
            <p className="mt-3 text-sm leading-6 text-[#5f584e]">
              {language === "vi"
                ? "Truy cập curriculum, lesson assets và không gian học tập theo đúng giao diện LMS."
                : "Access the curriculum, lesson assets, and the full learning space in the LMS interface."}
            </p>
            <div className="mt-5 flex items-center gap-2 text-sm font-medium text-[#171512]">
              <ArrowUpRight size={16} />
              <span>
                {language === "vi"
                  ? "Course page đồng bộ với learning experience"
                  : "Course page aligned with the learning experience"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
