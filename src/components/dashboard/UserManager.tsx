"use client";

import { useState, useEffect } from "react";
import { getAllUsers, updateUserProfile, UserProfile } from "@/lib/firestore";

const ROLE_LABELS: Record<number, string> = {
  0: "Root",
  1: "Admin",
  2: "User",
};

export function UserManager() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (uid: string, role: number) => {
    await updateUserProfile(uid, { role: role as 0 | 1 | 2 });
    setUsers((prev) =>
      prev.map((u) => (u.uid === uid ? { ...u, role: role as 0 | 1 | 2 } : u))
    );
  };

  const handleToggleActive = async (uid: string, isActive: boolean) => {
    await updateUserProfile(uid, { isActive });
    setUsers((prev) =>
      prev.map((u) => (u.uid === uid ? { ...u, isActive } : u))
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="typo-h2">Users ({users.length})</h2>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] overflow-hidden">
        {/* Header */}
        <div className="hidden md:grid grid-cols-[auto_1fr_120px_80px_140px] gap-4 px-6 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-alt)]/50">
          <span className="w-10" />
          <span className="typo-caption font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
            Email
          </span>
          <span className="typo-caption font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
            Role
          </span>
          <span className="typo-caption font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
            Active
          </span>
          <span className="typo-caption font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
            Created
          </span>
        </div>

        <div className="divide-y divide-[var(--color-border)]">
          {users.map((u) => (
            <div
              key={u.uid}
              className="px-6 py-4 flex flex-col md:grid md:grid-cols-[auto_1fr_120px_80px_140px] gap-4 items-center hover:bg-[var(--color-bg-alt)]/30 transition-colors"
            >
              <img
                src={u.avatar}
                alt={u.email}
                className="w-10 h-10 rounded-full object-cover bg-[var(--color-bg-alt)]"
              />
              <div className="min-w-0 text-center md:text-left">
                <p className="typo-body font-medium truncate">{u.email}</p>
              </div>
              <select
                value={u.role}
                onChange={(e) =>
                  handleRoleChange(u.uid, Number(e.target.value))
                }
                className="typo-caption rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1.5 outline-none"
              >
                <option value={0}>{ROLE_LABELS[0]}</option>
                <option value={1}>{ROLE_LABELS[1]}</option>
                <option value={2}>{ROLE_LABELS[2]}</option>
              </select>
              <div className="flex justify-center">
                <button
                  onClick={() => handleToggleActive(u.uid, !u.isActive)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    u.isActive ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      u.isActive ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              <span className="typo-caption text-[var(--color-text-secondary)]">
                {u.createdAt?.toDate?.()
                  ? u.createdAt.toDate().toLocaleDateString("vi-VN")
                  : "—"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
