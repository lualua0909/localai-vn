import { useState, useEffect } from "react";
import { appData as initialAppData, AppDetail } from "@/lib/app-data";

// Type for product form data (some fields optional during creation)
export type ProductFormData = Omit<
  AppDetail,
  "id" | "slug" | "rating" | "reviewsCount" | "views" | "score"
> & {
  id?: string;
  slug?: string;
};

// Mock roles
export const userRoles: Record<string, number> = {
  "admin@astra.ai": 0, // Admin
  "user@astra.ai": 1 // User
};

export function useProducts(
  userEmail: string | undefined | null,
  roleOverride?: number
) {
  // Initialize state with appData values
  const [products, setProducts] = useState<AppDetail[]>([]);

  useEffect(() => {
    // Convert object to array
    setProducts(Object.values(initialAppData));
  }, []);

  const role =
    roleOverride !== undefined
      ? roleOverride
      : userEmail && userRoles[userEmail] !== undefined
        ? userRoles[userEmail]
        : 1;
  const isAdmin = role === 0;

  const getMyProducts = () => {
    if (!userEmail) return [];
    // Mock: filter by author name matching email purely for demo,
    // or just return a subset if not admin.
    // Since real appData doesn't link to emails, we'll simulate:
    // "VietAI Team" is the current user for demo purposes if not admin.
    if (isAdmin) return products;
    return products.filter((p) => p.author === "VietAI Team");
  };

  const addProduct = (data: ProductFormData) => {
    const newProduct: AppDetail = {
      ...data,
      id: data.id || Math.random().toString(36).substr(2, 9),
      slug: data.slug || data.name.toLowerCase().replace(/\s+/g, "-"),
      rating: 0, // Default for new
      reviewsCount: "0",
      views: 0,
      score: 0
    };
    setProducts([newProduct, ...products]);
  };

  const updateProduct = (id: string, data: ProductFormData) => {
    setProducts(products.map((p) => (p.id === id ? { ...p, ...data } : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  return {
    products,
    myProducts: getMyProducts(),
    isAdmin,
    addProduct,
    updateProduct,
    deleteProduct
  };
}
