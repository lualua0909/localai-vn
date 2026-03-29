import { useState, useEffect, useCallback, useMemo } from "react";
import type { CourseSection, Lesson } from "@/lib/course-data";
import { getCourseSections, getCourseLessons } from "@/lib/firestore-courses";

export function useCoursePlayer(courseId: string | undefined) {
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchContent = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const [secs, les] = await Promise.all([
        getCourseSections(courseId),
        getCourseLessons(courseId),
      ]);
      setSections(secs);
      setLessons(les);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const currentLesson = useMemo(
    () => lessons.find((l) => l.id === currentLessonId) ?? null,
    [lessons, currentLessonId]
  );

  const currentIndex = useMemo(
    () => lessons.findIndex((l) => l.id === currentLessonId),
    [lessons, currentLessonId]
  );

  const nextLesson = currentIndex >= 0 && currentIndex < lessons.length - 1
    ? lessons[currentIndex + 1]
    : null;

  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;

  const goToLesson = useCallback((lessonId: string) => {
    setCurrentLessonId(lessonId);
  }, []);

  const goNext = useCallback(() => {
    if (nextLesson) setCurrentLessonId(nextLesson.id);
  }, [nextLesson]);

  const goPrev = useCallback(() => {
    if (prevLesson) setCurrentLessonId(prevLesson.id);
  }, [prevLesson]);

  const initFromLastLesson = useCallback(
    (lastLessonId?: string) => {
      if (lastLessonId && lessons.find((l) => l.id === lastLessonId)) {
        setCurrentLessonId(lastLessonId);
      } else if (lessons.length > 0) {
        setCurrentLessonId(lessons[0].id);
      }
    },
    [lessons]
  );

  const lessonsBySection = useMemo(() => {
    const map: Record<string, Lesson[]> = {};
    for (const lesson of lessons) {
      if (!map[lesson.sectionId]) map[lesson.sectionId] = [];
      map[lesson.sectionId].push(lesson);
    }
    return map;
  }, [lessons]);

  return {
    sections,
    lessons,
    lessonsBySection,
    currentLesson,
    currentLessonId,
    nextLesson,
    prevLesson,
    loading,
    goToLesson,
    goNext,
    goPrev,
    initFromLastLesson,
    refetch: fetchContent,
  };
}
