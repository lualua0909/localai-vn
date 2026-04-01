"use client";

import { UserManager } from "@/components/dashboard/UserManager";
import { useAuth } from "@/lib/useAuth";

export default function DashboardUsersPage() {
  const { userProfile } = useAuth();
  const isAdmin = userProfile ? userProfile.role <= 1 : false;

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <UserManager />
    </div>
  );
}
