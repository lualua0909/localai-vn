"use client";

import { useState, useEffect } from "react";
import type { BlogPost } from "@/lib/blog-data";
import {
  getBlogs,
  addBlog,
  updateBlog,
  deleteBlog,
} from "@/lib/firestore";
import { Plus, Edit2, Trash2, Eye } from "lucide-react";
import { SimpleModal } from "@/components/ui/SimpleModal";
import { Button } from "@/components/ui/Button";

type BlogFormData = Omit<BlogPost, "slug"> & { slug?: string };

export function BlogManager() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const data = await getBlogs();
      setBlogs(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

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

    const blogPost: BlogPost = { ...data, slug };

    if (editing) {
      await updateBlog(editing.slug, blogPost);
    } else {
      await addBlog(blogPost);
    }
    setIsModalOpen(false);
    setEditing(null);
    await fetchBlogs();
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
      <div className="flex items-center justify-between">
        <h2 className="typo-h2">Blog Posts ({blogs.length})</h2>
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
                className="px-6 py-5 flex items-center justify-between gap-4 group hover:bg-[var(--color-bg-alt)]/50 transition-colors"
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
                    <div className="flex items-center gap-3 mt-1">
                      <span className="typo-caption text-[var(--color-text-secondary)]">
                        {blog.author}
                      </span>
                      <span className="typo-caption text-[var(--color-text-secondary)]">
                        {blog.date}
                      </span>
                      <span className="typo-caption px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                        {blog.category}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    href={`/blog/${blog.slug}`}
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
  const [formData, setFormData] = useState<BlogFormData>({
    title: "",
    description: "",
    image: "",
    author: "",
    date: new Date().toLocaleDateString("vi-VN"),
    category: "",
    readTime: "5 phut doc",
    content: "",
    ...initialData,
  });

  if (!isOpen && initialData && formData.slug !== initialData.slug) {
    setFormData({ ...initialData });
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
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

        <div>
          <label className="block typo-caption font-semibold mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
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
