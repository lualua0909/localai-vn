"use client";

import type { Lesson } from "@/lib/course-data";
import { VideoPlayer } from "./VideoPlayer";
import { TextRenderer } from "./TextRenderer";
import { PdfViewer } from "./PdfViewer";
import { QuizPlayer } from "./QuizPlayer";

interface LessonPlayerProps {
  lesson: Lesson;
  courseId?: string;
  onVideoEnded?: () => void;
  onQuizComplete?: (score: number, total: number, passed: boolean) => void;
}

export function LessonPlayer({
  lesson,
  courseId,
  onVideoEnded,
  onQuizComplete,
}: LessonPlayerProps) {
  switch (lesson.type) {
    case "video":
      return lesson.videoUrl ? (
        <VideoPlayer
          url={lesson.videoUrl}
          title={lesson.title}
          courseId={courseId}
          posterUrl={lesson.videoPosterUrl}
          captionUrl={lesson.captionUrl}
          captionLabel={lesson.captionLabel}
          captionLanguage={lesson.captionLanguage}
          onEnded={onVideoEnded}
        />
      ) : (
        <div className="aspect-video rounded-xl bg-[var(--color-bg-alt)] flex items-center justify-center">
          <p className="typo-body text-[var(--color-text-secondary)]">
            No video available
          </p>
        </div>
      );

    case "text":
      return lesson.textContent ? (
        <TextRenderer content={lesson.textContent} />
      ) : (
        <div className="p-6 rounded-xl bg-[var(--color-bg-alt)]">
          <p className="typo-body text-[var(--color-text-secondary)]">
            No content available
          </p>
        </div>
      );

    case "pdf":
      return lesson.pdfUrl ? (
        <PdfViewer url={lesson.pdfUrl} originalUrl={lesson.documentUrl} />
      ) : (
        <div className="p-6 rounded-xl bg-[var(--color-bg-alt)]">
          <p className="typo-body text-[var(--color-text-secondary)]">
            No document available
          </p>
        </div>
      );

    case "quiz":
      return lesson.quizData ? (
        <QuizPlayer
          quizData={lesson.quizData}
          onComplete={(score, total, passed) =>
            onQuizComplete?.(score, total, passed)
          }
        />
      ) : (
        <div className="p-6 rounded-xl bg-[var(--color-bg-alt)]">
          <p className="typo-body text-[var(--color-text-secondary)]">
            No quiz available
          </p>
        </div>
      );

    default:
      return null;
  }
}
