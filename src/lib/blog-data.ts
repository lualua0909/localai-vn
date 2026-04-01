export type BlogSource = "github_trending" | "manual";
export type TrendingPeriod = "daily" | "weekly" | "monthly";
export type BlogStatus = "draft" | "active";

export interface BlogPost {
  slug: string;
  title: string;
  summary: string;
  content: string;
  repoName: string;
  repoFullName: string;
  repoUrl: string;
  stars: number;
  language: string;
  trendingPeriod: TrendingPeriod;
  githubRank: number;
  source: BlogSource;
  status: BlogStatus;
  aiRewritten: boolean;
  createdAt: string;
  updatedAt?: string;
  tags?: string[];
  coverImage?: string;

  // Legacy UI fields kept for compatibility with existing admin/components.
  description?: string;
  image?: string;
  author?: string;
  date?: string;
  category?: string;
  readTime?: string;
}

export interface TrendingRepository {
  owner: string;
  name: string;
  repoName: string;
  repoFullName: string;
  description: string;
  starsToday: number;
  language: string;
  repoUrl: string;
  trendingPeriod: TrendingPeriod;
  githubRank: number;
}

export interface ReadmeAnalysis {
  projectDescription: string;
  mainFeatures: string[];
  installation: string[];
  useCases: string[];
  techStack: string[];
  rawExcerpt: string;
  logoUrl?: string;
  logoAlt?: string;
  visualCue?: string;
}

export interface GeneratedBlogDraft {
  title: string;
  summary: string;
  content: string;
  tags?: string[];
}

export const TRENDING_PERIODS: TrendingPeriod[] = ["daily", "weekly", "monthly"];

export function trendingPeriodLabel(period: TrendingPeriod): string {
  switch (period) {
    case "daily":
      return "today";
    case "weekly":
      return "this_week";
    case "monthly":
      return "this_month";
  }
}

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export function formatBlogDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function estimateReadTime(content: string): string {
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(3, Math.ceil(wordCount / 220));
  return `${minutes} phút đọc`;
}

export function toLegacyBlogPost(post: BlogPost): BlogPost {
  return {
    ...post,
    description: post.description ?? post.summary,
    image:
      post.image ??
      post.coverImage ??
      "/api/blog-data/thumbnails/default-tech-cover.svg",
    author: post.author ?? "LocalAI Bot",
    date: post.date ?? formatBlogDate(post.createdAt),
    category:
      post.category ??
      `GitHub ${trendingPeriodLabel(post.trendingPeriod).replace("_", " ")}`,
    readTime: post.readTime ?? estimateReadTime(post.content),
  };
}
