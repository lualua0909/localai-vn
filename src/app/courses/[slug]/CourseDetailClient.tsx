"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { Course, CourseSection, Lesson } from "@/lib/course-data";
import { useLanguage, useTranslations } from "@/lib/i18n";
import { CourseHero } from "@/components/course/CourseHero";
import { EnrollButton } from "@/components/course/EnrollButton";
import {
  BarChart3,
  Video,
  FileText,
  File,
  FileQuestion,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  BookOpen,
  Lock,
  Layers3,
  Sparkles,
  GraduationCap,
  CirclePlay,
  ArrowUpRight,
} from "lucide-react";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  video: <Video size={14} className="text-blue-500" />,
  text: <FileText size={14} className="text-green-500" />,
  pdf: <File size={14} className="text-red-500" />,
  quiz: <FileQuestion size={14} className="text-purple-500" />,
};

function formatDuration(seconds?: number): string {
  if (!seconds) return "";
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${mins > 0 ? `${mins}m` : ""}`;
  return `${mins}m`;
}

interface Props {
  course: Course;
  sections: CourseSection[];
  lessons: Lesson[];
}

export function CourseDetailClient({ course, sections, lessons }: Props) {
  const { language } = useLanguage();
  const t = useTranslations("courses");

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => new Set(sections.map((s) => s.id))
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  const lessonsBySection = lessons.reduce(
    (acc, lesson) => {
      if (!acc[lesson.sectionId]) acc[lesson.sectionId] = [];
      acc[lesson.sectionId].push(lesson);
      return acc;
    },
    {} as Record<string, Lesson[]>
  );
  const totalVideos = lessons.filter((lesson) => lesson.type === "video").length;
  const totalQuizzes = lessons.filter((lesson) => lesson.type === "quiz").length;
  const freePreviewCount = lessons.filter((lesson) => lesson.isFree).length;
  const courseDescription =
    language === "vi" && course?.description_vi
      ? course.description_vi
      : course?.description || "";
  const learningPoints =
    language === "vi"
      ? [
          "Lộ trình có cấu trúc theo từng section, dễ theo dõi và học liên tục.",
          "Kết hợp video, tài liệu, quiz và bài thực hành để không bị học chay.",
          "Theo dõi tiến độ, quay lại bài đang học và học theo tốc độ riêng.",
          "Tài nguyên bài học được tổ chức rõ ràng, phù hợp cho self-learning lẫn coaching.",
        ]
      : [
          "Structured curriculum with clear sections so learners always know the next step.",
          "Blends videos, reading materials, quizzes, and guided practice for deeper retention.",
          "Supports self-paced learning with progress tracking and smooth resume experience.",
          "Organized lesson assets make the course work for both solo study and coached cohorts.",
        ];
  const sidebarFeatures =
    language === "vi"
      ? [
          `${sections.length} sections được tổ chức rõ ràng`,
          `${freePreviewCount} bài học xem thử miễn phí`,
          `${totalVideos} video bài giảng và ${totalQuizzes} quiz`,
          "Truy cập mọi lúc trên desktop và mobile",
        ]
      : [
          `${sections.length} structured curriculum sections`,
          `${freePreviewCount} free preview lessons`,
          `${totalVideos} video lessons and ${totalQuizzes} quizzes`,
          "Access across desktop and mobile devices",
        ];
  const quickStats = [
    {
      icon: <Layers3 size={18} className="text-accent" />,
      label: language === "vi" ? "Sections" : "Sections",
      value: sections.length,
    },
    {
      icon: <BookOpen size={18} className="text-accent" />,
      label: language === "vi" ? "Bài học" : "Lessons",
      value: course?.totalLessons || lessons.length,
    },
    {
      icon: <CirclePlay size={18} className="text-accent" />,
      label: language === "vi" ? "Video" : "Videos",
      value: totalVideos,
    },
    {
      icon: <BarChart3 size={18} className="text-accent" />,
      label: language === "vi" ? "Cấp độ" : "Level",
      value: language === "vi" ? course?.level || "" : course?.level || "",
    },
  ];

  return (
    <>
      <Header />

      <main className="bg-[#f3f0e8] px-3 pb-8 pt-0 sm:px-4 sm:pb-10 lg:px-6 lg:pb-12">
        <div className="mx-auto max-w-[1440px]">
          <div className="overflow-hidden rounded-[0_0_28px_28px] border border-t-0 border-[rgba(17,17,17,0.12)] bg-[#f8f5ed] shadow-[0_18px_60px_rgba(58,45,23,0.08)]">
            <div className="space-y-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
              <CourseHero course={course} />

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {quickStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[24px] border border-[rgba(17,17,17,0.1)] bg-white/65 p-5 transition-transform duration-300 hover:-translate-y-0.5"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(17,17,17,0.1)] bg-[#f3efe5]">
                {stat.icon}
              </div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#7a7267]">
                {stat.label}
              </p>
              <p className="mt-3 font-sans text-[1.6rem] font-semibold capitalize tracking-[-0.03em] text-[#171512]">
                {stat.value}
              </p>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.45fr)_380px]">
          <div className="space-y-8">
            <section className="rounded-[30px] border border-[rgba(17,17,17,0.12)] bg-white/60 p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(17,17,17,0.1)] bg-[#f3efe5]">
                  <Sparkles size={18} className="text-[#171512]" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#7a7267]">
                    {t.detail.description}
                  </p>
                  <h2 className="mt-1 font-sans text-[2rem] font-semibold tracking-[-0.04em] text-[#171512]">
                    {t.detail.whatYouWillLearn}
                  </h2>
                </div>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
                <div className="space-y-4">
                  <p className="text-[15px] leading-7 text-[#5f584e]">
                    {courseDescription}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {course.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[rgba(17,17,17,0.12)] bg-[#faf7f0] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6e665c]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {learningPoints.map((point) => (
                    <div
                      key={point}
                      className="rounded-[22px] border border-[rgba(17,17,17,0.1)] bg-[#faf7f0] p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-[rgba(17,17,17,0.08)] bg-white text-[#171512]">
                          <CheckCircle size={14} />
                        </div>
                        <p className="text-sm leading-6 text-[#5f584e]">
                          {point}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-[30px] border border-[rgba(17,17,17,0.12)] bg-white/60 p-6 sm:p-8">
              <div className="flex flex-col gap-4 border-b border-[rgba(17,17,17,0.1)] pb-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#7a7267]">
                    LMS
                  </p>
                  <h2 className="mt-1 font-sans text-[2rem] font-semibold tracking-[-0.04em] text-[#171512]">
                    {t.detail.curriculum}
                  </h2>
                  <p className="mt-2 text-sm text-[#5f584e]">
                    {language === "vi"
                      ? "Lộ trình học được chia theo section, có lesson preview, thời lượng và định dạng rõ ràng."
                      : "Curriculum is organized into sections with preview access, durations, and lesson formats."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-[rgba(17,17,17,0.1)] bg-[#faf7f0] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6e665c]">
                    {course.totalLessons} {t.catalog.lessons}
                  </span>
                  <span className="rounded-full border border-[rgba(17,17,17,0.1)] bg-[#faf7f0] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6e665c]">
                    {formatDuration(course.totalDuration)}
                  </span>
                  <span className="rounded-full border border-[rgba(17,17,17,0.1)] bg-[#faf7f0] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6e665c]">
                    {freePreviewCount} {t.detail.freePreview}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
              {sections.map((section) => {
                const sectionLessons = lessonsBySection[section.id] || [];
                const isExpanded = expandedSections.has(section.id);
                const sectionTitle =
                  language === "vi" && section.title_vi
                    ? section.title_vi
                    : section.title;

                return (
                  <div
                    key={section.id}
                    className="overflow-hidden rounded-[26px] border border-[rgba(17,17,17,0.1)] bg-[#faf7f0]"
                  >
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="flex w-full items-center gap-4 bg-[#f3efe5] px-5 py-5 text-left transition-colors hover:bg-[#eee8da]"
                    >
                      {isExpanded ? (
                        <ChevronDown size={16} className="text-[#6f6a63]" />
                      ) : (
                        <ChevronRight size={16} className="text-[#6f6a63]" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-[#7c7469]">
                          {language === "vi" ? `Section ${section.order + 1}` : `Section ${section.order + 1}`}
                        </p>
                        <p className="mt-2 truncate font-sans text-[1.05rem] font-medium tracking-[-0.02em] text-[#1b1916]">
                          {sectionTitle}
                        </p>
                      </div>
                      <div className="rounded-full border border-[rgba(17,17,17,0.1)] bg-white/75 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6f6a63]">
                        {sectionLessons.length} {t.catalog.lessons}
                      </div>
                    </button>

                    {isExpanded && sectionLessons.length > 0 && (
                      <div className="space-y-2 p-3">
                        {sectionLessons.map((lesson, index) => (
                          <div
                            key={lesson.id}
                            className="flex items-center gap-4 rounded-[20px] border border-transparent px-4 py-4 transition-colors hover:border-[rgba(17,17,17,0.1)] hover:bg-white/60"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[rgba(17,17,17,0.08)] bg-white/80 text-[#6f6a63]">
                              {TYPE_ICONS[lesson.type]}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="rounded-full border border-[rgba(17,17,17,0.08)] bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7a7267]">
                                  {index + 1}
                                </span>
                                <p className="truncate font-sans text-[1rem] text-[#171512]">
                                  {lesson.title}
                                </p>
                              </div>
                              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[#6f6a63]">
                                <span className="rounded-full border border-[rgba(17,17,17,0.1)] px-2.5 py-1">
                                  {lesson.type}
                                </span>
                                {lesson.duration && lesson.type === "video" && (
                                  <span className="rounded-full border border-[rgba(17,17,17,0.1)] px-2.5 py-1">
                                    {formatDuration(lesson.duration)}
                                  </span>
                                )}
                              </div>
                            </div>
                            {lesson.isFree ? (
                              <span className="rounded-full border border-[rgba(17,17,17,0.1)] bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#171512]">
                                {t.detail.freePreview}
                              </span>
                            ) : (
                              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(17,17,17,0.08)] bg-white/80 text-[#6f6a63]">
                                <Lock size={14} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            </section>
          </div>

          <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
            <div className="overflow-hidden rounded-[30px] border border-[rgba(17,17,17,0.12)] bg-[#f3efe5]">
              <div className="border-b border-[rgba(17,17,17,0.1)] p-6">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#7a7267]">
                  LMS
                </p>
                <div className="mt-3 flex items-end justify-between gap-4">
                  <div>
                    <p className="font-sans text-[2.2rem] font-semibold tracking-[-0.05em] text-[#171512]">
                      {course.price === 0
                        ? t.catalog.free
                        : `${course.price.toLocaleString()} ${course.currency}`}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#5f584e]">
                      {language === "vi"
                        ? "Truy cập toàn bộ nội dung, tiến độ học và lesson assets."
                        : "Get full access to lessons, progress tracking, and course assets."}
                    </p>
                  </div>
                  <div className="rounded-[20px] border border-[rgba(17,17,17,0.1)] bg-white/65 px-4 py-3 text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#756d62]">
                      {t.catalog.students}
                    </p>
                    <p className="mt-1 font-sans text-xl font-semibold text-[#171512]">
                      {course.enrollmentCount}
                    </p>
                  </div>
                </div>
                <div className="mt-5">
                  <EnrollButton
                    course={course}
                  />
                  <div className="mt-3 flex items-center gap-2 text-sm text-[#5f584e]">
                    <ArrowUpRight size={16} />
                    <span>
                      {language === "vi"
                        ? "Mở ngay learning space với curriculum và tiến độ"
                        : "Open the learning space with curriculum and progress tracking"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-6 p-6">
                <div>
                  <h3 className="font-sans text-[1.35rem] font-semibold tracking-[-0.03em] text-[#171512]">
                    {t.detail.courseIncludes}
                  </h3>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-3 rounded-[20px] border border-[rgba(17,17,17,0.1)] bg-white/55 px-4 py-3">
                      <BookOpen size={18} className="text-[#171512]" />
                      <div>
                        <p className="text-sm font-medium text-[#171512]">{course.totalLessons} {t.catalog.lessons}</p>
                        <p className="text-[12px] text-[#6f6a63]">
                          {language === "vi" ? "Lesson đầy đủ theo curriculum" : "Complete lesson library"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-[20px] border border-[rgba(17,17,17,0.1)] bg-white/55 px-4 py-3">
                      <Clock size={18} className="text-[#171512]" />
                      <div>
                        <p className="text-sm font-medium text-[#171512]">{formatDuration(course.totalDuration)}</p>
                        <p className="text-[12px] text-[#6f6a63]">
                          {t.detail.totalDuration}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-[20px] border border-[rgba(17,17,17,0.1)] bg-white/55 px-4 py-3">
                      <Video size={18} className="text-[#171512]" />
                      <div>
                        <p className="text-sm font-medium text-[#171512]">{totalVideos} video</p>
                        <p className="text-[12px] text-[#6f6a63]">
                          {language === "vi" ? "Video bài giảng" : "Lecture content"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-[20px] border border-[rgba(17,17,17,0.1)] bg-white/55 px-4 py-3">
                      <FileQuestion size={18} className="text-[#171512]" />
                      <div>
                        <p className="text-sm font-medium text-[#171512]">{totalQuizzes} quiz</p>
                        <p className="text-[12px] text-[#6f6a63]">
                          {language === "vi" ? "Đánh giá và kiểm tra" : "Assessments and checkpoints"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-[rgba(17,17,17,0.1)] bg-white/55 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(17,17,17,0.1)] bg-[#f8f5ed]">
                      <GraduationCap size={20} className="text-[#171512]" />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-[#7a7267]">
                        {t.detail.instructor}
                      </p>
                      <p className="text-base font-semibold text-[#171512]">{course.instructorName}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-sans text-[1.35rem] font-semibold tracking-[-0.03em] text-[#171512]">
                    {language === "vi" ? "Điểm mạnh của khóa học" : "Why this course works"}
                  </h3>
                  <div className="mt-4 space-y-3">
                    {sidebarFeatures.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-full border border-[rgba(17,17,17,0.08)] bg-white text-[#171512]">
                          <CheckCircle size={14} />
                        </div>
                        <p className="text-sm leading-6 text-[#5f584e]">
                          {feature}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
