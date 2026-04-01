"use client";

import { CourseManager } from "@/components/dashboard/course/CourseManager";
import { useAuth } from "@/lib/useAuth";

export default function DashboardCoursesPage() {
  const { userProfile } = useAuth();
  const isAdmin = userProfile ? userProfile.role <= 1 : false;

  if (!userProfile || !isAdmin) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CourseManager userProfile={userProfile} />
    </div>
  );
}
