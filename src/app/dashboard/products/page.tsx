"use client";

import { ProductManager } from "@/components/dashboard/ProductManager";
import { useAuth } from "@/lib/useAuth";

export default function DashboardProductsPage() {
  const { userProfile } = useAuth();

  if (!userProfile) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ProductManager userProfile={userProfile} />
    </div>
  );
}
