"use client";

import type { CourseSection, Lesson } from "@/lib/course-data";
import { useLanguage, useTranslations } from "@/lib/i18n";
import {
  Video,
  FileText,
  File,
  FileQuestion,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Circle,
  Play,
} from "lucide-react";
import { useState } from "react";

interface CourseSidebarProps {
  sections: CourseSection[];
  lessonsBySection: Record<string, Lesson[]>;
  currentLessonId: string | null;
  completedLessons: string[];
  onSelectLesson: (lessonId: string) => void;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  video: <Video size={14} />,
  text: <FileText size={14} />,
  pdf: <File size={14} />,
  quiz: <FileQuestion size={14} />,
};

function formatDuration(seconds?: number): string {
  if (!seconds) return "";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function CourseSidebar({
  sections,
  lessonsBySection,
  currentLessonId,
  completedLessons,
  onSelectLesson,
}: CourseSidebarProps) {
  const t = useTranslations("courses");
  const { language } = useLanguage();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections.map((s) => s.id))
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  return (
    <div className="overflow-hidden border border-[rgba(17,17,17,0.12)] bg-[#f7f3ea]">
      {sections.map((section) => {
        const lessons = lessonsBySection[section.id] || [];
        const completedInSection = lessons.filter((l) =>
          completedLessons.includes(l.id)
        ).length;
        const isExpanded = expandedSections.has(section.id);
        const sectionTitle =
          language === "vi" && section.title_vi ? section.title_vi : section.title;

        return (
          <div
            key={section.id}
            className="border-b border-[rgba(17,17,17,0.1)] last:border-b-0"
          >
            <button
              onClick={() => toggleSection(section.id)}
              className="flex w-full items-start gap-3 px-5 py-5 text-left transition-colors hover:bg-black/[0.02]"
            >
              {isExpanded ? (
                <ChevronDown size={14} className="mt-1 text-[#6f6a63]" />
              ) : (
                <ChevronRight size={14} className="mt-1 text-[#6f6a63]" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#7c7469]">
                  {t.detail.curriculum}
                </p>
                <p className="mt-3 text-[1.05rem] font-medium tracking-[-0.02em] text-[#1b1916]">
                  {sectionTitle}
                </p>
              </div>
              <div className="rounded-full border border-[rgba(17,17,17,0.1)] bg-white/70 px-2.5 py-1 text-[11px] font-medium text-[#6f6a63]">
                {completedInSection}/{lessons.length}
              </div>
            </button>

            {isExpanded && (
              <div>
                {lessons.map((lesson) => {
                  const isActive = lesson.id === currentLessonId;
                  const isCompleted = completedLessons.includes(lesson.id);

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => onSelectLesson(lesson.id)}
                      className={`flex w-full items-center gap-3 border-t border-[rgba(17,17,17,0.08)] px-5 py-3.5 text-left transition-colors ${
                        isActive
                          ? "bg-black/[0.035]"
                          : "bg-transparent hover:bg-black/[0.02]"
                      }`}
                    >
                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center ${
                          isCompleted
                            ? "text-[#1f1d19]"
                            : isActive
                              ? "text-[#1f1d19]"
                              : "text-[#65758b]"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle size={16} fill="currentColor" strokeWidth={1.8} />
                        ) : isActive ? (
                          <Play size={15} fill="currentColor" strokeWidth={1.8} />
                        ) : (
                          <Circle size={15} strokeWidth={1.8} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate font-sans text-[1rem] leading-6 ${
                            isActive
                              ? "text-[#111111]"
                              : isCompleted
                                ? "text-[#1f1d19]"
                                : "text-[#202020]"
                          }`}
                        >
                          {lesson.title}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-[#6f6a63]">
                          <span className="uppercase tracking-[0.12em]">
                            {lesson.type === "video"
                              ? "Video"
                              : TYPE_ICONS[lesson.type]
                                ? lesson.type
                                : lesson.type}
                          </span>
                          {lesson.duration && lesson.type === "video" && (
                            <span>{formatDuration(lesson.duration)}</span>
                          )}
                          {lesson.isFree && <span>{t.detail.freePreview}</span>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
