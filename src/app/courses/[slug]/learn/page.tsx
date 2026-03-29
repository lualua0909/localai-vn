"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/lib/useAuth";
import { useTranslations } from "@/lib/i18n";
import { useCoursePlayer } from "@/hooks/useCoursePlayer";
import { useEnrollment } from "@/hooks/useEnrollment";
import { getCourseBySlug } from "@/lib/firestore-courses";
import type { Course } from "@/lib/course-data";
import { useState } from "react";
import { LessonPlayer } from "@/components/course/LessonPlayer";
import { CourseSidebar } from "@/components/course/CourseSidebar";
import { ProgressBar } from "@/components/course/ProgressBar";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Menu,
  X,
} from "lucide-react";

function CoursePlayerContent() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user } = useAuth();
  const t = useTranslations("courses");

  const [course, setCourse] = useState<Course | null>(null);
  const [courseLoading, setCourseLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    getCourseBySlug(slug).then((c) => {
      setCourse(c);
      setCourseLoading(false);
    });
  }, [slug]);

  const {
    sections,
    lessons,
    lessonsBySection,
    currentLesson,
    currentLessonId,
    nextLesson,
    prevLesson,
    loading: contentLoading,
    goToLesson,
    goNext,
    goPrev,
    initFromLastLesson,
  } = useCoursePlayer(course?.id);

  const {
    enrollment,
    isEnrolled,
    progress,
    markComplete,
    saveQuiz,
    updateLastAccess,
  } = useEnrollment(user?.uid, course?.id);

  // Initialize from last lesson when data is ready
  useEffect(() => {
    if (lessons.length > 0 && !currentLessonId) {
      initFromLastLesson(enrollment?.lastLessonId);
    }
  }, [lessons, enrollment, currentLessonId, initFromLastLesson]);

  // Update last access when lesson changes
  useEffect(() => {
    if (currentLessonId) {
      updateLastAccess(currentLessonId);
    }
  }, [currentLessonId, updateLastAccess]);

  // Redirect if not enrolled
  useEffect(() => {
    if (!courseLoading && !contentLoading && course && !isEnrolled && enrollment !== null) {
      router.push(`/courses/${slug}`);
    }
  }, [courseLoading, contentLoading, course, isEnrolled, enrollment, router, slug]);

  const isLessonCompleted = (lessonId: string) =>
    enrollment?.completedLessons?.includes(lessonId) ?? false;

  const handleMarkComplete = async () => {
    if (currentLessonId && !isLessonCompleted(currentLessonId)) {
      await markComplete(currentLessonId, lessons.length);
    }
  };

  const handleVideoEnded = async () => {
    if (currentLessonId && !isLessonCompleted(currentLessonId)) {
      await markComplete(currentLessonId, lessons.length);
    }
  };

  const handleQuizComplete = async (
    score: number,
    total: number,
    passed: boolean
  ) => {
    if (currentLessonId) {
      await saveQuiz(currentLessonId, { score, totalQuestions: total, passed });
      if (passed && !isLessonCompleted(currentLessonId)) {
        await markComplete(currentLessonId, lessons.length);
      }
    }
  };

  if (courseLoading || contentLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--color-bg)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--color-bg)]">
        <p className="typo-body text-[var(--color-text-secondary)]">
          Course not found
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur-xl">
        <div className="flex items-center gap-4 px-4 py-3">
          <button
            onClick={() => router.push(`/courses/${slug}`)}
            className="flex items-center gap-1.5 typo-caption text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
          >
            <ArrowLeft size={16} />
            {t.player.backToCourse}
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="typo-body font-semibold truncate">{course.title}</h1>
          </div>

          <div className="hidden md:flex items-center gap-3 w-48">
            <ProgressBar progress={progress} size="sm" />
          </div>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-[var(--color-bg-alt)] text-[var(--color-text-secondary)]"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
            {currentLesson ? (
              <>
                <div>
                  <h2 className="typo-h2 mb-2">{currentLesson.title}</h2>
                  <div className="flex items-center gap-2">
                    <span className="typo-caption px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                      {currentLesson.type.toUpperCase()}
                    </span>
                    {isLessonCompleted(currentLesson.id) && (
                      <span className="flex items-center gap-1 typo-caption text-green-600">
                        <CheckCircle size={14} />
                        {t.player.completed}
                      </span>
                    )}
                  </div>
                </div>

                <LessonPlayer
                  lesson={currentLesson}
                  onVideoEnded={handleVideoEnded}
                  onQuizComplete={handleQuizComplete}
                />

                {/* Navigation */}
                <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                  <div>
                    {prevLesson && (
                      <Button
                        variant="outline"
                        onClick={goPrev}
                        className="gap-2"
                      >
                        <ChevronLeft size={16} />
                        {t.player.prevLesson}
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {currentLesson.type !== "quiz" &&
                      !isLessonCompleted(currentLesson.id) && (
                        <Button
                          variant="outline"
                          onClick={handleMarkComplete}
                          className="gap-2"
                        >
                          <CheckCircle size={16} />
                          {t.player.markComplete}
                        </Button>
                      )}

                    {nextLesson && (
                      <Button
                        variant="primary"
                        onClick={goNext}
                        className="gap-2"
                      >
                        {t.player.nextLesson}
                        <ChevronRight size={16} />
                      </Button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <p className="typo-body text-[var(--color-text-secondary)]">
                  Select a lesson to start learning
                </p>
              </div>
            )}
          </div>
        </main>

        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "fixed inset-0 z-40 md:relative" : "hidden md:block"
          } md:w-80 md:shrink-0 md:border-l md:border-[var(--color-border)]`}
        >
          {sidebarOpen && (
            <div
              className="absolute inset-0 bg-black/50 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <div
            className={`${
              sidebarOpen
                ? "absolute right-0 top-0 bottom-0 w-80 bg-[var(--color-bg)] z-50"
                : ""
            } md:sticky md:top-14 md:h-[calc(100vh-3.5rem)] overflow-y-auto`}
          >
            <CourseSidebar
              sections={sections}
              lessonsBySection={lessonsBySection}
              currentLessonId={currentLessonId}
              completedLessons={enrollment?.completedLessons || []}
              onSelectLesson={(id) => {
                goToLesson(id);
                setSidebarOpen(false);
              }}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function CourseLearnPage() {
  return (
    <AuthGuard>
      <CoursePlayerContent />
    </AuthGuard>
  );
}
