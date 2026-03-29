import { getFirebaseDb } from "./firebase";
import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";
import type { Course, CourseSection, Lesson, Enrollment, QuizResult } from "./course-data";

// ─── Course operations ───

export async function getCourses(): Promise<Course[]> {
  const snap = await getDocs(
    query(collection(getFirebaseDb(), "courses"), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Course);
}

export async function getPublishedCourses(): Promise<Course[]> {
  const snap = await getDocs(
    query(
      collection(getFirebaseDb(), "courses"),
      where("status", "==", "published"),
      orderBy("createdAt", "desc")
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Course);
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  const snap = await getDocs(
    query(
      collection(getFirebaseDb(), "courses"),
      where("slug", "==", slug),
      firestoreLimit(1)
    )
  );
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Course;
}

export async function addCourse(course: Omit<Course, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const ref = await addDoc(collection(getFirebaseDb(), "courses"), {
    ...course,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateCourse(id: string, data: Partial<Course>) {
  return updateDoc(doc(getFirebaseDb(), "courses", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCourse(id: string) {
  // Delete subcollections first
  const sections = await getCourseSections(id);
  for (const section of sections) {
    await deleteSection(id, section.id);
  }
  const lessons = await getCourseLessons(id);
  for (const lesson of lessons) {
    await deleteLesson(id, lesson.id);
  }
  // Delete enrollments
  const enrollments = await getDocs(
    query(collection(getFirebaseDb(), "enrollments"), where("courseId", "==", id))
  );
  for (const enrollment of enrollments.docs) {
    await deleteDoc(enrollment.ref);
  }
  return deleteDoc(doc(getFirebaseDb(), "courses", id));
}

// ─── Section operations (subcollection) ───

export async function getCourseSections(courseId: string): Promise<CourseSection[]> {
  const snap = await getDocs(
    query(
      collection(getFirebaseDb(), "courses", courseId, "sections"),
      orderBy("order", "asc")
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as CourseSection);
}

export async function addSection(
  courseId: string,
  section: Omit<CourseSection, "id">
): Promise<string> {
  const ref = await addDoc(
    collection(getFirebaseDb(), "courses", courseId, "sections"),
    section
  );
  return ref.id;
}

export async function updateSection(
  courseId: string,
  sectionId: string,
  data: Partial<CourseSection>
) {
  return updateDoc(
    doc(getFirebaseDb(), "courses", courseId, "sections", sectionId),
    data
  );
}

export async function deleteSection(courseId: string, sectionId: string) {
  return deleteDoc(
    doc(getFirebaseDb(), "courses", courseId, "sections", sectionId)
  );
}

// ─── Lesson operations (subcollection) ───

export async function getCourseLessons(courseId: string): Promise<Lesson[]> {
  const snap = await getDocs(
    query(
      collection(getFirebaseDb(), "courses", courseId, "lessons"),
      orderBy("order", "asc")
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Lesson);
}

export async function getLessonsBySection(
  courseId: string,
  sectionId: string
): Promise<Lesson[]> {
  const snap = await getDocs(
    query(
      collection(getFirebaseDb(), "courses", courseId, "lessons"),
      where("sectionId", "==", sectionId),
      orderBy("sectionOrder", "asc")
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Lesson);
}

export async function addLesson(
  courseId: string,
  lesson: Omit<Lesson, "id">
): Promise<string> {
  const ref = await addDoc(
    collection(getFirebaseDb(), "courses", courseId, "lessons"),
    lesson
  );
  return ref.id;
}

export async function updateLesson(
  courseId: string,
  lessonId: string,
  data: Partial<Lesson>
) {
  return updateDoc(
    doc(getFirebaseDb(), "courses", courseId, "lessons", lessonId),
    data
  );
}

export async function deleteLesson(courseId: string, lessonId: string) {
  return deleteDoc(
    doc(getFirebaseDb(), "courses", courseId, "lessons", lessonId)
  );
}

// ─── Enrollment operations ───

export async function getEnrollment(
  userId: string,
  courseId: string
): Promise<Enrollment | null> {
  const snap = await getDocs(
    query(
      collection(getFirebaseDb(), "enrollments"),
      where("userId", "==", userId),
      where("courseId", "==", courseId),
      firestoreLimit(1)
    )
  );
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Enrollment;
}

export async function getUserEnrollments(userId: string): Promise<Enrollment[]> {
  const snap = await getDocs(
    query(
      collection(getFirebaseDb(), "enrollments"),
      where("userId", "==", userId),
      orderBy("lastAccessedAt", "desc")
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Enrollment);
}

export async function enrollUser(userId: string, courseId: string): Promise<string> {
  const existing = await getEnrollment(userId, courseId);
  if (existing) return existing.id;

  const ref = await addDoc(collection(getFirebaseDb(), "enrollments"), {
    userId,
    courseId,
    enrolledAt: serverTimestamp(),
    completedLessons: [],
    lastAccessedAt: serverTimestamp(),
    progress: 0,
    quizResults: {},
    completed: false,
  });

  // Increment enrollment count
  const courseRef = doc(getFirebaseDb(), "courses", courseId);
  const courseSnap = await getDoc(courseRef);
  if (courseSnap.exists()) {
    const current = courseSnap.data().enrollmentCount || 0;
    await updateDoc(courseRef, { enrollmentCount: current + 1 });
  }

  return ref.id;
}

export async function markLessonComplete(
  enrollmentId: string,
  lessonId: string,
  totalLessons: number
) {
  const enrollRef = doc(getFirebaseDb(), "enrollments", enrollmentId);
  await updateDoc(enrollRef, {
    completedLessons: arrayUnion(lessonId),
    lastLessonId: lessonId,
    lastAccessedAt: serverTimestamp(),
  });

  const snap = await getDoc(enrollRef);
  const data = snap.data() as Enrollment;
  const progress = Math.round((data.completedLessons.length / totalLessons) * 100);
  await updateDoc(enrollRef, {
    progress,
    completed: progress === 100,
  });
}

export async function saveQuizResult(
  enrollmentId: string,
  lessonId: string,
  result: Omit<QuizResult, "completedAt">
) {
  const enrollRef = doc(getFirebaseDb(), "enrollments", enrollmentId);
  await updateDoc(enrollRef, {
    [`quizResults.${lessonId}`]: {
      ...result,
      completedAt: serverTimestamp(),
    },
  });
}

export async function updateEnrollmentLastAccess(enrollmentId: string, lessonId: string) {
  return updateDoc(doc(getFirebaseDb(), "enrollments", enrollmentId), {
    lastLessonId: lessonId,
    lastAccessedAt: serverTimestamp(),
  });
}
