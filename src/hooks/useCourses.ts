import { useState, useEffect, useCallback } from "react";
import type { Course } from "@/lib/course-data";
import type { UserProfile } from "@/lib/firestore";
import {
  getCourses,
  getCourseLessons,
  addCourse as firestoreAddCourse,
  updateCourse as firestoreUpdateCourse,
  deleteCourse as firestoreDeleteCourse,
} from "@/lib/firestore-courses";

export type CourseFormData = Omit<
  Course,
  "id" | "createdAt" | "updatedAt" | "enrollmentCount" | "totalLessons" | "totalDuration"
> & {
  id?: string;
};

export function useCourses(userProfile: UserProfile | null) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = userProfile ? userProfile.role <= 1 : false;

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCourses();
      const hydrated = await Promise.all(
        data.map(async (course) => {
          if (course.totalLessons > 0) return course;

          const lessons = await getCourseLessons(course.id);
          if (lessons.length === 0) return course;

          return {
            ...course,
            totalLessons: lessons.length,
            totalDuration: lessons.reduce(
              (sum, lesson) => sum + (lesson.duration || 0),
              0
            ),
          };
        })
      );
      setCourses(hydrated);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const myCourses = isAdmin
    ? courses
    : courses.filter((c) => c.instructorUid === userProfile?.uid);

  const addCourseHandler = async (data: CourseFormData) => {
    const slug = data.slug || data.title.toLowerCase().replace(/\s+/g, "-");
    await firestoreAddCourse({
      ...data,
      slug,
      totalLessons: 0,
      totalDuration: 0,
      enrollmentCount: 0,
      status: isAdmin ? data.status : "draft",
    });
    await fetchCourses();
  };

  const updateCourseHandler = async (id: string, data: Partial<Course>) => {
    await firestoreUpdateCourse(id, data);
    await fetchCourses();
  };

  const deleteCourseHandler = async (id: string) => {
    await firestoreDeleteCourse(id);
    await fetchCourses();
  };

  return {
    courses,
    myCourses,
    isAdmin,
    loading,
    addCourse: addCourseHandler,
    updateCourse: updateCourseHandler,
    deleteCourse: deleteCourseHandler,
    refetch: fetchCourses,
  };
}
