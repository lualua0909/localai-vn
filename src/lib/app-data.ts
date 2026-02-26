export interface AppDetail {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  rating: number;
  reviewsCount: string;
  category: string;
  author: string;
  trending?: boolean;
  icon: string;
  screenshots: string[];
  features: {
    title: string;
    description: string;
  }[];
  pricing: {
    plan: string;
    price: string;
    features: string[];
  }[];
  releaseDate?: string;
  views?: number;
  score?: number;
  status?: "published" | "pending" | "rejected" | "draft";
}
