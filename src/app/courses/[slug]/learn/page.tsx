"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/lib/useAuth";
import { useLanguage, useTranslations } from "@/lib/i18n";
import { useCoursePlayer } from "@/hooks/useCoursePlayer";
import { useEnrollment } from "@/hooks/useEnrollment";
import { getCourseBySlug } from "@/lib/firestore-courses";
import type { Course, LessonType } from "@/lib/course-data";
import { LessonPlayer } from "@/components/course/LessonPlayer";
import { CourseSidebar } from "@/components/course/CourseSidebar";
import { ProgressBar } from "@/components/course/ProgressBar";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Menu,
  PlayCircle,
  X,
} from "lucide-react";

function formatDuration(seconds?: number): string {
  if (!seconds) return "";
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${mins > 0 ? `${mins}m` : ""}`;
  return `${Math.floor(seconds / 60)}m`;
}

function getLessonTypeLabel(language: string, type: LessonType): string {
  const labels = {
    vi: {
      video: "Video",
      text: "Bài đọc",
      pdf: "Tài liệu",
      quiz: "Quiz",
    },
    en: {
      video: "Video",
      text: "Reading",
      pdf: "Document",
      quiz: "Quiz",
    },
  };

  return labels[language as "vi" | "en"]?.[type] || type;
}

function CoursePlayerContent() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user, loading: authLoading } = useAuth();
  const { language } = useLanguage();
  const t = useTranslations("courses");

  const [course, setCourse] = useState<Course | null>(null);
  const [courseLoading, setCourseLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    getCourseBySlug(slug).then((courseData) => {
      setCourse(courseData);
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
    loading: enrollmentLoading,
  } = useEnrollment(user?.uid, course?.id);

  useEffect(() => {
    if (lessons.length > 0 && !currentLessonId) {
      initFromLastLesson(enrollment?.lastLessonId);
    }
  }, [lessons, enrollment, currentLessonId, initFromLastLesson]);

  useEffect(() => {
    if (currentLessonId) {
      updateLastAccess(currentLessonId);
    }
  }, [currentLessonId, updateLastAccess]);

  useEffect(() => {
    if (
      !authLoading &&
      !courseLoading &&
      !contentLoading &&
      !enrollmentLoading &&
      course &&
      !isEnrolled
    ) {
      router.push(`/courses/${slug}`);
    }
  }, [
    authLoading,
    courseLoading,
    contentLoading,
    enrollmentLoading,
    course,
    isEnrolled,
    router,
    slug,
  ]);

  const completedLessons = enrollment?.completedLessons || [];
  const completedCount = completedLessons.length;
  const currentIndex = currentLessonId
    ? lessons.findIndex((lesson) => lesson.id === currentLessonId)
    : -1;
  const currentSection = useMemo(
    () =>
      sections.find((section) => section.id === currentLesson?.sectionId) ??
      null,
    [sections, currentLesson],
  );
  const currentSectionLessons = currentSection
    ? lessonsBySection[currentSection.id] || []
    : [];
  const completedInSection = currentSectionLessons.filter((lesson) =>
    completedLessons.includes(lesson.id),
  ).length;

  const courseTitle =
    language === "vi" && course?.title_vi
      ? course.title_vi
      : course?.title || "";
  const sectionTitle =
    language === "vi" && currentSection?.title_vi
      ? currentSection.title_vi
      : currentSection?.title || "";
  const lessonTypeLabel = currentLesson
    ? getLessonTypeLabel(language, currentLesson.type)
    : "";

  const lessonSupportCopy = currentLesson
    ? {
        title:
          language === "vi" ? "Trong bài học này" : "What this lesson covers",
        items:
          currentLesson.type === "video"
            ? language === "vi"
              ? [
                  "Xem trọn video để hệ thống ghi nhận tiến độ chính xác.",
                  "Dùng điều hướng để quay lại bài trước hoặc chuyển sang bài kế tiếp nhanh hơn.",
                  "Hoàn thành bài để khóa học gợi ý đúng lesson tiếp theo.",
                ]
              : [
                  "Finish the video to keep your progress tracking accurate.",
                  "Use the learning navigation to move between lessons faster.",
                  "Complete the lesson so the course can suggest the right next step.",
                ]
            : currentLesson.type === "pdf"
              ? language === "vi"
                ? [
                    "Tài liệu được mở trực tiếp trong LMS để học liên tục không bị ngắt mạch.",
                    "Bạn có thể mở file sang tab mới nếu muốn xem ở kích thước lớn hơn.",
                    "Đánh dấu hoàn thành sau khi đọc xong để giữ tiến độ chuẩn.",
                  ]
                : [
                    "Documents open directly inside the LMS for uninterrupted study.",
                    "Open the file in a new tab whenever you need a larger reading view.",
                    "Mark the lesson complete after finishing the document to keep progress aligned.",
                  ]
              : currentLesson.type === "quiz"
                ? language === "vi"
                  ? [
                      "Trả lời đầy đủ từng câu để mở nút nộp bài.",
                      "Điểm đạt sẽ tự ghi nhận tiến độ và đánh dấu hoàn thành.",
                      "Có thể làm lại để củng cố kiến thức trước khi sang lesson tiếp theo.",
                    ]
                  : [
                      "Answer every question to unlock submission.",
                      "Passing scores automatically update your completion progress.",
                      "Retry anytime to reinforce understanding before moving on.",
                    ]
                : language === "vi"
                  ? [
                      "Bài đọc được tối ưu để học nhanh ngay trong trang lesson.",
                      "Hãy hoàn thành lesson sau khi đọc xong để giữ mạch học tập.",
                      "Kết hợp với curriculum bên phải để quay lại đúng section khi cần.",
                    ]
                  : [
                      "Reading lessons are optimized for focused study inside the page.",
                      "Mark the lesson complete after finishing to keep momentum.",
                      "Use the curriculum on the right to jump back to the right section anytime.",
                    ],
      }
    : null;

  const progressLabel =
    language === "vi"
      ? `${completedCount}/${lessons.length} bài học đã xong`
      : `${completedCount}/${lessons.length} lessons completed`;

  const isLessonCompleted = (lessonId: string) =>
    completedLessons.includes(lessonId);

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
    passed: boolean,
  ) => {
    if (currentLessonId) {
      await saveQuiz(currentLessonId, { score, totalQuestions: total, passed });
      if (passed && !isLessonCompleted(currentLessonId)) {
        await markComplete(currentLessonId, lessons.length);
      }
    }
  };

  if (authLoading || courseLoading || contentLoading || enrollmentLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
        <p className="typo-body text-[var(--color-text-secondary)]">
          {language === "vi" ? "Không tìm thấy khóa học" : "Course not found"}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f0e8] text-[#171512]">
      <header className="sticky top-0 z-30 border-b border-[rgba(17,17,17,0.1)] bg-[#f3f0e8]/95 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/courses/${slug}`)}
              className="hidden items-center gap-2 rounded-full border border-[rgba(17,17,17,0.12)] bg-white/70 px-3 py-2 text-sm font-medium text-[#5d5850] transition-colors hover:text-[#171512] lg:inline-flex"
            >
              <ArrowLeft size={16} />
              <span>{t.player.backToCourse}</span>
            </button>

            <button
              onClick={() => router.push(`/courses/${slug}`)}
              className="text-[1.9rem] uppercase tracking-[-0.04em] text-[#171512]"
            >
              {courseTitle}
            </button>
          </div>

          <div className="hidden items-center gap-8 text-[15px] text-[#2b2925] lg:flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(17,17,17,0.35)] bg-white/60 text-sm font-medium">
              {user?.email?.[0]?.toUpperCase() || "A"}
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[rgba(17,17,17,0.12)] bg-white/75 text-[#171512] transition-colors hover:bg-white xl:hidden"
            aria-label={language === "vi" ? "Mở giáo trình" : "Open curriculum"}
          >
            <Menu size={18} />
          </button>
        </div>
      </header>

      <div className="px-3 pb-3 pt-0 sm:px-4 sm:pb-4 lg:px-6 lg:pb-6">
        <div className="min-h-[calc(100vh-88px)] overflow-hidden rounded-[0_0_28px_28px] border border-t-0 border-[rgba(17,17,17,0.12)] bg-[#f8f5ed] shadow-[0_18px_60px_rgba(58,45,23,0.08)]">
          <div className="grid min-h-[calc(100vh-88px)] xl:grid-cols-[420px_minmax(0,1fr)]">
            <aside className="hidden border-r border-[rgba(17,17,17,0.1)] bg-[#f3efe5] xl:flex xl:min-h-full xl:flex-col">
              <div className="flex-1 overflow-y-auto">
                <div className="px-5 py-7">
                  <div className="space-y-2">
                    <h1 className="font-sans text-[2.1rem] font-semibold leading-none tracking-[-0.04em] text-[#171512]">
                      {courseTitle}
                    </h1>
                    <p className="text-[15px] text-[#6c655c] underline underline-offset-4">
                      {language === "vi"
                        ? "Tổng quan khóa học"
                        : "Course Overview"}
                    </p>
                  </div>
                </div>

                <CourseSidebar
                  sections={sections}
                  lessonsBySection={lessonsBySection}
                  currentLessonId={currentLessonId}
                  completedLessons={completedLessons}
                  onSelectLesson={goToLesson}
                />
              </div>

              <div className="border-t border-[rgba(17,17,17,0.1)] bg-white/55 px-5 py-4">
                <div className="mb-3 flex items-center justify-between text-sm text-[#5f584e]">
                  <span>{t.player.progress}</span>
                  <span className="font-semibold text-[#171512]">
                    {progress}%
                  </span>
                </div>
                <ProgressBar progress={progress} size="md" />
                <div className="mt-4 flex items-center justify-between gap-3">
                  <Button
                    variant="ghost"
                    onClick={goPrev}
                    className="justify-start rounded-xl px-0 py-0 text-[#5f584e] hover:bg-transparent hover:text-[#171512]"
                  >
                    <ChevronLeft size={16} />
                    {prevLesson
                      ? t.player.prevLesson
                      : language === "vi"
                        ? "Bài đầu tiên"
                        : "First lesson"}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={goNext}
                    className="rounded-xl bg-[#2b2722] px-5 py-2.5 text-white hover:opacity-95"
                  >
                    {nextLesson
                      ? t.player.nextLesson
                      : language === "vi"
                        ? "Hoàn tất"
                        : "Finish"}
                  </Button>
                </div>
              </div>
            </aside>

            <main className="flex min-w-0 flex-col bg-[#fbf9f3]">
              {currentLesson ? (
                <>
                  <div className="px-5 pt-6 sm:px-8 lg:px-10">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="mb-4 flex flex-wrap items-center gap-2 text-[12px] uppercase tracking-[0.14em] text-[#756d62]">
                          <span>
                            {language === "vi"
                              ? `Bài ${currentIndex + 1}/${lessons.length}`
                              : `Lesson ${currentIndex + 1}/${lessons.length}`}
                          </span>
                          {sectionTitle ? <span>•</span> : null}
                          {sectionTitle ? <span>{sectionTitle}</span> : null}
                          {isLessonCompleted(currentLesson.id) ? (
                            <span>•</span>
                          ) : null}
                          {isLessonCompleted(currentLesson.id) ? (
                            <span className="font-semibold text-[#171512]">
                              {t.player.completed}
                            </span>
                          ) : null}
                        </div>
                        <h2 className="font-sans text-[2.1rem] font-semibold text-[#171512] sm:text-[2.5rem]">
                          {currentLesson.title}
                        </h2>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 px-5 pb-4 sm:px-8 lg:px-10">
                    <LessonPlayer
                      lesson={currentLesson}
                      courseId={course.id}
                      onVideoEnded={handleVideoEnded}
                      onQuizComplete={handleQuizComplete}
                    />
                  </div>
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center px-6 py-16">
                  <div className="max-w-xl text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(17,17,17,0.12)] bg-white/70 text-[#171512]">
                      <PlayCircle size={28} />
                    </div>
                    <h2 className="mt-5 font-sans text-[2rem] font-semibold tracking-[-0.04em] text-[#171512]">
                      {language === "vi"
                        ? "Chọn một bài học để bắt đầu"
                        : "Choose a lesson to begin"}
                    </h2>
                    <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#5f584e]">
                      {language === "vi"
                        ? "Curriculum được sắp theo section để bạn vào học nhanh, quay lại đúng lesson đang làm dở và theo dõi tiến độ rõ ràng."
                        : "The curriculum is organized by section so you can jump in quickly, resume the right lesson, and keep progress visible."}
                    </p>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <button
            className="absolute inset-0 bg-black/35"
            onClick={() => setSidebarOpen(false)}
            aria-label={
              language === "vi" ? "Đóng giáo trình" : "Close curriculum"
            }
          />
          <div className="absolute left-0 top-0 h-full w-full max-w-sm overflow-y-auto border-r border-[rgba(17,17,17,0.12)] bg-[#f3efe5] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[rgba(17,17,17,0.1)] px-5 py-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#756d62]">
                  {language === "vi" ? "Curriculum" : "Curriculum"}
                </p>
                <p className="mt-2 font-sans text-[1.6rem] font-semibold tracking-[-0.03em] text-[#171512]">
                  {courseTitle}
                </p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(17,17,17,0.12)] bg-white/75 text-[#171512]"
                aria-label={language === "vi" ? "Đóng" : "Close"}
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              <div className="mb-5 rounded-[20px] border border-[rgba(17,17,17,0.12)] bg-white/60 p-4">
                <div className="mb-2 flex items-center justify-between text-sm text-[#5f584e]">
                  <span>{t.player.progress}</span>
                  <span className="font-semibold text-[#171512]">
                    {progress}%
                  </span>
                </div>
                <ProgressBar progress={progress} size="md" />
                <p className="mt-3 text-sm text-[#5f584e]">{progressLabel}</p>
              </div>

              <CourseSidebar
                sections={sections}
                lessonsBySection={lessonsBySection}
                currentLessonId={currentLessonId}
                completedLessons={completedLessons}
                onSelectLesson={(lessonId) => {
                  goToLesson(lessonId);
                  setSidebarOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
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
