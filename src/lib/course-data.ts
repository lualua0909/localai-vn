import { Timestamp } from "firebase/firestore";

// ─── Course ───

export interface Course {
  id: string;
  slug: string;
  title: string;
  title_vi: string;
  description: string;
  description_vi: string;
  thumbnail: string;
  instructorUid: string;
  instructorName: string;
  price: number;
  currency: "VND" | "USD";
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  status: "draft" | "published" | "archived";
  totalLessons: number;
  totalDuration: number;
  enrollmentCount: number;
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Section ───

export interface CourseSection {
  id: string;
  title: string;
  title_vi: string;
  order: number;
  lessonCount: number;
}

// ─── Lesson ───

export type LessonType = "video" | "text" | "pdf" | "quiz";

export interface Lesson {
  id: string;
  sectionId: string;
  title: string;
  type: LessonType;
  order: number;
  sectionOrder: number;
  videoUrl?: string;
  textContent?: string;
  pdfUrl?: string;
  quizData?: QuizData;
  duration?: number;
  isFree: boolean;
}

// ─── Quiz ───

export interface QuizData {
  questions: QuizQuestion[];
  passingScore: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

// ─── Enrollment ───

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: Timestamp;
  completedLessons: string[];
  lastLessonId?: string;
  lastAccessedAt: Timestamp;
  progress: number;
  quizResults: Record<string, QuizResult>;
  completed: boolean;
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  passed: boolean;
  completedAt: Timestamp;
}

// ─── Helpers ───

export const LESSON_TYPE_EXTENSIONS: Record<string, LessonType> = {
  ".mp4": "video",
  ".webm": "video",
  ".mov": "video",
  ".avi": "video",
  ".pdf": "pdf",
  ".json": "quiz",
  ".txt": "text",
  ".md": "text",
};

export function detectLessonType(filename: string): LessonType | null {
  const ext = filename.substring(filename.lastIndexOf(".")).toLowerCase();
  return LESSON_TYPE_EXTENSIONS[ext] || null;
}

export function extractLessonName(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  return lastDot > 0 ? filename.substring(0, lastDot) : filename;
}
