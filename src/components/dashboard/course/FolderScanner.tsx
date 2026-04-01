"use client";

import { useState, useRef } from "react";
import {
  FolderOpen,
  Video,
  FileText,
  FileQuestion,
  File,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
} from "lucide-react";
import type { LessonType } from "@/lib/course-data";
import { detectLessonType, extractLessonName } from "@/lib/course-data";
import { Button } from "@/components/ui/Button";

export interface ScannedLesson {
  file: File;
  name: string;
  type: LessonType;
  size: number;
  textContent?: string;
  quizJson?: string;
}

interface FolderScannerProps {
  onImport: (lessons: ScannedLesson[]) => void;
  disabled?: boolean;
}

const TYPE_ICONS: Record<LessonType, React.ReactNode> = {
  video: <Video size={16} className="text-blue-500" />,
  text: <FileText size={16} className="text-green-500" />,
  pdf: <File size={16} className="text-red-500" />,
  quiz: <FileQuestion size={16} className="text-purple-500" />,
};

const TYPE_LABELS: Record<LessonType, string> = {
  video: "Video",
  text: "Text",
  pdf: "PDF",
  quiz: "Quiz",
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FolderScanner({ onImport, disabled }: FolderScannerProps) {
  const [scannedLessons, setScannedLessons] = useState<ScannedLesson[]>([]);
  const [scanning, setScanning] = useState(false);
  const [skippedFiles, setSkippedFiles] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setScanning(true);
    setSkippedFiles([]);
    const lessons: ScannedLesson[] = [];
    const skipped: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Skip hidden files and directories
      if (file.name.startsWith(".")) continue;

      const type = detectLessonType(file.name);
      if (!type) {
        skipped.push(file.name);
        continue;
      }

      const lesson: ScannedLesson = {
        file,
        name: extractLessonName(file.name),
        type,
        size: file.size,
      };

      // Read text content for text files
      if (type === "text") {
        try {
          lesson.textContent = await readFileAsText(file);
        } catch {
          // ignore read errors
        }
      }

      // Parse and validate quiz JSON
      if (type === "quiz") {
        try {
          const content = await readFileAsText(file);
          JSON.parse(content); // validate JSON
          lesson.quizJson = content;
        } catch {
          skipped.push(`${file.name} (invalid JSON)`);
          continue;
        }
      }

      lessons.push(lesson);
    }

    // Sort by name naturally
    lessons.sort((a, b) => a.name.localeCompare(b.name, "vi", { numeric: true }));

    setScannedLessons(lessons);
    setSkippedFiles(skipped);
    setScanning(false);
  };

  const updateLessonName = (index: number, name: string) => {
    const updated = [...scannedLessons];
    updated[index] = { ...updated[index], name };
    setScannedLessons(updated);
  };

  const removeLesson = (index: number) => {
    setScannedLessons((prev) => prev.filter((_, i) => i !== index));
  };

  const moveLesson = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= scannedLessons.length) return;
    const updated = [...scannedLessons];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setScannedLessons(updated);
  };

  const handleImport = () => {
    if (scannedLessons.length === 0) return;
    onImport(scannedLessons);
    setScannedLessons([]);
    setSkippedFiles([]);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || scanning}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-[var(--color-border)] hover:border-accent/50 text-[var(--color-text-secondary)] hover:text-accent typo-body transition-colors disabled:opacity-50"
        >
          <FolderOpen size={18} />
          {scanning ? "Scanning..." : "Select Folder"}
        </button>
        <span className="typo-caption text-[var(--color-text-secondary)]">
          Supports: .mp4, .webm, .mov, .avi, .pdf, .doc, .docx, .txt, .md, .json
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        // @ts-expect-error webkitdirectory is not in HTMLInputElement type
        webkitdirectory=""
        multiple
        className="hidden"
        onChange={handleFolderSelect}
      />

      {skippedFiles.length > 0 && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
          <p className="typo-caption font-semibold text-amber-600 mb-1">
            Skipped {skippedFiles.length} unsupported files:
          </p>
          <p className="typo-caption text-amber-600/80">
            {skippedFiles.join(", ")}
          </p>
        </div>
      )}

      {scannedLessons.length > 0 && (
        <>
          <div className="rounded-2xl border border-[var(--color-border)] overflow-hidden">
            <div className="px-4 py-3 bg-[var(--color-bg-alt)]/50 border-b border-[var(--color-border)]">
              <span className="typo-caption font-semibold">
                {scannedLessons.length} lessons detected
              </span>
            </div>
            <div className="divide-y divide-[var(--color-border)]">
              {scannedLessons.map((lesson, index) => (
                <div
                  key={index}
                  className="px-4 py-3 flex items-center gap-3 hover:bg-[var(--color-bg-alt)]/30"
                >
                  <span className="typo-caption text-[var(--color-text-secondary)] w-6 text-center">
                    {index + 1}
                  </span>
                  {TYPE_ICONS[lesson.type]}
                  <input
                    type="text"
                    value={lesson.name}
                    onChange={(e) => updateLessonName(index, e.target.value)}
                    className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1.5 typo-caption outline-none"
                  />
                  <span className="typo-caption text-[var(--color-text-secondary)] px-2 py-0.5 rounded-full bg-[var(--color-bg-alt)]">
                    {TYPE_LABELS[lesson.type]}
                  </span>
                  <span className="typo-caption text-[var(--color-text-secondary)] w-16 text-right">
                    {formatSize(lesson.size)}
                  </span>
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => moveLesson(index, -1)}
                      disabled={index === 0}
                      className="p-1 rounded hover:bg-[var(--color-bg-alt)] text-[var(--color-text-secondary)] disabled:opacity-30"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveLesson(index, 1)}
                      disabled={index === scannedLessons.length - 1}
                      className="p-1 rounded hover:bg-[var(--color-bg-alt)] text-[var(--color-text-secondary)] disabled:opacity-30"
                    >
                      <ArrowDown size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeLesson(index)}
                      className="p-1 rounded hover:bg-red-500/10 text-red-500"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={handleImport}
              className="gap-2"
            >
              <Upload size={16} />
              Import {scannedLessons.length} Lessons
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
