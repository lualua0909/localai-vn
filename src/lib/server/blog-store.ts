import { Timestamp } from "firebase-admin/firestore";
import { unstable_cache } from "next/cache";

import {
  estimateReadTime,
  formatBlogDate,
  slugify,
  toLegacyBlogPost,
  type BlogPost,
} from "@/lib/blog-data";
import { getAdminFirestore } from "@/lib/firebase-admin";

const BLOGS_COLLECTION = "blogs";
const BLOG_REPO_INDEX_COLLECTION = "blog_repo_index";

function repoIndexDocId(repoFullName: string): string {
  return encodeURIComponent(repoFullName);
}

function stripUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined),
  ) as T;
}

type FirestoreBlogDoc = Omit<BlogPost, "createdAt" | "updatedAt"> & {
  createdAt: string | Timestamp;
  updatedAt?: string | Timestamp;
};

function normalizeTimestamp(value: string | Timestamp | undefined): string {
  if (!value) {
    return new Date().toISOString();
  }
  if (typeof value === "string") {
    return value;
  }
  return value.toDate().toISOString();
}

function normalizeBlogDoc(id: string, data: FirestoreBlogDoc): BlogPost {
  const createdAt = normalizeTimestamp(data.createdAt);
  const updatedAt = normalizeTimestamp(data.updatedAt);

  return toLegacyBlogPost({
    ...data,
    slug: data.slug || id,
    createdAt,
    updatedAt,
    summary: data.summary ?? data.description ?? "",
    repoName: data.repoName ?? data.title,
    repoFullName: data.repoFullName ?? data.repoName ?? data.title,
    repoUrl: data.repoUrl ?? "",
    stars: data.stars ?? 0,
    language: data.language ?? "Unknown",
    trendingPeriod: data.trendingPeriod ?? "daily",
    githubRank: data.githubRank ?? 0,
    source: data.source ?? "manual",
    status: data.status ?? "active",
    aiRewritten: data.aiRewritten ?? data.source === "github_trending",
  });
}

function buildBlogPayload(
  blog: Omit<BlogPost, "slug" | "createdAt" | "updatedAt"> & {
    slug?: string;
    createdAt?: string;
    updatedAt?: string;
  },
): BlogPost {
  const createdAt = blog.createdAt ?? new Date().toISOString();
  const updatedAt = blog.updatedAt ?? createdAt;
  const slug = blog.slug || slugify(blog.repoFullName);

  return toLegacyBlogPost(
    stripUndefined({
      ...blog,
      slug,
      createdAt,
      updatedAt,
      summary: blog.summary,
      content: blog.content,
      repoName: blog.repoName,
      repoFullName: blog.repoFullName,
      repoUrl: blog.repoUrl,
      stars: blog.stars,
      language: blog.language,
      trendingPeriod: blog.trendingPeriod,
      githubRank: blog.githubRank,
      source: blog.source,
      status: blog.status,
      aiRewritten: blog.aiRewritten,
      tags: blog.tags ?? [],
      coverImage: blog.coverImage,
      description: blog.summary,
      image: blog.coverImage,
      author: "LocalAI Bot",
      date: formatBlogDate(createdAt),
      category: `GitHub ${blog.trendingPeriod}`,
      readTime: estimateReadTime(blog.content || blog.summary),
    }),
  );
}

export async function getAllBlogsAdmin(): Promise<BlogPost[]> {
  const snapshot = await getAdminFirestore()
    .collection(BLOGS_COLLECTION)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) =>
    normalizeBlogDoc(doc.id, doc.data() as FirestoreBlogDoc),
  );
}

export const getCachedBlogs = unstable_cache(
  async () => getAllBlogsAdmin(),
  ["blogs:list"],
  { revalidate: 60 * 10, tags: ["blogs"] },
);

export async function getPublicBlogs(): Promise<BlogPost[]> {
  const snapshot = await getAdminFirestore()
    .collection(BLOGS_COLLECTION)
    .get();

  console.log(`[getPublicBlogs] Total docs in collection: ${snapshot.docs.length}`);
  if (snapshot.docs.length > 0) {
    const first = snapshot.docs[0];
    console.log(`[getPublicBlogs] First doc id: ${first.id}, status: ${first.data().status}`);
  }

  return snapshot.docs
    .map((doc) => normalizeBlogDoc(doc.id, doc.data() as FirestoreBlogDoc))
    .filter((blog) => blog.status === "active")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export const getCachedPublicBlogs = unstable_cache(
  async () => getPublicBlogs(),
  ["blogs:public:list"],
  { revalidate: 60 * 10, tags: ["blogs"] },
);

export async function getBlogBySlugAdmin(
  slug: string,
): Promise<BlogPost | null> {
  const doc = await getAdminFirestore()
    .collection(BLOGS_COLLECTION)
    .doc(slug)
    .get();
  if (!doc.exists) {
    return null;
  }
  return normalizeBlogDoc(doc.id, doc.data() as FirestoreBlogDoc);
}

export async function getPublicBlogBySlug(
  slug: string,
): Promise<BlogPost | null> {
  const doc = await getAdminFirestore()
    .collection(BLOGS_COLLECTION)
    .doc(slug)
    .get();
  if (!doc.exists) {
    return null;
  }

  const blog = normalizeBlogDoc(doc.id, doc.data() as FirestoreBlogDoc);
  return blog.status === "active" ? blog : null;
}

export async function findBlogByRepository(
  repoFullName: string,
  source: BlogPost["source"] = "github_trending",
): Promise<BlogPost | null> {
  const snapshot = await getAdminFirestore()
    .collection(BLOGS_COLLECTION)
    .where("repoFullName", "==", repoFullName)
    .where("source", "==", source)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return normalizeBlogDoc(doc.id, doc.data() as FirestoreBlogDoc);
}

export async function hasRepositoryIndex(
  repoFullName: string,
): Promise<boolean> {
  const indexDoc = await getAdminFirestore()
    .collection(BLOG_REPO_INDEX_COLLECTION)
    .doc(repoIndexDocId(repoFullName))
    .get();

  return indexDoc.exists;
}

export async function createDraftBlog(
  blog: Omit<BlogPost, "slug" | "createdAt" | "updatedAt"> & { slug?: string },
): Promise<BlogPost> {
  const now = new Date().toISOString();
  const slug = blog.slug || slugify(blog.repoFullName);
  const payload = buildBlogPayload({
    ...blog,
    slug,
    status: "draft",
    aiRewritten: false,
    createdAt: now,
    updatedAt: now,
  });

  await getAdminFirestore().runTransaction(async (transaction) => {
    const repoIndexRef = getAdminFirestore()
      .collection(BLOG_REPO_INDEX_COLLECTION)
      .doc(repoIndexDocId(blog.repoFullName));
    const repoIndexDoc = await transaction.get(repoIndexRef);

    if (repoIndexDoc.exists) {
      throw new Error(`Repository already indexed: ${blog.repoFullName}`);
    }

    const blogRef = getAdminFirestore().collection(BLOGS_COLLECTION).doc(slug);
    transaction.set(blogRef, payload, { merge: true });
    transaction.set(repoIndexRef, {
      repoFullName: blog.repoFullName,
      blogSlug: slug,
      source: blog.source,
      status: "draft",
      createdAt: now,
    });
  });

  return payload;
}

export async function saveGeneratedBlog(
  blog: Omit<BlogPost, "slug" | "createdAt" | "updatedAt"> & { slug?: string },
): Promise<BlogPost> {
  const now = new Date().toISOString();
  const slug = blog.slug || slugify(blog.repoFullName);
  const payload = buildBlogPayload({
    ...blog,
    slug,
    createdAt: now,
    updatedAt: now,
  });

  await getAdminFirestore()
    .collection(BLOGS_COLLECTION)
    .doc(slug)
    .set(payload, { merge: true });

  await getAdminFirestore()
    .collection(BLOG_REPO_INDEX_COLLECTION)
    .doc(repoIndexDocId(blog.repoFullName))
    .set(
      {
        repoFullName: blog.repoFullName,
        blogSlug: slug,
        source: blog.source,
        status: blog.status,
        aiRewritten: blog.aiRewritten,
        updatedAt: now,
      },
      { merge: true },
    );

  return payload;
}

export async function updateBlogAdmin(
  slug: string,
  data: Partial<BlogPost>,
): Promise<void> {
  await getAdminFirestore()
    .collection(BLOGS_COLLECTION)
    .doc(slug)
    .set(
      stripUndefined({
        ...data,
        updatedAt: new Date().toISOString(),
      }),
      { merge: true },
    );
}
