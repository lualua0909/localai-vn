"use client";

import { useState } from "react";
import type { Course } from "@/lib/course-data";
import type { UserProfile } from "@/lib/firestore";
import { useCourses } from "@/hooks/useCourses";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  GraduationCap,
  Users,
  Clock,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CourseFormModal } from "./CourseFormModal";
import { resolveLocalMediaUrl } from "@/lib/local-media";

interface CourseManagerProps {
  userProfile: UserProfile;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    published: "bg-green-500/10 text-green-600 border-green-500/20",
    draft: "bg-gray-500/10 text-gray-600 border-gray-500/20",
    archived: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  };

  return (
    <span
      className={`typo-caption px-2 py-0.5 rounded-full border ${styles[status] || styles.draft}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function LevelBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    beginner: "bg-blue-500/10 text-blue-600",
    intermediate: "bg-purple-500/10 text-purple-600",
    advanced: "bg-red-500/10 text-red-600",
  };

  return (
    <span
      className={`typo-caption px-2 py-0.5 rounded-full ${styles[level] || styles.beginner}`}
    >
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  );
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return remainMins > 0 ? `${hours}h ${remainMins}m` : `${hours}h`;
}

export function CourseManager({ userProfile }: CourseManagerProps) {
  const {
    courses,
    myCourses,
    isAdmin,
    loading,
    updateCourse,
    deleteCourse,
    refetch,
  } = useCourses(userProfile);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this course and all its content?")) {
      await deleteCourse(id);
    }
  };

  const handlePublish = async (id: string) => {
    await updateCourse(id, { status: "published" });
  };

  const handleArchive = async (id: string) => {
    await updateCourse(id, { status: "archived" });
  };

  const displayedCourses = isAdmin ? courses : myCourses;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="typo-h2">
          {isAdmin ? "All Courses (Admin)" : "My Courses"}{" "}
          <span className="typo-body text-[var(--color-text-secondary)]">
            ({displayedCourses.length})
          </span>
        </h2>
        <Button
          variant="primary"
          onClick={() => {
            setEditingCourse(null);
            setIsModalOpen(true);
          }}
          className="gap-2"
        >
          <Plus size={16} />
          New Course
        </Button>
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] overflow-hidden">
        {displayedCourses.length === 0 ? (
          <div className="p-12 text-center">
            <GraduationCap
              size={48}
              className="mx-auto text-[var(--color-text-secondary)] mb-4"
            />
            <p className="typo-body text-[var(--color-text-secondary)]">
              No courses yet. Create your first course!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {displayedCourses.map((course) => {
              const thumbnailSrc = resolveLocalMediaUrl(course.thumbnail);

              return (
                <div
                  key={course.id}
                  className="px-6 py-5 flex items-center justify-between gap-4 group hover:bg-[var(--color-bg-alt)]/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {thumbnailSrc ? (
                      <img
                        src={thumbnailSrc}
                        alt={course.title}
                        className="w-16 h-10 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                        <GraduationCap size={20} className="text-accent" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="typo-body font-semibold text-[var(--color-text)] truncate">
                        {course.title}
                      </h3>
                      <p className="typo-caption text-[var(--color-text-secondary)] truncate max-w-md mt-0.5">
                        {course.title_vi || course.description}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <StatusBadge status={course.status} />
                        <LevelBadge level={course.level} />
                        <span className="flex items-center gap-1 typo-caption text-[var(--color-text-secondary)]">
                          <BookOpen size={12} />
                          {course.totalLessons} lessons
                        </span>
                        <span className="flex items-center gap-1 typo-caption text-[var(--color-text-secondary)]">
                          <Clock size={12} />
                          {formatDuration(course.totalDuration)}
                        </span>
                        <span className="flex items-center gap-1 typo-caption text-[var(--color-text-secondary)]">
                          <Users size={12} />
                          {course.enrollmentCount}
                        </span>
                        <span className="typo-caption font-semibold text-accent">
                          {course.price === 0
                            ? "Free"
                            : `${course.price.toLocaleString()} ${course.currency}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      href={`/courses/${course.slug}`}
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-full border-none hover:bg-[var(--color-bg-alt)] text-[var(--color-text-secondary)]"
                    >
                      <Eye size={16} />
                    </Button>

                    <button
                      onClick={() => handleEdit(course)}
                      className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-blue-500/10 text-blue-500 transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>

                    {course.status === "draft" && (
                      <button
                        onClick={() => handlePublish(course.id)}
                        className="px-3 py-1 rounded-full bg-green-500/10 text-green-600 hover:bg-green-500/20 typo-caption font-medium transition-colors"
                      >
                        Publish
                      </button>
                    )}

                    {course.status === "published" && (
                    <button
                      onClick={() => handleArchive(course.id)}
                      className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 typo-caption font-medium transition-colors"
                    >
                      Archive
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(course.id)}
                    className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-red-500/10 text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CourseFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCourse(null);
        }}
        editingCourse={editingCourse}
        onSaved={refetch}
      />
    </div>
  );
}
