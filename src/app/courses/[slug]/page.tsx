"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { Course, CourseSection, Lesson } from "@/lib/course-data";
import {
  getCourseBySlug,
  getCourseSections,
  getCourseLessons,
} from "@/lib/firestore-courses";
import { useLanguage, useTranslations } from "@/lib/i18n";
import { CourseHero } from "@/components/course/CourseHero";
import { EnrollButton } from "@/components/course/EnrollButton";
import {
  Video,
  FileText,
  File,
  FileQuestion,
  ChevronDown,
  ChevronRight,
  Clock,
  BookOpen,
  Lock,
} from "lucide-react";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  video: <Video size={14} className="text-blue-500" />,
  text: <FileText size={14} className="text-green-500" />,
  pdf: <File size={14} className="text-red-500" />,
  quiz: <FileQuestion size={14} className="text-purple-500" />,
};

function formatDuration(seconds?: number): string {
  if (!seconds) return "";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function CourseDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { language } = useLanguage();
  const t = useTranslations("courses");

  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      const c = await getCourseBySlug(slug);
      if (c) {
        setCourse(c);
        const [secs, les] = await Promise.all([
          getCourseSections(c.id),
          getCourseLessons(c.id),
        ]);
        setSections(secs);
        setLessons(les);
        setExpandedSections(new Set(secs.map((s) => s.id)));
      }
      setLoading(false);
    }
    load();
  }, [slug]);

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

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
        <Footer />
      </>
    );
  }

  if (!course) {
    return (
      <>
        <Header />
        <div className="container-main section-padding text-center">
          <h1 className="typo-h1">Course not found</h1>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="container-main section-padding space-y-10">
        {/* Hero */}
        <CourseHero course={course} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Curriculum */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="typo-h2">{t.detail.curriculum}</h2>

            <div className="space-y-3">
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
                    className="rounded-2xl border border-[var(--color-border)] overflow-hidden"
                  >
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center gap-3 px-5 py-4 bg-[var(--color-bg-alt)]/50 hover:bg-[var(--color-bg-alt)] transition-colors text-left"
                    >
                      {isExpanded ? (
                        <ChevronDown size={16} className="text-[var(--color-text-secondary)]" />
                      ) : (
                        <ChevronRight size={16} className="text-[var(--color-text-secondary)]" />
                      )}
                      <span className="flex-1 typo-body font-semibold">
                        {sectionTitle}
                      </span>
                      <span className="typo-caption text-[var(--color-text-secondary)]">
                        {sectionLessons.length} {t.catalog.lessons}
                      </span>
                    </button>

                    {isExpanded && sectionLessons.length > 0 && (
                      <div className="divide-y divide-[var(--color-border)]">
                        {sectionLessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--color-bg-alt)]/30 transition-colors"
                          >
                            {TYPE_ICONS[lesson.type]}
                            <span className="flex-1 typo-body">
                              {lesson.title}
                            </span>
                            {lesson.isFree && (
                              <span className="typo-caption px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 border border-green-500/20">
                                {t.detail.freePreview}
                              </span>
                            )}
                            {!lesson.isFree && (
                              <Lock
                                size={12}
                                className="text-[var(--color-text-secondary)]"
                              />
                            )}
                            {lesson.duration && lesson.type === "video" && (
                              <span className="typo-caption text-[var(--color-text-secondary)]">
                                {formatDuration(lesson.duration)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="sticky top-20 space-y-4">
              <EnrollButton course={course} />

              <div className="rounded-2xl border border-[var(--color-border)] p-5 space-y-4">
                <h3 className="typo-body font-semibold">
                  {t.detail.courseIncludes}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <BookOpen size={16} className="text-accent" />
                    <span className="typo-body">
                      {course.totalLessons} {t.catalog.lessons}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-accent" />
                    <span className="typo-body">
                      {formatDuration(course.totalDuration)}{" "}
                      {t.detail.totalDuration.toLowerCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Video size={16} className="text-accent" />
                    <span className="typo-body">
                      {lessons.filter((l) => l.type === "video").length} videos
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileQuestion size={16} className="text-accent" />
                    <span className="typo-body">
                      {lessons.filter((l) => l.type === "quiz").length} quizzes
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
