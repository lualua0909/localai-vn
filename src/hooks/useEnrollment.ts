import { useState, useEffect, useCallback } from "react";
import type { Enrollment, QuizResult } from "@/lib/course-data";
import {
  getEnrollment,
  enrollUser,
  markLessonComplete as firestoreMarkComplete,
  saveQuizResult as firestoreSaveQuiz,
  updateEnrollmentLastAccess,
} from "@/lib/firestore-courses";

export function useEnrollment(userId: string | undefined, courseId: string | undefined) {
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEnrollment = useCallback(async () => {
    if (!userId || !courseId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getEnrollment(userId, courseId);
      setEnrollment(data);
    } finally {
      setLoading(false);
    }
  }, [userId, courseId]);

  useEffect(() => {
    fetchEnrollment();
  }, [fetchEnrollment]);

  const enroll = useCallback(async () => {
    if (!userId || !courseId) return;
    await enrollUser(userId, courseId);
    await fetchEnrollment();
  }, [userId, courseId, fetchEnrollment]);

  const markComplete = useCallback(
    async (lessonId: string, totalLessons: number) => {
      if (!enrollment) return;
      await firestoreMarkComplete(enrollment.id, lessonId, totalLessons);
      await fetchEnrollment();
    },
    [enrollment, fetchEnrollment]
  );

  const saveQuiz = useCallback(
    async (lessonId: string, result: Omit<QuizResult, "completedAt">) => {
      if (!enrollment) return;
      await firestoreSaveQuiz(enrollment.id, lessonId, result);
      await fetchEnrollment();
    },
    [enrollment, fetchEnrollment]
  );

  const updateLastAccess = useCallback(
    async (lessonId: string) => {
      if (!enrollment) return;
      await updateEnrollmentLastAccess(enrollment.id, lessonId);
    },
    [enrollment]
  );

  return {
    enrollment,
    isEnrolled: !!enrollment,
    progress: enrollment?.progress ?? 0,
    loading,
    enroll,
    markComplete,
    saveQuiz,
    updateLastAccess,
    refetch: fetchEnrollment,
  };
}
