import { getAdminFirestore } from "@/lib/firebase-admin";
import type { Course, CourseSection, Lesson } from "@/lib/course-data";

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  const db = getAdminFirestore();
  const snap = await db
    .collection("courses")
    .where("slug", "==", slug)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Course;
}

export async function getCourseSections(courseId: string): Promise<CourseSection[]> {
  const db = getAdminFirestore();
  const snap = await db
    .collection("courses")
    .doc(courseId)
    .collection("sections")
    .orderBy("order", "asc")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as CourseSection);
}

export async function getCourseLessons(courseId: string): Promise<Lesson[]> {
  const db = getAdminFirestore();
  const snap = await db
    .collection("courses")
    .doc(courseId)
    .collection("lessons")
    .orderBy("order", "asc")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Lesson);
}
