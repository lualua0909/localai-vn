import { useState, useEffect, useCallback } from "react";
import type { AppDetail } from "@/lib/app-data";
import type { UserProfile } from "@/lib/firestore";
import {
  getApps,
  addApp as firestoreAddApp,
  updateApp as firestoreUpdateApp,
  deleteApp as firestoreDeleteApp,
} from "@/lib/firestore";

export type ProductFormData = Omit<
  AppDetail,
  "id" | "slug" | "rating" | "reviewsCount" | "views" | "score"
> & {
  id?: string;
  slug?: string;
};

export function useProducts(userProfile: UserProfile | null) {
  const [products, setProducts] = useState<AppDetail[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = userProfile ? userProfile.role <= 1 : false;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const apps = await getApps();
      setProducts(apps);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const myProducts = isAdmin
    ? products
    : products.filter((p) => p.author === userProfile?.email);

  const addProduct = async (data: ProductFormData) => {
    const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, "-");
    const newApp: Omit<AppDetail, "id"> = {
      ...data,
      slug,
      rating: 0,
      reviewsCount: "0",
      views: 0,
      score: 0,
      status: isAdmin ? "published" : "pending",
    };
    await firestoreAddApp(newApp);
    await fetchProducts();
  };

  const updateProduct = async (id: string, data: Partial<AppDetail>) => {
    await firestoreUpdateApp(id, data);
    await fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    await firestoreDeleteApp(id);
    await fetchProducts();
  };

  return {
    products,
    myProducts,
    isAdmin,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts,
  };
}
