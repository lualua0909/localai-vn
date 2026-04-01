"use client";

import { useState } from "react";
import type { CourseSection } from "@/lib/course-data";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  FolderOpen,
} from "lucide-react";
import { LessonEditor, type LocalLesson } from "./LessonEditor";
import { FolderScanner, type ScannedLesson } from "./FolderScanner";

export interface SectionData {
  section: Omit<CourseSection, "id">;
  lessons: LocalLesson[];
}

function createDraftLessonId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `lesson-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

interface SectionEditorProps {
  sections: SectionData[];
  onChange: (sections: SectionData[]) => void;
  draftNamespace?: string;
  assetScope?: string;
}

export function SectionEditor({
  sections,
  onChange,
  draftNamespace = "new-course",
  assetScope,
}: SectionEditorProps) {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set([0])
  );
  const [showFolderScanner, setShowFolderScanner] = useState<number | null>(null);

  const toggleSection = (index: number) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const addSection = () => {
    const newIndex = sections.length;
    onChange([
      ...sections,
      {
        section: { title: "", title_vi: "", order: newIndex, lessonCount: 0 },
        lessons: [],
      },
    ]);
    setExpandedSections((prev) => new Set(prev).add(newIndex));
  };

  const updateSection = (index: number, data: Partial<Omit<CourseSection, "id">>) => {
    const updated = sections.map((s, i) =>
      i === index ? { ...s, section: { ...s.section, ...data } } : s
    );
    onChange(updated);
  };

  const removeSection = (index: number) => {
    onChange(sections.filter((_, i) => i !== index));
  };

  const moveSection = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= sections.length) return;
    const updated = [...sections];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    updated.forEach((s, i) => { s.section.order = i; });
    onChange(updated);
  };

  const addLesson = (sectionIndex: number) => {
    const updated = sections.map((s, i) => {
      if (i !== sectionIndex) return s;
      const newLesson: LocalLesson = {
        _draftId: createDraftLessonId(),
        sectionId: "",
        title: "",
        type: "video",
        videoSource: "upload",
        order: calcGlobalOrder(sections, sectionIndex, s.lessons.length),
        sectionOrder: s.lessons.length,
        isFree: false,
      };
      return {
        ...s,
        lessons: [...s.lessons, newLesson],
        section: { ...s.section, lessonCount: s.lessons.length + 1 },
      };
    });
    onChange(updated);
  };

  const updateLesson = (sectionIndex: number, lessonIndex: number, lesson: LocalLesson) => {
    const updated = sections.map((s, i) => {
      if (i !== sectionIndex) return s;
      const lessons = s.lessons.map((l, j) => (j === lessonIndex ? lesson : l));
      return { ...s, lessons };
    });
    onChange(updated);
  };

  const removeLesson = (sectionIndex: number, lessonIndex: number) => {
    const updated = sections.map((s, i) => {
      if (i !== sectionIndex) return s;
      const lessons = s.lessons.filter((_, j) => j !== lessonIndex);
      return { ...s, lessons, section: { ...s.section, lessonCount: lessons.length } };
    });
    onChange(updated);
  };

  const handleFolderImport = (sectionIndex: number, scanned: ScannedLesson[]) => {
    const updated = sections.map((s, i) => {
      if (i !== sectionIndex) return s;
      const startOrder = s.lessons.length;
      const newLessons: LocalLesson[] = scanned.map((sc, idx) => ({
        _draftId: createDraftLessonId(),
        sectionId: "",
        title: sc.name,
        type: sc.type,
        order: calcGlobalOrder(sections, sectionIndex, startOrder + idx),
        sectionOrder: startOrder + idx,
        isFree: false,
        ...(sc.type === "video" ? { videoSource: "upload" as const } : {}),
        // Store file reference directly on the lesson
        ...(sc.type === "video" || sc.type === "pdf" ? { _pendingFile: sc.file } : {}),
        ...(sc.type === "text" && sc.textContent ? { textContent: sc.textContent } : {}),
        ...(sc.type === "quiz" && sc.quizJson ? { quizData: JSON.parse(sc.quizJson) } : {}),
      }));
      return {
        ...s,
        lessons: [...s.lessons, ...newLessons],
        section: { ...s.section, lessonCount: s.lessons.length + newLessons.length },
      };
    });
    onChange(updated);
    setShowFolderScanner(null);
  };

  return (
    <div className="space-y-4">
      {sections.map((sectionData, sIndex) => (
        <div
          key={sIndex}
          className="rounded-2xl border border-[var(--color-border)] overflow-hidden"
        >
          {/* Section header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-[var(--color-bg-alt)]/50">
            <button
              type="button"
              onClick={() => toggleSection(sIndex)}
              className="text-[var(--color-text-secondary)]"
            >
              {expandedSections.has(sIndex) ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
            <span className="typo-caption font-semibold text-accent">
              Section {sIndex + 1}
            </span>
            <input
              type="text"
              value={sectionData.section.title}
              onChange={(e) => updateSection(sIndex, { title: e.target.value })}
              placeholder="Section title"
              className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1.5 typo-body outline-none"
            />
            <input
              type="text"
              value={sectionData.section.title_vi}
              onChange={(e) => updateSection(sIndex, { title_vi: e.target.value })}
              placeholder="Tiêu đề (VI)"
              className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1.5 typo-body outline-none"
            />
            <span className="typo-caption text-[var(--color-text-secondary)]">
              {sectionData.lessons.length} lessons
            </span>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => moveSection(sIndex, -1)}
                disabled={sIndex === 0}
                className="p-1 rounded hover:bg-[var(--color-bg-alt)] text-[var(--color-text-secondary)] disabled:opacity-30"
              >
                <ArrowUp size={12} />
              </button>
              <button
                type="button"
                onClick={() => moveSection(sIndex, 1)}
                disabled={sIndex === sections.length - 1}
                className="p-1 rounded hover:bg-[var(--color-bg-alt)] text-[var(--color-text-secondary)] disabled:opacity-30"
              >
                <ArrowDown size={12} />
              </button>
              <button
                type="button"
                onClick={() => removeSection(sIndex)}
                className="p-1 rounded hover:bg-red-500/10 text-red-500"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>

          {/* Section content */}
          {expandedSections.has(sIndex) && (
            <div className="p-4 space-y-3">
              {sectionData.lessons.map((lesson, lIndex) => (
                <LessonEditor
                  key={lIndex}
                  lesson={lesson}
                  index={lIndex}
                  draftKey={`${draftNamespace}:${lesson._draftId || `section-${sIndex}-lesson-${lIndex}`}`}
                  assetScope={assetScope || draftNamespace}
                  onChange={(updated) => updateLesson(sIndex, lIndex, updated)}
                  onRemove={() => removeLesson(sIndex, lIndex)}
                />
              ))}

              {showFolderScanner === sIndex && (
                <FolderScanner
                  onImport={(lessons) => handleFolderImport(sIndex, lessons)}
                />
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => addLesson(sIndex)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-accent hover:bg-accent/5 typo-caption font-medium transition-colors"
                >
                  <Plus size={14} />
                  Add Lesson
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setShowFolderScanner(showFolderScanner === sIndex ? null : sIndex)
                  }
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-purple-500 hover:bg-purple-500/5 typo-caption font-medium transition-colors"
                >
                  <FolderOpen size={14} />
                  Import from Folder
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addSection}
        className="w-full py-3 rounded-xl border-2 border-dashed border-[var(--color-border)] hover:border-accent/50 text-[var(--color-text-secondary)] hover:text-accent typo-body transition-colors flex items-center justify-center gap-2"
      >
        <Plus size={16} />
        Add Section
      </button>
    </div>
  );
}

function calcGlobalOrder(
  sections: SectionData[],
  sectionIndex: number,
  lessonIndex: number
): number {
  let order = 0;
  for (let i = 0; i < sectionIndex; i++) {
    order += sections[i].lessons.length;
  }
  return order + lessonIndex;
}
