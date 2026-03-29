"use client";

import { useState } from "react";
import type { Lesson, LessonType, QuizData } from "@/lib/course-data";
import { Video, FileText, File, FileQuestion, Trash2 } from "lucide-react";
import { QuizEditor } from "./QuizEditor";
import { FileUploader } from "./FileUploader";
import { uploadCourseFile } from "@/lib/storage";

interface LessonEditorProps {
  lesson: Omit<Lesson, "id">;
  courseId?: string;
  onChange: (lesson: Omit<Lesson, "id">) => void;
  onRemove: () => void;
  index: number;
}

const TYPE_OPTIONS: { value: LessonType; label: string; icon: React.ReactNode }[] = [
  { value: "video", label: "Video", icon: <Video size={14} /> },
  { value: "text", label: "Text", icon: <FileText size={14} /> },
  { value: "pdf", label: "PDF", icon: <File size={14} /> },
  { value: "quiz", label: "Quiz", icon: <FileQuestion size={14} /> },
];

export function LessonEditor({
  lesson,
  courseId,
  onChange,
  onRemove,
  index,
}: LessonEditorProps) {
  const [expanded, setExpanded] = useState(false);

  const update = (data: Partial<Omit<Lesson, "id">>) => {
    onChange({ ...lesson, ...data });
  };

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] overflow-hidden">
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[var(--color-bg-alt)]/30"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="typo-caption text-[var(--color-text-secondary)] w-6 text-center">
          {index + 1}
        </span>
        {TYPE_OPTIONS.find((t) => t.value === lesson.type)?.icon}
        <span className="typo-body flex-1 truncate">
          {lesson.title || "Untitled lesson"}
        </span>
        <span className="typo-caption px-2 py-0.5 rounded-full bg-[var(--color-bg-alt)] text-[var(--color-text-secondary)]">
          {lesson.type}
        </span>
        <label className="flex items-center gap-1.5 typo-caption text-[var(--color-text-secondary)]" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={lesson.isFree}
            onChange={(e) => update({ isFree: e.target.checked })}
            className="accent-accent"
          />
          Free
        </label>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-1.5 rounded-full hover:bg-red-500/10 text-red-500"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-[var(--color-border)] space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block typo-caption font-semibold mb-1.5">
                Title
              </label>
              <input
                type="text"
                value={lesson.title}
                onChange={(e) => update({ title: e.target.value })}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2 typo-body outline-none"
                placeholder="Lesson title"
              />
            </div>
            <div>
              <label className="block typo-caption font-semibold mb-1.5">
                Type
              </label>
              <div className="flex gap-1">
                {TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => update({ type: opt.value })}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg typo-caption font-medium transition-colors ${
                      lesson.type === opt.value
                        ? "bg-accent/10 text-accent border border-accent/30"
                        : "bg-[var(--color-bg-alt)] text-[var(--color-text-secondary)] border border-transparent hover:border-[var(--color-border)]"
                    }`}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Type-specific content */}
          {lesson.type === "video" && (
            <div className="space-y-3">
              {courseId ? (
                <FileUploader
                  accept="video/*"
                  label="Video file"
                  currentUrl={lesson.videoUrl}
                  onUpload={async (file) => {
                    const tempId = Math.random().toString(36).substring(2, 9);
                    const url = await uploadCourseFile(courseId, tempId, file);
                    update({ videoUrl: url });
                    return url;
                  }}
                />
              ) : (
                <div>
                  <label className="block typo-caption font-semibold mb-1.5">
                    Video URL
                  </label>
                  <input
                    type="text"
                    value={lesson.videoUrl || ""}
                    onChange={(e) => update({ videoUrl: e.target.value })}
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2 typo-body outline-none"
                    placeholder="https://..."
                  />
                </div>
              )}
              <div>
                <label className="block typo-caption font-semibold mb-1.5">
                  Duration (seconds)
                </label>
                <input
                  type="number"
                  value={lesson.duration || 0}
                  onChange={(e) => update({ duration: Number(e.target.value) })}
                  className="w-32 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2 typo-body outline-none"
                />
              </div>
            </div>
          )}

          {lesson.type === "text" && (
            <div>
              <label className="block typo-caption font-semibold mb-1.5">
                Content (Markdown)
              </label>
              <textarea
                value={lesson.textContent || ""}
                onChange={(e) => update({ textContent: e.target.value })}
                className="w-full h-48 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3 typo-body outline-none resize-none font-mono text-sm"
                placeholder="# Title&#10;&#10;Content in markdown..."
              />
            </div>
          )}

          {lesson.type === "pdf" && (
            courseId ? (
              <FileUploader
                accept=".pdf"
                label="PDF file"
                currentUrl={lesson.pdfUrl}
                onUpload={async (file) => {
                  const tempId = Math.random().toString(36).substring(2, 9);
                  const url = await uploadCourseFile(courseId, tempId, file);
                  update({ pdfUrl: url });
                  return url;
                }}
              />
            ) : (
              <div>
                <label className="block typo-caption font-semibold mb-1.5">
                  PDF URL
                </label>
                <input
                  type="text"
                  value={lesson.pdfUrl || ""}
                  onChange={(e) => update({ pdfUrl: e.target.value })}
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2 typo-body outline-none"
                  placeholder="https://..."
                />
              </div>
            )
          )}

          {lesson.type === "quiz" && (
            <QuizEditor
              value={
                lesson.quizData || { questions: [], passingScore: 70 }
              }
              onChange={(quizData) => update({ quizData })}
            />
          )}
        </div>
      )}
    </div>
  );
}
