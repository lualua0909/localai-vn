"use client";

import type { CourseSection, Lesson } from "@/lib/course-data";
import { useTranslations } from "@/lib/i18n";
import {
  Video,
  FileText,
  File,
  FileQuestion,
  CheckCircle,
  ChevronDown,
  ChevronRight,
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
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] overflow-hidden">
      {sections.map((section) => {
        const lessons = lessonsBySection[section.id] || [];
        const completedInSection = lessons.filter((l) =>
          completedLessons.includes(l.id)
        ).length;
        const isExpanded = expandedSections.has(section.id);

        return (
          <div key={section.id}>
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center gap-2 px-4 py-3 bg-[var(--color-bg-alt)]/50 border-b border-[var(--color-border)] hover:bg-[var(--color-bg-alt)] transition-colors text-left"
            >
              {isExpanded ? (
                <ChevronDown size={14} className="text-[var(--color-text-secondary)]" />
              ) : (
                <ChevronRight size={14} className="text-[var(--color-text-secondary)]" />
              )}
              <span className="flex-1 typo-caption font-semibold truncate">
                {section.title}
              </span>
              <span className="typo-caption text-[var(--color-text-secondary)]">
                {completedInSection}/{lessons.length}
              </span>
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
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        isActive
                          ? "bg-accent/10 text-accent border-l-2 border-accent"
                          : "hover:bg-[var(--color-bg-alt)]/50 border-l-2 border-transparent"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle
                          size={14}
                          className="text-green-500 shrink-0"
                        />
                      ) : isActive ? (
                        <Play size={14} className="text-accent shrink-0" />
                      ) : (
                        <span className="w-3.5 shrink-0">
                          {TYPE_ICONS[lesson.type]}
                        </span>
                      )}
                      <span
                        className={`flex-1 typo-caption truncate ${
                          isCompleted
                            ? "text-[var(--color-text-secondary)]"
                            : ""
                        }`}
                      >
                        {lesson.title}
                      </span>
                      {lesson.duration && lesson.type === "video" && (
                        <span className="typo-caption text-[var(--color-text-secondary)]">
                          {formatDuration(lesson.duration)}
                        </span>
                      )}
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
