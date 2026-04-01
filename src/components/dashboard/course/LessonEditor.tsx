"use client";

import { useState } from "react";
import {
  extractLessonName,
  type Lesson,
  type LessonType,
  type VideoSource,
} from "@/lib/course-data";
import {
  Video,
  FileText,
  File,
  FileQuestion,
  Trash2,
  Paperclip,
  X,
  Globe,
  Youtube,
  Upload,
} from "lucide-react";
import { QuizEditor } from "./QuizEditor";
import { MarkdownEditor } from "./MarkdownEditor";
import {
  getYoutubeEmbedUrl,
  inferVideoSourceFromUrl,
  validateVideoSourceInput,
} from "@/lib/lesson-assets";

// Lesson type used only in local CMS state — _pendingFile is NOT written to Firestore
export type LocalLesson = Omit<Lesson, "id"> & {
  _pendingFile?: File;
  _pendingCaptionFile?: File;
  _pendingPosterFile?: File;
  _draftId?: string;
};

interface LessonEditorProps {
  lesson: LocalLesson;
  index: number;
  onChange: (lesson: LocalLesson) => void;
  onRemove: () => void;
  draftKey?: string;
  assetScope?: string;
}

const TYPE_OPTIONS: { value: LessonType; label: string; icon: React.ReactNode }[] = [
  { value: "video", label: "Video", icon: <Video size={14} /> },
  { value: "text", label: "Text", icon: <FileText size={14} /> },
  { value: "pdf", label: "PDF", icon: <File size={14} /> },
  { value: "quiz", label: "Quiz", icon: <FileQuestion size={14} /> },
];

function getLessonTitleFromPath(path?: string): string {
  if (!path) return "";

  const normalizedPath = path.split("?")[0];
  const filename = normalizedPath.split("/").pop() || "";
  const withoutTimestamp = filename.replace(/_[0-9]+(?=\.[^.]+$)/, "");
  return extractLessonName(withoutTimestamp);
}

function FilePicker({
  accept,
  label,
  pendingFile,
  existingPath,
  onSelect,
  onClear,
}: {
  accept: string;
  label: string;
  pendingFile?: File;
  existingPath?: string;
  onSelect: (file: File) => void;
  onClear: () => void;
}) {
  if (pendingFile) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl border border-accent/20 bg-accent/5">
        <Paperclip size={14} className="text-accent shrink-0" />
        <span className="typo-caption text-accent truncate flex-1">{pendingFile.name}</span>
        <button type="button" onClick={onClear} className="text-[var(--color-text-secondary)] hover:text-red-500">
          <X size={14} />
        </button>
      </div>
    );
  }

  if (existingPath && !existingPath.startsWith("http")) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl border border-green-500/20 bg-green-500/5">
        <Paperclip size={14} className="text-green-600 shrink-0" />
        <span className="typo-caption text-green-600 truncate flex-1">{existingPath}</span>
        <label className="typo-caption text-accent cursor-pointer hover:underline">
          Đổi file
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onSelect(f); }}
          />
        </label>
      </div>
    );
  }

  return (
    <label className="flex items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-[var(--color-border)] hover:border-accent/50 cursor-pointer transition-colors">
      <Video size={18} className="text-[var(--color-text-secondary)]" />
      <span className="typo-body text-[var(--color-text-secondary)]">
        {label} — click để chọn file
      </span>
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onSelect(f); }}
      />
    </label>
  );
}

export function LessonEditor({
  lesson,
  onChange,
  onRemove,
  index,
  draftKey,
  assetScope,
}: LessonEditorProps) {
  const [expanded, setExpanded] = useState(false);

  const update = (data: Partial<LocalLesson>) => onChange({ ...lesson, ...data });
  const videoSource = lesson.videoSource || inferVideoSourceFromUrl(lesson.videoUrl);
  const youtubeEmbedUrl = getYoutubeEmbedUrl(lesson.videoUrl);
  const videoValidationMessage = validateVideoSourceInput(
    videoSource,
    lesson.videoUrl
  );
  const displayTitle =
    lesson.title ||
    (lesson._pendingFile ? extractLessonName(lesson._pendingFile.name) : "") ||
    getLessonTitleFromPath(lesson.documentUrl || lesson.pdfUrl || lesson.videoUrl) ||
    "Lesson chưa có tiêu đề";

  const handleTypeChange = (type: LessonType) => {
    if (type === "video") {
      update({
        type,
        videoSource: "upload",
        videoUrl: undefined,
        captionUrl: undefined,
        captionLabel: undefined,
        captionLanguage: undefined,
        videoPosterUrl: undefined,
        pdfUrl: undefined,
        textContent: undefined,
        quizData: undefined,
        _pendingFile: undefined,
        _pendingCaptionFile: undefined,
        _pendingPosterFile: undefined,
      });
      return;
    }

    update({
      type,
      videoSource: undefined,
      videoUrl: undefined,
      captionUrl: undefined,
      captionLabel: undefined,
      captionLanguage: undefined,
      videoPosterUrl: undefined,
      pdfUrl: undefined,
      textContent: type === "text" ? lesson.textContent || "" : undefined,
      quizData: type === "quiz" ? lesson.quizData : undefined,
      _pendingFile: undefined,
      _pendingCaptionFile: undefined,
      _pendingPosterFile: undefined,
    });
  };

  const setVideoSource = (nextSource: VideoSource) => {
    update({
      videoSource: nextSource,
      _pendingFile: nextSource === "upload" ? lesson._pendingFile : undefined,
      _pendingCaptionFile:
        nextSource === "youtube" ? undefined : lesson._pendingCaptionFile,
      videoUrl: nextSource === "upload" ? undefined : lesson.videoUrl,
      ...(nextSource === "youtube"
        ? {
            captionUrl: undefined,
            captionLabel: undefined,
            captionLanguage: undefined,
          }
        : {}),
    });
  };

  const setUploadedFile = (file: File, field: "videoUrl" | "pdfUrl") => {
    update({
      _pendingFile: file,
      ...(field === "videoUrl" ? { videoSource: "upload" as const } : {}),
      [field]: undefined,
      ...(lesson.title.trim() ? {} : { title: extractLessonName(file.name) }),
    });
  };

  const hasCaptionTrack = Boolean(
    lesson._pendingCaptionFile || lesson.captionUrl?.trim()
  );

  const setCaptionFile = (file: File) => {
    update({
      _pendingCaptionFile: file,
      captionUrl: undefined,
      ...(lesson.captionLabel?.trim() ? {} : { captionLabel: "CC" }),
      ...(lesson.captionLanguage?.trim()
        ? {}
        : { captionLanguage: "vi" }),
    });
  };

  const setPosterFile = (file: File) => {
    update({
      _pendingPosterFile: file,
      videoPosterUrl: undefined,
    });
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
          {displayTitle}
        </span>
        {lesson._pendingFile && (
          <span className="typo-caption px-2 py-0.5 rounded-full bg-accent/10 text-accent">
            file đã chọn
          </span>
        )}
        <span className="typo-caption px-2 py-0.5 rounded-full bg-[var(--color-bg-alt)] text-[var(--color-text-secondary)]">
          {lesson.type}
        </span>
        <label
          className="flex items-center gap-1.5 typo-caption text-[var(--color-text-secondary)]"
          onClick={(e) => e.stopPropagation()}
        >
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
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="p-1.5 rounded-full hover:bg-red-500/10 text-red-500"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-[var(--color-border)] space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block typo-caption font-semibold mb-1.5">Title</label>
              <input
                type="text"
                value={lesson.title}
                onChange={(e) => update({ title: e.target.value })}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2 typo-body outline-none"
                placeholder="Lesson title"
              />
            </div>
            <div>
              <label className="block typo-caption font-semibold mb-1.5">Type</label>
              <div className="flex gap-1 flex-wrap">
                {TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleTypeChange(opt.value)}
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

          {lesson.type === "video" && (
            <div className="space-y-3">
              <div>
                <label className="block typo-caption font-semibold mb-1.5">
                  Video source
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "upload" as VideoSource, label: "Upload", icon: <Upload size={14} /> },
                    { value: "youtube" as VideoSource, label: "YouTube", icon: <Youtube size={14} /> },
                    { value: "external" as VideoSource, label: "Video URL", icon: <Globe size={14} /> },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setVideoSource(option.value)}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                        videoSource === option.value
                          ? "border-accent/30 bg-accent/10 text-accent"
                          : "border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                      }`}
                    >
                      {option.icon}
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {videoSource === "upload" && (
                <div className="space-y-3">
                  <label className="block typo-caption font-semibold">Video file</label>
                  <FilePicker
                    accept="video/*"
                    label="Video"
                    pendingFile={lesson._pendingFile}
                    existingPath={lesson.videoUrl}
                    onSelect={(file) => setUploadedFile(file, "videoUrl")}
                    onClear={() => update({ _pendingFile: undefined })}
                  />
                </div>
              )}

              {videoSource === "youtube" && (
                <div className="space-y-3">
                  <div>
                    <label className="block typo-caption font-semibold mb-1.5">
                      YouTube URL
                    </label>
                    <input
                      type="url"
                      value={lesson.videoUrl || ""}
                      onChange={(event) =>
                        update({
                          videoSource: "youtube",
                          videoUrl: event.target.value,
                          _pendingFile: undefined,
                        })
                      }
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2.5 typo-body outline-none"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                  {youtubeEmbedUrl && (
                    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-black">
                      <iframe
                        src={youtubeEmbedUrl}
                        title="YouTube preview"
                        className="aspect-video w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  )}
                  {lesson.videoUrl?.trim() && videoValidationMessage && (
                    <p className="typo-caption text-red-500">{videoValidationMessage}</p>
                  )}
                </div>
              )}

              {videoSource === "external" && (
                <div className="space-y-3">
                  <div>
                    <label className="block typo-caption font-semibold mb-1.5">
                      Video URL
                    </label>
                    <input
                      type="url"
                      value={lesson.videoUrl || ""}
                      onChange={(event) =>
                        update({
                          videoSource: "external",
                          videoUrl: event.target.value,
                          _pendingFile: undefined,
                        })
                      }
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2.5 typo-body outline-none"
                      placeholder="https://cdn.example.com/video.mp4"
                    />
                  </div>
                  <p className="typo-caption text-[var(--color-text-secondary)]">
                    Hỗ trợ video URL trực tiếp và cả HLS `.m3u8`; quality menu sẽ hiện khi nguồn có adaptive bitrate.
                  </p>
                  {lesson.videoUrl?.trim() && videoValidationMessage && (
                    <p className="typo-caption text-red-500">{videoValidationMessage}</p>
                  )}
                </div>
              )}

              {videoSource !== "youtube" && (
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-alt)]/30 p-4">
                    <div className="space-y-1">
                      <label className="block typo-caption font-semibold">
                        Poster / thumbnail
                      </label>
                      <p className="typo-caption text-[var(--color-text-secondary)]">
                        Ảnh preview sẽ hiện trước khi phát video để trang học nhìn production hơn.
                      </p>
                    </div>

                    <FilePicker
                      accept="image/*"
                      label="Poster image"
                      pendingFile={lesson._pendingPosterFile}
                      existingPath={lesson.videoPosterUrl}
                      onSelect={setPosterFile}
                      onClear={() =>
                        update({
                          _pendingPosterFile: undefined,
                          videoPosterUrl: undefined,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-alt)]/30 p-4">
                    <div className="space-y-1">
                      <label className="block typo-caption font-semibold">
                        Subtitle / CC
                      </label>
                      <p className="typo-caption text-[var(--color-text-secondary)]">
                        Upload `.vtt` hoặc `.srt` để frontend hiện nút CC và transcript panel.
                      </p>
                    </div>

                    <FilePicker
                      accept=".vtt,.srt"
                      label="Subtitle / CC (.vtt, .srt)"
                      pendingFile={lesson._pendingCaptionFile}
                      existingPath={lesson.captionUrl}
                      onSelect={setCaptionFile}
                      onClear={() =>
                        update({
                          _pendingCaptionFile: undefined,
                          captionUrl: undefined,
                          captionLabel: undefined,
                          captionLanguage: undefined,
                        })
                      }
                    />

                    {hasCaptionTrack && (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block typo-caption font-semibold">
                            Caption label
                          </label>
                          <input
                            type="text"
                            value={lesson.captionLabel || ""}
                            onChange={(event) =>
                              update({ captionLabel: event.target.value })
                            }
                            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2.5 typo-body outline-none"
                            placeholder="Vietnamese CC"
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block typo-caption font-semibold">
                            Language code
                          </label>
                          <input
                            type="text"
                            value={lesson.captionLanguage || ""}
                            onChange={(event) =>
                              update({ captionLanguage: event.target.value })
                            }
                            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2.5 typo-body outline-none"
                            placeholder="vi"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {videoSource === "youtube" && (
                <p className="typo-caption rounded-2xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-amber-700">
                  Lesson YouTube dùng playback speed và captions native của YouTube player.
                </p>
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
              <MarkdownEditor
                value={lesson.textContent || ""}
                onChange={(textContent) => update({ textContent })}
                placeholder="# Lesson title\n\nWrite the lesson content here..."
                storageKey={draftKey}
                assetScope={assetScope}
              />
            </div>
          )}

          {lesson.type === "pdf" && (
            <div>
              <label className="block typo-caption font-semibold">Document file</label>
              <FilePicker
                accept=".pdf,.doc,.docx"
                label="PDF / DOC / DOCX"
                pendingFile={lesson._pendingFile}
                existingPath={lesson.pdfUrl}
                onSelect={(file) => setUploadedFile(file, "pdfUrl")}
                onClear={() => update({ _pendingFile: undefined })}
              />
            </div>
          )}

          {lesson.type === "quiz" && (
            <QuizEditor
              value={lesson.quizData || { questions: [], passingScore: 70 }}
              onChange={(quizData) => update({ quizData })}
            />
          )}
        </div>
      )}
    </div>
  );
}
