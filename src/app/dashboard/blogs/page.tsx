"use client";

import { BlogManager } from "@/components/dashboard/BlogManager";
import { useAuth } from "@/lib/useAuth";

export default function DashboardBlogsPage() {
  const { userProfile } = useAuth();
  const isAdmin = userProfile ? userProfile.role <= 1 : false;

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <BlogManager />
    </div>
  );
}
