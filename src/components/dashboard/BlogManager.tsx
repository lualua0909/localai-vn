"use client";

import { useState, useEffect } from "react";
import { DashboardTableLoader } from "@/components/loading";
import type { BlogPost } from "@/lib/blog-data";
import type { TrendingPeriod } from "@/lib/blog-data";
import { addBlog, updateBlog, deleteBlog } from "@/lib/firestore";
import {
  ImagePlus,
  PenSquare,
  Plus,
  Edit2,
  Trash2,
  Eye,
  RefreshCw,
  Share2,
  Copy,
  Check,
} from "lucide-react";
import { SimpleModal } from "@/components/ui/SimpleModal";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/useAuth";
import { FileUploader } from "@/components/dashboard/course/FileUploader";
import type { WriterAttempt } from "@/lib/server/openai-blog";
import type { ThumbnailAttempt } from "@/lib/server/blog-thumbnail";

function stripMarkdown(md: string): string {
  return md
    .replace(/^#{1,6}\s+/gm, "")         // headings
    .replace(/\*\*(.+?)\*\*/g, "$1")      // bold
    .replace(/\*(.+?)\*/g, "$1")          // italic
    .replace(/__(.+?)__/g, "$1")          // bold alt
    .replace(/_(.+?)_/g, "$1")            // italic alt
    .replace(/~~(.+?)~~/g, "$1")          // strikethrough
    .replace(/`{3}[\s\S]*?`{3}/g, "")     // code blocks
    .replace(/`(.+?)`/g, "$1")            // inline code
    .replace(/!\[.*?\]\(.*?\)/g, "")       // images
    .replace(/\[(.+?)\]\(.*?\)/g, "$1")   // links
    .replace(/^\s*[-*+]\s+/gm, "- ")      // list items
    .replace(/^\s*\d+\.\s+/gm, "")        // numbered lists
    .replace(/^>\s+/gm, "")               // blockquotes
    .replace(/^---+$/gm, "")              // hr
    .replace(/\n{3,}/g, "\n\n")           // excess newlines
    .trim();
}

type ActionProgress = {
  slug: string;
  kind: "write" | "thumbnail";
  percent: number;
  message: string;
  currentModel?: string;
  currentProvider?: string;
};

type BlogFormData = Omit<BlogPost, "slug"> & { slug?: string };

function createEmptyBlogFormData(): BlogFormData {
  const now = new Date();
  const createdAt = now.toISOString();

  return {
    title: "",
    summary: "",
    description: "",
    image: "",
    coverImage: "",
    author: "LocalAI Bot",
    date: now.toLocaleDateString("vi-VN"),
    category: "Manual",
    readTime: "5 phut doc",
    content: "",
    repoName: "manual-entry",
    repoFullName: "manual/manual-entry",
    repoUrl: "",
    stars: 0,
    language: "Markdown",
    trendingPeriod: "daily",
    githubRank: 0,
    source: "manual",
    status: "draft",
    aiRewritten: false,
    createdAt,
    updatedAt: createdAt,
    tags: [],
  };
}

export function BlogManager() {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [fetchingPeriod, setFetchingPeriod] = useState<TrendingPeriod | null>(
    null,
  );
  const [fetchResult, setFetchResult] = useState<string>("");
  const [repoUrlInput, setRepoUrlInput] = useState("");
  const [creatingFromRepo, setCreatingFromRepo] = useState(false);
  const [actionSlug, setActionSlug] = useState<string | null>(null);
  const [actionProgress, setActionProgress] = useState<ActionProgress | null>(
    null,
  );
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const handleShareFacebook = (blog: BlogPost) => {
    const blogUrl = `${window.location.origin}/blogs/${blog.slug}`;
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(blogUrl)}`;
    window.open(fbUrl, "_blank", "width=600,height=400");
  };

  const handleCopyContent = async (blog: BlogPost) => {
    const plainText = stripMarkdown(blog.content || blog.summary || "");
    await navigator.clipboard.writeText(plainText);
    setCopiedSlug(blog.slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      if (!user) {
        setBlogs([]);
        return;
      }

      const token = await user.getIdToken();
      const response = await fetch("/api/admin/blogs", {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to load blogs");
      }
      const payload = (await response.json()) as { blogs: BlogPost[] };
      setBlogs(payload.blogs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBlogs();
    } else {
      setLoading(false);
      setBlogs([]);
    }
  }, [user]);

  const handleEdit = (blog: BlogPost) => {
    setEditing(blog);
    setIsModalOpen(true);
  };

  const handleDelete = async (slug: string) => {
    if (confirm("Are you sure you want to delete this blog post?")) {
      await deleteBlog(slug);
      await fetchBlogs();
    }
  };

  const handleSave = async (data: BlogFormData) => {
    const slug =
      data.slug ||
      data.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");

    const blogPost: BlogPost = {
      ...data,
      slug,
      summary: data.summary || data.description || "",
      description: data.description || data.summary || "",
      repoFullName: data.repoFullName || `${data.repoName || "manual"}/repo`,
      coverImage: data.coverImage || data.image,
      image: data.image || data.coverImage,
      status: data.aiRewritten ? "active" : data.status,
      updatedAt: new Date().toISOString(),
    };

    if (editing) {
      await updateBlog(editing.slug, blogPost);
    } else {
      await addBlog(blogPost);
    }
    setIsModalOpen(false);
    setEditing(null);
    await fetchBlogs();
  };

  const handleFetchTrending = async (period: TrendingPeriod) => {
    if (!user) {
      setFetchResult("Bạn cần đăng nhập lại để chạy tác vụ này.");
      return;
    }

    setFetchingPeriod(period);
    setFetchResult("");

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/admin/blogs/fetch-trending", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ period, limit: 20 }),
      });

      const payload = (await response.json()) as {
        ok: boolean;
        created?: number;
        crawled?: number;
        skipped?: Array<{ repoFullName: string; reason: string }>;
        error?: string;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Force fetch failed");
      }

      const skippedPreview =
        payload.skipped && payload.skipped.length > 0
          ? ` Ví dụ skip: ${payload.skipped
              .slice(0, 2)
              .map((item) => `${item.repoFullName} (${item.reason})`)
              .join(", ")}.`
          : "";

      setFetchResult(
        `Fetch ${period} xong: crawled ${payload.crawled ?? 0}, tạo mới ${payload.created ?? 0}, bỏ qua ${payload.skipped?.length ?? 0}.${skippedPreview}`,
      );
      await fetchBlogs();
    } catch (error) {
      setFetchResult(
        error instanceof Error ? error.message : "Force fetch failed",
      );
    } finally {
      setFetchingPeriod(null);
    }
  };

  const callAdminBlogAction = async (
    path: string,
    body: Record<string, unknown>,
  ) => {
    if (!user) {
      throw new Error("Bạn cần đăng nhập lại để chạy tác vụ này.");
    }

    const token = await user.getIdToken();
    const response = await fetch(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const payload = (await response.json()) as {
      ok: boolean;
      error?: string;
      writer?: {
        provider: string;
        model: string;
        attempts?: WriterAttempt[];
      };
    };

    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || "Admin action failed");
    }

    return payload;
  };

  const handleWriteWithAi = async (slug: string) => {
    if (!user) {
      setFetchResult("Bạn cần đăng nhập lại để chạy tác vụ này.");
      return;
    }

    setActionSlug(slug);
    setFetchResult("");
    setActionProgress({
      slug,
      kind: "write",
      percent: 0,
      message: "Đang khởi động AI rewrite...",
    });
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/admin/blogs/write-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ slug }),
      });

      if (!response.ok || !response.body) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || "Write with AI failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let donePayload:
        | {
            writer?: {
              provider: string;
              model: string;
              attempts?: WriterAttempt[];
            };
          }
        | undefined;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as {
            type: "progress" | "done" | "error";
            percent?: number;
            message?: string;
            currentModel?: string;
            currentProvider?: string;
            error?: string;
            writer?: {
              provider: string;
              model: string;
              attempts?: WriterAttempt[];
            };
          };

          if (event.type === "error") {
            throw new Error(
              event.error || event.message || "Write with AI failed",
            );
          }

          if (event.type === "progress" || event.type === "done") {
            setActionProgress({
              slug,
              kind: "write",
              percent: event.percent ?? 0,
              message: event.message || "Đang xử lý...",
              currentModel: event.currentModel,
              currentProvider: event.currentProvider,
            });
          }

          if (event.type === "done") {
            donePayload = { writer: event.writer };
          }
        }
      }

      const writerSummary = donePayload?.writer
        ? ` Writer: ${donePayload.writer.provider}/${donePayload.writer.model}.`
        : "";
      const attemptSummary =
        donePayload?.writer?.attempts && donePayload.writer.attempts.length > 0
          ? ` Attempts: ${donePayload.writer.attempts
              .map((attempt) =>
                attempt.ok ? `${attempt.label}=ok` : `${attempt.label}=fail`,
              )
              .join(" -> ")}.`
          : "";
      setFetchResult(
        `AI đã rewrite lại bài thành công.${writerSummary}${attemptSummary}`,
      );
      await fetchBlogs();
    } catch (error) {
      setFetchResult(
        error instanceof Error ? error.message : "Write with AI failed",
      );
    } finally {
      setActionProgress(null);
      setActionSlug(null);
    }
  };

  const handleCreateThumbnail = async (slug: string) => {
    if (!user) {
      setFetchResult("Bạn cần đăng nhập lại để chạy tác vụ này.");
      return;
    }

    setActionSlug(slug);
    setFetchResult("");
    setActionProgress({
      slug,
      kind: "thumbnail",
      percent: 0,
      message: "Đang khởi động AI thumbnail...",
    });
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/admin/blogs/create-thumbnail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ slug }),
      });

      if (!response.ok || !response.body) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || "Create thumbnail failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let donePayload:
        | {
            thumbnail?: {
              provider: string;
              model: string;
              attempts?: ThumbnailAttempt[];
            };
          }
        | undefined;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as {
            type: "progress" | "done" | "error";
            percent?: number;
            message?: string;
            currentModel?: string;
            currentProvider?: string;
            error?: string;
            thumbnail?: {
              provider: string;
              model: string;
              attempts?: ThumbnailAttempt[];
            };
          };

          if (event.type === "error") {
            throw new Error(
              event.error || event.message || "Create thumbnail failed",
            );
          }

          if (event.type === "progress" || event.type === "done") {
            setActionProgress({
              slug,
              kind: "thumbnail",
              percent: event.percent ?? 0,
              message: event.message || "Đang xử lý...",
              currentModel: event.currentModel,
              currentProvider: event.currentProvider,
            });
          }

          if (event.type === "done") {
            donePayload = { thumbnail: event.thumbnail };
          }
        }
      }

      const thumbnailSummary = donePayload?.thumbnail
        ? ` Thumbnail: ${donePayload.thumbnail.provider}/${donePayload.thumbnail.model}.`
        : "";
      const attemptSummary =
        donePayload?.thumbnail?.attempts &&
        donePayload.thumbnail.attempts.length > 0
          ? ` Attempts: ${donePayload.thumbnail.attempts
              .map((attempt) =>
                attempt.ok ? `${attempt.label}=ok` : `${attempt.label}=fail`,
              )
              .join(" -> ")}.`
          : "";
      setFetchResult(
        `AI đã tạo thumbnail thành công.${thumbnailSummary}${attemptSummary}`,
      );
      await fetchBlogs();
    } catch (error) {
      setFetchResult(
        error instanceof Error ? error.message : "Create thumbnail failed",
      );
    } finally {
      setActionProgress(null);
      setActionSlug(null);
    }
  };

  const handleCreateFromRepo = async () => {
    if (!repoUrlInput.trim()) {
      setFetchResult("Nhập link GitHub repo trước đã.");
      return;
    }

    setCreatingFromRepo(true);
    setFetchResult("");
    try {
      await callAdminBlogAction("/api/admin/blogs/create-from-repo", {
        repoUrl: repoUrlInput.trim(),
      });
      setFetchResult("Đã tạo blog từ GitHub repo thành công.");
      setRepoUrlInput("");
      await fetchBlogs();
    } catch (error) {
      setFetchResult(
        error instanceof Error ? error.message : "Create from repo failed",
      );
    } finally {
      setCreatingFromRepo(false);
    }
  };

  if (loading) {
    return <DashboardTableLoader rows={5} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="typo-h2">Blog Posts ({blogs.length})</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={() => handleFetchTrending("daily")}
            className="gap-2"
            disabled={fetchingPeriod !== null}
          >
            <RefreshCw
              size={16}
              className={fetchingPeriod === "daily" ? "animate-spin" : ""}
            />
            Fetch Daily
          </Button>
          <Button
            variant="outline"
            onClick={() => handleFetchTrending("weekly")}
            className="gap-2"
            disabled={fetchingPeriod !== null}
          >
            <RefreshCw
              size={16}
              className={fetchingPeriod === "weekly" ? "animate-spin" : ""}
            />
            Fetch Week
          </Button>
          <Button
            variant="outline"
            onClick={() => handleFetchTrending("monthly")}
            className="gap-2"
            disabled={fetchingPeriod !== null}
          >
            <RefreshCw
              size={16}
              className={fetchingPeriod === "monthly" ? "animate-spin" : ""}
            />
            Fetch Month
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setEditing(null);
              setIsModalOpen(true);
            }}
            className="gap-2"
          >
            <Plus size={16} />
            New Post
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            type="url"
            value={repoUrlInput}
            onChange={(e) => setRepoUrlInput(e.target.value)}
            placeholder="https://github.com/owner/repo"
            className="flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3 typo-body outline-none"
          />
          <Button
            variant="primary"
            onClick={handleCreateFromRepo}
            disabled={creatingFromRepo}
            className="gap-2"
          >
            <Plus size={16} />
            {creatingFromRepo ? "Creating..." : "Create Blog From Repo"}
          </Button>
        </div>
      </div>

      {fetchResult && (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-alt)] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
          {fetchResult}
        </div>
      )}

      {actionProgress && (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[var(--color-text)]">
                {actionProgress.kind === "write"
                  ? "AI rewrite đang chạy"
                  : "AI thumbnail đang chạy"}
                : {actionProgress.percent}%
              </p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                {actionProgress.message}
              </p>
              {actionProgress.currentModel && (
                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                  Model hiện tại: {actionProgress.currentProvider}/
                  {actionProgress.currentModel}
                </p>
              )}
            </div>
            <div className="text-sm font-semibold text-[var(--color-text)]">
              {actionProgress.percent}%
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--color-bg-alt)]">
            <div
              className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-300"
              style={{ width: `${actionProgress.percent}%` }}
            />
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] overflow-hidden">
        {blogs.length === 0 ? (
          <div className="p-12 text-center typo-body text-[var(--color-text-secondary)]">
            No blog posts yet.
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {blogs.map((blog) => (
              <div
                key={blog.slug}
                className="px-6 py-5 flex items-start justify-between gap-4 group hover:bg-[var(--color-bg-alt)]/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {blog.image && (
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="w-16 h-10 rounded-lg object-cover shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <h3 className="typo-body font-semibold truncate">
                      {blog.title}
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`typo-caption rounded-full border px-2 py-0.5 ${
                          blog.status === "active"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                            : "border-amber-500/30 bg-amber-500/10 text-amber-600"
                        }`}
                      >
                        {blog.status === "active"
                          ? "Active: đã rewrite bằng AI"
                          : "Draft: đã crawl, chưa rewrite AI"}
                      </span>
                      <span className="typo-caption rounded-full border border-[var(--color-border)] px-2 py-0.5 text-[var(--color-text-secondary)]">
                        {blog.source}
                      </span>
                      <span className="typo-caption rounded-full border border-[var(--color-border)] px-2 py-0.5 text-[var(--color-text-secondary)]">
                        {blog.trendingPeriod} #{blog.githubRank}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-1 text-[12px] text-[var(--color-text-secondary)]">
                      <p>
                        Repo:{" "}
                        <span className="font-medium text-[var(--color-text)]">
                          {blog.repoFullName}
                        </span>
                      </p>
                      <p>
                        Language:{" "}
                        <span className="font-medium text-[var(--color-text)]">
                          {blog.language}
                        </span>{" "}
                        · Stars:{" "}
                        <span className="font-medium text-[var(--color-text)]">
                          {blog.stars}
                        </span>
                      </p>
                      <p>
                        Created:{" "}
                        <span className="font-medium text-[var(--color-text)]">
                          {blog.date}
                        </span>{" "}
                        · AI rewritten:{" "}
                        <span className="font-medium text-[var(--color-text)]">
                          {blog.aiRewritten ? "Yes" : "No"}
                        </span>
                      </p>
                      <p className="truncate">
                        Slug:{" "}
                        <span className="font-medium text-[var(--color-text)]">
                          {blog.slug}
                        </span>
                      </p>
                      <p className="truncate">
                        URL:{" "}
                        <span className="font-medium text-[var(--color-text)]">
                          {blog.repoUrl}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleWriteWithAi(blog.slug)}
                    disabled={actionSlug !== null}
                    className="inline-flex h-8 items-center justify-center rounded-full px-3 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-500/10 disabled:opacity-50"
                  >
                    <PenSquare size={14} className="mr-1" />
                    {actionSlug === blog.slug
                      ? actionProgress?.slug === blog.slug &&
                        actionProgress.kind === "write"
                        ? `${actionProgress.percent}%`
                        : "Working..."
                      : blog.status === "draft"
                        ? "Write with AI"
                        : "Rewrite again"}
                  </button>
                  <button
                    onClick={() => handleCreateThumbnail(blog.slug)}
                    disabled={actionSlug !== null}
                    className="inline-flex h-8 items-center justify-center rounded-full px-3 text-xs font-medium text-violet-600 transition-colors hover:bg-violet-500/10 disabled:opacity-50"
                  >
                    <ImagePlus size={14} className="mr-1" />
                    {actionSlug === blog.slug
                      ? actionProgress?.slug === blog.slug &&
                        actionProgress.kind === "thumbnail"
                        ? `${actionProgress.percent}%`
                        : "Working..."
                      : blog.coverImage
                        ? "Regenerate thumbnail"
                        : "Create thumbnail with AI"}
                  </button>
                  <button
                    onClick={() => handleShareFacebook(blog)}
                    title="Share lên Facebook"
                    className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-blue-500/10 text-blue-600 transition-colors"
                  >
                    <Share2 size={16} />
                  </button>
                  <button
                    onClick={() => handleCopyContent(blog)}
                    title="Copy nội dung (plain text, không markdown)"
                    className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-amber-500/10 text-amber-600 transition-colors"
                  >
                    {copiedSlug === blog.slug ? (
                      <Check size={16} className="text-emerald-500" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                  <Button
                    href={`/blogs/${blog.slug}`}
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full border-none hover:bg-[var(--color-bg-alt)] text-[var(--color-text-secondary)]"
                  >
                    <Eye size={16} />
                  </Button>
                  <button
                    onClick={() => handleEdit(blog)}
                    className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-blue-500/10 text-blue-500 transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(blog.slug)}
                    className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-red-500/10 text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BlogFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editing}
        onSave={handleSave}
      />
    </div>
  );
}

interface BlogFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: BlogPost | null;
  onSave: (data: BlogFormData) => void;
}

function BlogFormModal({
  isOpen,
  onClose,
  initialData,
  onSave,
}: BlogFormModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<BlogFormData>({
    ...createEmptyBlogFormData(),
    ...initialData,
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (initialData) {
      setFormData({
        ...createEmptyBlogFormData(),
        ...initialData,
        summary: initialData.summary || initialData.description || "",
        description: initialData.description || initialData.summary || "",
        content: initialData.content || "",
        coverImage: initialData.coverImage || initialData.image || "",
        image: initialData.image || initialData.coverImage || "",
      });
      return;
    }

    setFormData(createEmptyBlogFormData());
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleCoverUpload = async (file: File) => {
    if (!user) {
      throw new Error("Bạn cần đăng nhập lại để upload ảnh bìa");
    }

    const userToken = await user.getIdToken();
    const payload = new FormData();
    payload.append("file", file);
    payload.append("slug", formData.slug || formData.title || "manual-blog");

    const response = await fetch("/api/admin/blogs/upload-cover", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
      body: payload,
    });

    const data = (await response.json()) as {
      ok: boolean;
      coverImage?: string;
      error?: string;
    };

    if (!response.ok || !data.ok || !data.coverImage) {
      throw new Error(data.error || "Upload cover failed");
    }

    setFormData((current) => ({
      ...current,
      coverImage: data.coverImage!,
      image: data.coverImage!,
    }));

    return data.coverImage;
  };

  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Blog Post" : "New Blog Post"}
      actions={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Save Post
          </Button>
        </>
      }
    >
      <form className="space-y-5">
        <div>
          <label className="block typo-caption font-semibold mb-2">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3 typo-body outline-none"
            placeholder="Blog post title"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block typo-caption font-semibold mb-2">
              Author
            </label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) =>
                setFormData({ ...formData, author: e.target.value })
              }
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3 typo-body outline-none"
            />
          </div>
          <div>
            <label className="block typo-caption font-semibold mb-2">
              Category
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3 typo-body outline-none"
              placeholder="e.g. Huong dan"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block typo-caption font-semibold mb-2">
              Image URL
            </label>
            <input
              type="text"
              value={formData.image}
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.value })
              }
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3 typo-body outline-none"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block typo-caption font-semibold mb-2">
              Read Time
            </label>
            <input
              type="text"
              value={formData.readTime}
              onChange={(e) =>
                setFormData({ ...formData, readTime: e.target.value })
              }
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3 typo-body outline-none"
              placeholder="8 phut doc"
            />
          </div>
        </div>

        <FileUploader
          accept="image/*"
          currentUrl={formData.coverImage || formData.image}
          label="Upload cover image (manual, no AI token used)"
          onUpload={handleCoverUpload}
        />
        <p className="text-xs text-[var(--color-text-secondary)]">
          Admin có thể tự upload ảnh bìa để tiết kiệm token thay vì dùng AI tạo
          thumbnail.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block typo-caption font-semibold mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as BlogPost["status"],
                  aiRewritten: e.target.value === "active",
                })
              }
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3 typo-body outline-none"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
            </select>
          </div>
          <div>
            <label className="block typo-caption font-semibold mb-2">
              Repo Full Name
            </label>
            <input
              type="text"
              value={formData.repoFullName}
              onChange={(e) =>
                setFormData({ ...formData, repoFullName: e.target.value })
              }
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3 typo-body outline-none"
              placeholder="owner/repo"
            />
          </div>
        </div>

        <div>
          <label className="block typo-caption font-semibold mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({
                ...formData,
                description: e.target.value,
                summary: e.target.value,
              })
            }
            className="w-full h-20 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3 typo-body outline-none resize-none"
            placeholder="Short description"
          />
        </div>

        <div>
          <label className="block typo-caption font-semibold mb-2">
            Content (Markdown)
          </label>
          <textarea
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            className="w-full h-48 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3 typo-body outline-none resize-none font-mono text-sm"
            placeholder="# Title&#10;&#10;Content in markdown..."
          />
        </div>
      </form>
    </SimpleModal>
  );
}
